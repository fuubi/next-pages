import { execa } from 'execa';
import ora from 'ora';
import chalk from 'chalk';
import { existsSync } from 'fs';
import { join } from 'path';
import {
    getWorkspaceRoot,
    getCheckedOutClients,
    getClientConfig,
    getSharedVersionWorktreePath,
    isSharedVersionCheckedOut,
    getLatestSharedVersion,
    getCurrentLatestWorktreeVersion,
} from '../utils/workspace.ts';

/**
 * Sync worktrees to ensure they're at the correct versions
 */
export async function syncWorktrees() {
    const spinner = ora('Syncing worktrees...').start();

    try {
        const workspaceRoot = getWorkspaceRoot();
        const checkedOutClients = getCheckedOutClients();

        if (checkedOutClients.length === 0) {
            spinner.info('No clients checked out. Nothing to sync.');
            return;
        }

        // Get unique shared versions used by checked-out clients
        const versionsToSync = new Set<string>();
        const versionClients = new Map<string, string[]>(); // version -> client names

        for (const clientName of checkedOutClients) {
            const config = getClientConfig(clientName);
            if (config && config.sharedLibVersion) {
                versionsToSync.add(config.sharedLibVersion);
                if (!versionClients.has(config.sharedLibVersion)) {
                    versionClients.set(config.sharedLibVersion, []);
                }
                versionClients.get(config.sharedLibVersion)!.push(clientName);
            }
        }

        if (versionsToSync.size === 0) {
            spinner.info('No shared versions to sync.');
            return;
        }

        spinner.succeed(`Found ${versionsToSync.size} shared version(s) to sync`);
        console.log('');

        // Fetch tags once upfront
        spinner.start('Fetching latest tags...');
        await execa('git', ['fetch', 'origin', '--tags'], { cwd: workspaceRoot });
        spinner.succeed('Tags fetched');

        const latestAvailableVersion = await getLatestSharedVersion();

        // Sync each version
        for (const version of versionsToSync) {
            const sharedPath = getSharedVersionWorktreePath(version);
            const clients = versionClients.get(version)!;

            if (!isSharedVersionCheckedOut(version)) {
                spinner.warn(`${chalk.yellow('⚠')} Shared version ${version} not checked out (used by: ${clients.join(', ')})`);
                continue;
            }

            spinner.start(`Syncing ${version}...`);

            try {
                if (version === 'latest') {
                    // For "latest", check if there's a newer version available
                    const currentVersion = await getCurrentLatestWorktreeVersion();

                    if (latestAvailableVersion && currentVersion !== latestAvailableVersion) {
                        spinner.warn(
                            `${chalk.yellow('⚠')} Newer version available: ${chalk.cyan(latestAvailableVersion)} ` +
                            `(currently on ${chalk.cyan(currentVersion || 'unknown')})`
                        );
                        console.log(chalk.dim(`  Used by: ${clients.join(', ')}`));
                        console.log(chalk.dim(`  Run: cli upgrade-shared ${clients[0]} latest`));
                    } else {
                        // Sync to current tag
                        if (currentVersion) {
                            await execa('git', ['-C', sharedPath, 'fetch', 'origin', '--tags'], {
                                cwd: workspaceRoot
                            });
                            await execa('git', ['-C', sharedPath, 'checkout', currentVersion], {
                                cwd: workspaceRoot
                            });
                            spinner.succeed(`${chalk.green('✓')} ${version} synced (${currentVersion}) - used by: ${clients.join(', ')}`);
                        } else {
                            spinner.info(`${version} - version unknown`);
                        }
                    }
                } else {
                    // For specific versions, ensure we're on the correct tag
                    await execa('git', ['-C', sharedPath, 'fetch', 'origin', '--tags'], {
                        cwd: workspaceRoot
                    });
                    await execa('git', ['-C', sharedPath, 'checkout', version], {
                        cwd: workspaceRoot
                    });
                    spinner.succeed(`${chalk.green('✓')} ${version} synced - used by: ${clients.join(', ')}`);
                }
            } catch (error: any) {
                spinner.fail(`Failed to sync ${version}: ${error.message}`);
            }
        }

        // Also sync development shared worktree if it exists
        const devSharedPath = join(workspaceRoot, 'packages', 'shared');
        if (existsSync(devSharedPath)) {
            console.log('');
            spinner.start('Syncing development worktree (packages/shared)...');
            try {
                await execa('git', ['-C', devSharedPath, 'fetch', 'origin', 'shared/components'], {
                    cwd: workspaceRoot
                });
                await execa('git', ['-C', devSharedPath, 'checkout', 'shared/components'], {
                    cwd: workspaceRoot
                });
                await execa('git', ['-C', devSharedPath, 'pull', 'origin', 'shared/components'], {
                    cwd: workspaceRoot
                });
                const { stdout: version } = await execa('git', ['-C', devSharedPath, 'describe', '--tags', '--always'], {
                    cwd: workspaceRoot
                });
                spinner.succeed(`${chalk.green('✓')} Development shared synced to ${chalk.cyan(version)}`);
            } catch (error: any) {
                spinner.warn(`Could not sync development shared: ${error.message}`);
            }
        }

        console.log('');
        console.log(chalk.dim('💡 Tip: Worktrees stay on their own versions independently.'));
        console.log(chalk.dim('   Run `cli sync` to check for updates.'));

    } catch (error: any) {
        spinner.fail(`Failed to sync worktrees: ${error.message}`);
        process.exit(1);
    }
}
