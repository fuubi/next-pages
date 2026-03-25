import { execa } from 'execa';
import ora from 'ora';
import chalk from 'chalk';
import { existsSync } from 'fs';
import { join } from 'path';
import { getWorkspaceRoot } from '../utils/workspace.ts';

/**
 * Sync worktrees to ensure they're at the correct versions
 */
export async function syncWorktrees() {
  const spinner = ora('Syncing worktrees...').start();

  try {
    const workspaceRoot = getWorkspaceRoot();
    const sharedPath = join(workspaceRoot, 'packages', 'shared');

    // Check if shared components worktree exists
    if (!existsSync(sharedPath)) {
      spinner.info('No shared components worktree found at packages/shared/');
      spinner.info('Run: git worktree add packages/shared shared/components');
      return;
    }

    // Sync shared components worktree
    spinner.text = 'Syncing packages/shared/ to latest shared/components...';
    
    try {
      await execa('git', ['-C', sharedPath, 'fetch', 'origin', 'shared/components'], {
        cwd: workspaceRoot
      });

      await execa('git', ['-C', sharedPath, 'checkout', 'shared/components'], {
        cwd: workspaceRoot
      });

      await execa('git', ['-C', sharedPath, 'pull', 'origin', 'shared/components'], {
        cwd: workspaceRoot
      });

      const { stdout: version } = await execa('git', ['-C', sharedPath, 'describe', '--tags', '--always'], {
        cwd: workspaceRoot
      });

      spinner.succeed(`${chalk.green('✓')} Shared components synced to ${chalk.cyan(version)}`);
    } catch (error) {
      spinner.warn(`Could not sync shared components: ${error.message}`);
    }

    console.log();
    console.log(chalk.dim('💡 Tip: Worktrees stay on their own branches independently.'));
    console.log(chalk.dim('   Run `cli sync` after switching branches to update them.'));

  } catch (error) {
    spinner.fail(`Failed to sync worktrees: ${error.message}`);
    process.exit(1);
  }
}
