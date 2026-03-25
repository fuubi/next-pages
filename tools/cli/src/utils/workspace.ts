import { existsSync, readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

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
