import { existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

/**
 * Find the workspace root directory
 * Works whether CLI is run from root or from tools/cli
 */
export function getWorkspaceRoot(): string {
    // Check if we're already in the workspace root
    if (existsSync(join(process.cwd(), 'sites')) &&
        existsSync(join(process.cwd(), 'packages'))) {
        return process.cwd();
    }

    // Otherwise, assume we're in tools/cli and go up 2 levels
    // This handles the old way of running the CLI
    return join(process.cwd(), '..', '..');
}
