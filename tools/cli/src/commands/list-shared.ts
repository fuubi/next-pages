import { execa } from 'execa';
import ora from 'ora';
import chalk from 'chalk';
import { existsSync } from 'fs';
import {
    getWorkspaceRoot,
    getCheckedOutSharedVersions,
    getSharedVersionWorktreePath,
    getCheckedOutClients,
    getClientConfig,
    getLatestSharedVersion,
    getCurrentLatestWorktreeVersion,
} from '../utils/workspace.ts';

/**
 * List all checked-out shared library versions with details
 */
export async function listSharedVersions() {
    const spinner = ora('Loading shared versions...').start();

    try {
        const workspaceRoot = getWorkspaceRoot();
        const checkedOutVersions = getCheckedOutSharedVersions();
        const checkedOutClients = getCheckedOutClients();

        if (checkedOutVersions.length === 0) {
            spinner.info('No shared versions checked out.');
            console.log();
            console.log(chalk.dim('Shared version worktrees are created automatically when checking out clients.'));
            return;
        }

        spinner.succeed(`Found ${checkedOutVersions.length} checked-out shared version(s)`);
        console.log();

        // Build version -> clients map
        const versionClientsMap = new Map<string, string[]>();
        for (const clientName of checkedOutClients) {
            const config = getClientConfig(clientName);
            if (config?.sharedLibVersion) {
                if (!versionClientsMap.has(config.sharedLibVersion)) {
                    versionClientsMap.set(config.sharedLibVersion, []);
                }
                versionClientsMap.get(config.sharedLibVersion)!.push(clientName);
            }
        }

        // Fetch latest available version for comparison
        const latestAvailableVersion = await getLatestSharedVersion();

        // Display each version
        for (const version of checkedOutVersions) {
            const versionPath = getSharedVersionWorktreePath(version);
            const clients = versionClientsMap.get(version) || [];

            console.log(chalk.bold.cyan(`${version === 'latest' ? '✨ latest' : `📦 ${version}`}`));
            console.log(chalk.gray(`   Path: ${versionPath}`));

            // Show actual version for "latest"
            if (version === 'latest') {
                const currentVersion = await getCurrentLatestWorktreeVersion();
                if (currentVersion) {
                    console.log(chalk.gray(`   Currently: ${currentVersion}`));

                    // Check if there's a newer version available
                    if (latestAvailableVersion && currentVersion !== latestAvailableVersion) {
                        console.log(chalk.yellow(`   ⚠ Newer version available: ${latestAvailableVersion}`));
                        if (clients.length > 0) {
                            console.log(chalk.dim(`   Run: cli upgrade-shared ${clients[0]} latest`));
                        }
                    }
                }
            }

            // Show git status
            try {
                const { stdout: status } = await execa('git', ['-C', versionPath, 'status', '--porcelain'], {
                    cwd: workspaceRoot
                });

                if (status.trim()) {
                    console.log(chalk.yellow(`   Status: Modified (uncommitted changes)`));
                } else {
                    console.log(chalk.green(`   Status: Clean`));
                }
            } catch (error) {
                console.log(chalk.gray(`   Status: Unknown`));
            }

            // Show clients using this version
            if (clients.length > 0) {
                console.log(chalk.gray(`   Used by: ${clients.length} client${clients.length > 1 ? 's' : ''} (${clients.join(', ')})`));
            } else {
                console.log(chalk.dim(`   Used by: none (orphaned)`));
            }

            console.log();
        }

        // Show available tags from remote
        console.log(chalk.bold('Available Version Tags'));
        spinner.start('Fetching tags...');

        try {
            await execa('git', ['fetch', 'origin', '--tags'], { cwd: workspaceRoot });
            const { stdout: tags } = await execa('git', ['tag', '-l', 'v*.*.*'], { cwd: workspaceRoot });

            const tagList = tags.split('\n').filter(t => t.trim());

            if (tagList.length > 0) {
                spinner.succeed(`${tagList.length} version tags found`);

                // Show latest 10 tags
                const recentTags = tagList.slice(-10).reverse();
                console.log(chalk.gray('  Recent tags:'));
                for (const tag of recentTags) {
                    const isCheckedOut = checkedOutVersions.includes(tag);
                    const marker = isCheckedOut ? chalk.green('✓') : chalk.dim('○');
                    console.log(`  ${marker} ${tag}`);
                }

                if (tagList.length > 10) {
                    console.log(chalk.dim(`  ... and ${tagList.length - 10} more`));
                }
            } else {
                spinner.info('No version tags found');
            }
        } catch (error) {
            spinner.warn('Could not fetch tags');
        }

        console.log();
        console.log(chalk.dim('💡 Use `cli upgrade-shared <client> <version>` to change versions.'));
        console.log(chalk.dim('   Use `cli close <client> --clean-unused-shared` to remove orphaned versions.'));

    } catch (error: any) {
        spinner.fail('Failed to list shared versions');
        console.error(chalk.red(error.message));
        process.exit(1);
    }
}
