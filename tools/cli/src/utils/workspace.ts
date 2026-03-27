import { existsSync, readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { execa } from 'execa';

export interface ClientConfig {
    name: string;
    branch: string;
    sharedLibVersion: string;
    sharedLibRepo: string;
    domain?: string;
    language?: string;
    created?: string;
    notes?: string;
}

export interface ClientsRegistry {
    clients: ClientConfig[];
}

/**
 * Find the workspace root directory (coordinator branch)
 * Works whether CLI is run from root or from tools/cli
 * Now looks for clients.json instead of sites/packages
 */
export function getWorkspaceRoot(): string {
    // Check if we're already in the workspace root (coordinator branch has clients.json)
    if (existsSync(join(process.cwd(), 'clients.json'))) {
        return process.cwd();
    }

    // Check parent directories
    let currentDir = process.cwd();
    for (let i = 0; i < 5; i++) {
        const parentDir = join(currentDir, '..');
        if (existsSync(join(parentDir, 'clients.json'))) {
            return parentDir;
        }
        currentDir = parentDir;
    }

    // Fallback: assume we're in tools/cli and go up 2 levels
    return join(process.cwd(), '..', '..');
}

/**
 * Read the clients.json registry
 */
export function getClientsRegistry(): ClientsRegistry {
    const root = getWorkspaceRoot();
    const registryPath = join(root, 'clients.json');

    if (!existsSync(registryPath)) {
        throw new Error('clients.json not found. Are you in the coordinator branch?');
    }

    const content = readFileSync(registryPath, 'utf-8');
    return JSON.parse(content);
}

/**
 * Write the clients.json registry
 */
export function saveClientsRegistry(registry: ClientsRegistry): void {
    const root = getWorkspaceRoot();
    const registryPath = join(root, 'clients.json');
    writeFileSync(registryPath, JSON.stringify(registry, null, 2) + '\n', 'utf-8');
}

/**
 * Get a specific client configuration
 */
export function getClientConfig(clientName: string): ClientConfig | undefined {
    const registry = getClientsRegistry();
    return registry.clients.find(c => c.name === clientName);
}

/**
 * Add or update a client in the registry
 */
export function upsertClientConfig(client: ClientConfig): void {
    const registry = getClientsRegistry();
    const index = registry.clients.findIndex(c => c.name === client.name);

    if (index >= 0) {
        registry.clients[index] = client;
    } else {
        registry.clients.push(client);
    }

    saveClientsRegistry(registry);
}

/**
 * Check if a client is currently checked out (worktree exists)
 */
export function isClientCheckedOut(clientName: string): boolean {
    const root = getWorkspaceRoot();
    const sitesDir = join(root, 'sites', clientName);
    return existsSync(sitesDir);
}

/**
 * Get list of all checked out clients
 */
export function getCheckedOutClients(): string[] {
    const root = getWorkspaceRoot();
    const sitesDir = join(root, 'sites');

    if (!existsSync(sitesDir)) {
        return [];
    }

    return readdirSync(sitesDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);
}

/**
 * Get the path where a client's worktree should be
 */
export function getClientWorktreePath(clientName: string): string {
    const root = getWorkspaceRoot();
    return join(root, 'sites', clientName);
}

/**
 * Get the path where a client's shared lib worktree should be (nested)
 */
export function getSharedLibWorktreePath(clientName: string): string {
    return join(getClientWorktreePath(clientName), 'src', 'shared');
}

/**
 * Get the path for a version-specific shared worktree
 * @param version - Version string (e.g., "v1.0.0") or "latest"
 */
export function getSharedVersionWorktreePath(version: string): string {
    const root = getWorkspaceRoot();
    if (version === 'latest') {
        return join(root, 'packages', 'shared-latest');
    }
    return join(root, 'packages', `shared-${version}`);
}

/**
 * Check if a specific shared version worktree is checked out
 * @param version - Version string (e.g., "v1.0.0") or "latest"
 */
export function isSharedVersionCheckedOut(version: string): boolean {
    const path = getSharedVersionWorktreePath(version);
    return existsSync(path);
}

/**
 * Get list of all checked out shared version worktrees
 * Returns version strings (e.g., ["v1.0.0", "v1.1.0", "latest"])
 */
export function getCheckedOutSharedVersions(): string[] {
    const root = getWorkspaceRoot();
    const packagesDir = join(root, 'packages');

    if (!existsSync(packagesDir)) {
        return [];
    }

    const versions: string[] = [];
    const entries = readdirSync(packagesDir, { withFileTypes: true });

    for (const entry of entries) {
        if (entry.isDirectory()) {
            if (entry.name === 'shared-latest') {
                versions.push('latest');
            } else if (entry.name.startsWith('shared-v')) {
                // Extract version from "shared-v1.0.0" -> "v1.0.0"
                const version = entry.name.substring('shared-'.length);
                versions.push(version);
            }
        }
    }

    return versions;
}

/**
 * Get the shared library version that a client is using
 * Reads from client's package.json file: protocol reference
 * @param clientName - Name of the client
 * @returns Version string (e.g., "v1.0.0" or "latest") or undefined if not found
 */
export function getClientSharedVersion(clientName: string): string | undefined {
    const clientPath = getClientWorktreePath(clientName);
    const packageJsonPath = join(clientPath, 'package.json');

    if (!existsSync(packageJsonPath)) {
        return undefined;
    }

    try {
        const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
        const sharedDep = packageJson.dependencies?.['@colombalink/shared'];

        if (!sharedDep || !sharedDep.startsWith('file:')) {
            return undefined;
        }

        // Extract version from "file:../../packages/shared-v1.0.0" or "file:../../packages/shared-latest"
        const match = sharedDep.match(/packages\/shared-(.+)$/);
        if (match) {
            return match[1]; // Returns "v1.0.0" or "latest"
        }

        return undefined;
    } catch (error) {
        return undefined;
    }
}

/**
 * Get the highest semantic version tag from the repository
 * Fetches tags and returns the latest version (e.g., "v1.2.3")
 * @returns Latest version tag or undefined if no tags found
 */
export async function getLatestSharedVersion(): Promise<string | undefined> {
    const root = getWorkspaceRoot();

    try {
        // Fetch tags from origin
        await execa('git', ['fetch', 'origin', '--tags'], { cwd: root });

        // Get all tags and filter for version tags (v*.*.*)
        const { stdout } = await execa('git', ['tag', '-l', 'v*.*.*'], { cwd: root });

        if (!stdout) {
            return undefined;
        }

        const tags = stdout.split('\n').filter(tag => tag.trim());

        if (tags.length === 0) {
            return undefined;
        }

        // Sort tags by semantic versioning (simple sort works for v*.*.* format)
        tags.sort((a, b) => {
            const parseVersion = (tag: string) => {
                const match = tag.match(/v(\d+)\.(\d+)\.(\d+)/);
                if (!match) return [0, 0, 0];
                return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])];
            };

            const [aMajor, aMinor, aPatch] = parseVersion(a);
            const [bMajor, bMinor, bPatch] = parseVersion(b);

            if (aMajor !== bMajor) return bMajor - aMajor;
            if (aMinor !== bMinor) return bMinor - aMinor;
            return bPatch - aPatch;
        });

        return tags[0]; // Return highest version
    } catch (error) {
        return undefined;
    }
}

/**
 * Get the current version that the shared-latest worktree is on
 * @returns Current version tag (e.g., "v1.2.0") or undefined if worktree doesn't exist
 */
export async function getCurrentLatestWorktreeVersion(): Promise<string | undefined> {
    const latestPath = getSharedVersionWorktreePath('latest');

    if (!existsSync(latestPath)) {
        return undefined;
    }

    try {
        const { stdout } = await execa('git', ['-C', latestPath, 'describe', '--tags', '--exact-match'], {
            cwd: getWorkspaceRoot()
        });

        return stdout.trim();
    } catch (error) {
        // If not on an exact tag, try to get the latest tag
        try {
            const { stdout } = await execa('git', ['-C', latestPath, 'describe', '--tags', '--abbrev=0'], {
                cwd: getWorkspaceRoot()
            });
            return stdout.trim();
        } catch {
            return undefined;
        }
    }
}
