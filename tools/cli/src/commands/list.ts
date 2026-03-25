import { existsSync, readdirSync, statSync, readFileSync } from 'fs';
import { join } from 'path';
import chalk from 'chalk';
import {
    getWorkspaceRoot,
    getClientsRegistry,
    getCheckedOutClients,
} from '../utils/workspace.js';

interface ListOptions {
    checkedOutOnly?: boolean;
    availableOnly?: boolean;
}

export async function listSites(options: ListOptions = {}) {
    try {
        const registry = getClientsRegistry();
        const checkedOut = getCheckedOutClients();

        if (registry.clients.length === 0) {
            console.log(chalk.yellow('No clients registered. Create one with: cli create <name>'));
            return;
        }

        // Filter based on options
        let clientsToShow = registry.clients;
        
        if (options.checkedOutOnly) {
            clientsToShow = registry.clients.filter(c => checkedOut.includes(c.name));
        } else if (options.availableOnly) {
            clientsToShow = registry.clients.filter(c => !checkedOut.includes(c.name));
        }

        // Show checked out clients section
        if (!options.availableOnly) {
            const checkedOutClients = registry.clients.filter(c => checkedOut.includes(c.name));
            
            if (checkedOutClients.length > 0) {
                console.log(chalk.bold.green('\n✓ Checked Out Clients') + chalk.gray(` (${checkedOutClients.length})`));
                console.log('');
                
                for (const client of checkedOutClients) {
                    console.log(chalk.cyan(`  • ${client.name}`));
                    if (client.domain) {
                        console.log(chalk.gray(`    Domain: ${client.domain}`));
                    }
                    if (client.language) {
                        console.log(chalk.gray(`    Language: ${client.language}`));
                    }
                    console.log(chalk.gray(`    Shared lib: ${client.sharedLibVersion}`));
                    console.log(chalk.gray(`    Branch: ${client.branch}`));
                    const workspaceRoot = getWorkspaceRoot();
                    const clientPath = join(workspaceRoot, 'sites', client.name);
                    console.log(chalk.dim(`    Path: ${clientPath}`));
                    console.log('');
                }
            }
        }

        // Show available (not checked out) clients section
        if (!options.checkedOutOnly) {
            const availableClients = registry.clients.filter(c => !checkedOut.includes(c.name));
            
            if (availableClients.length > 0) {
                console.log(chalk.bold.blue('\n○ Available Clients') + chalk.gray(` (${availableClients.length})`));
                console.log('');
                
                for (const client of availableClients) {
                    console.log(chalk.cyan(`  • ${client.name}`));
                    if (client.domain) {
                        console.log(chalk.gray(`    Domain: ${client.domain}`));
                    }
                    if (client.language) {
                        console.log(chalk.gray(`    Language: ${client.language}`));
                    }
                    console.log(chalk.gray(`    Shared lib: ${client.sharedLibVersion}`));
                    console.log(chalk.gray(`    Branch: ${client.branch}`));
                    console.log(chalk.dim(`    Run: cli checkout ${client.name}`));
                    console.log('');
                }
            }
        }

        // Summary
        console.log(chalk.bold('Summary'));
        console.log(chalk.gray(`  Total clients: ${registry.clients.length}`));
        console.log(chalk.gray(`  Checked out: ${checkedOut.length}`));
        console.log(chalk.gray(`  Available: ${registry.clients.length - checkedOut.length}`));
        console.log('');

        // Tips
        if (checkedOut.length > 0) {
            console.log(chalk.dim('Tip: You can work on multiple clients simultaneously.'));
            console.log(chalk.dim('     Each client is isolated in its own worktree.'));
        } else {
            console.log(chalk.dim('Tip: Check out a client with: cli checkout <name>'));
        }
        console.log('');

    } catch (error: any) {
        console.error(chalk.red('Error listing clients:'), error.message);
        process.exit(1);
    }
}
