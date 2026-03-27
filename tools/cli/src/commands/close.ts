import { execa } from 'execa';
import ora from 'ora';
import chalk from 'chalk';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import {
  getWorkspaceRoot,
  getCheckedOutClients,
  getClientConfig,
  getSharedVersionWorktreePath,
} from '../utils/workspace.ts';

/**
 * Close (remove) a client's worktree
 * Note: Shared library is now in packages/shared-{version}, not nested
 */
export async function closeClient(clientName: string, options: { cleanUnusedShared?: boolean } = {}) {
  const spinner = ora(`Closing ${clientName}...`).start();

  try {
    const workspaceRoot = getWorkspaceRoot();
    const clientPath = join(workspaceRoot, 'sites', clientName);

    // Check if client is checked out
    if (!existsSync(clientPath)) {
      spinner.warn(chalk.yellow(`Client ${clientName} is not checked out`));
      process.exit(0);
    }

    // Get the shared library version used by this client before closing
    const clientConfig = getClientConfig(clientName);
    const sharedVersion = clientConfig?.sharedLibVersion;

    // Check for uncommitted changes in client worktree
    spinner.text = 'Checking for uncommitted changes...';
    try {
      const { stdout: clientStatus } = await execa('git', ['status', '--porcelain'], {
        cwd: clientPath,
      });

      if (clientStatus.trim()) {
        spinner.fail(chalk.red('Cannot close: uncommitted changes detected'));
        console.log();
        console.log(chalk.yellow('Uncommitted changes in client worktree:'));
        console.log(clientStatus);
        console.log();
        console.log(chalk.dim('Commit or stash your changes before closing.'));
        console.log(chalk.dim('To force close (discarding changes), run: git worktree remove --force'));
        process.exit(1);
      }
    } catch (error) {
      // If git status fails, the worktree might be corrupted
      console.log(chalk.dim('Unable to check git status, continuing...'));
    }

    // Remove client worktree
    spinner.text = 'Removing client worktree...';
    await execa('git', ['worktree', 'remove', clientPath], {
      cwd: workspaceRoot,
    });

    spinner.succeed(chalk.green(`✓ Successfully closed ${clientName}`));
    console.log();
    console.log(chalk.dim(`Worktree removed: ${clientPath}`));

    // Check if we should clean up unused shared versions
    if (options.cleanUnusedShared && sharedVersion) {
      await cleanupUnusedSharedVersions([sharedVersion], workspaceRoot);
    }
  } catch (error: any) {
    spinner.fail(chalk.red(`Failed to close ${clientName}`));
    console.error(chalk.red(error.message));
    if (error.stderr) {
      console.error(chalk.dim(error.stderr));
    }
    process.exit(1);
  }
}

/**
 * Check if a shared version is used by any remaining clients and remove if not
 */
async function cleanupUnusedSharedVersions(versionsToCheck: string[], workspaceRoot: string) {
  const spinner = ora('Checking for unused shared versions...').start();

  try {
    const remainingClients = getCheckedOutClients();
    const usedVersions = new Set<string>();

    // Check which versions are still in use
    for (const clientName of remainingClients) {
      const config = getClientConfig(clientName);
      if (config?.sharedLibVersion) {
        usedVersions.add(config.sharedLibVersion);
      }
    }

    // Remove unused shared version worktrees
    const removedVersions: string[] = [];
    for (const version of versionsToCheck) {
      if (!usedVersions.has(version)) {
        const sharedPath = getSharedVersionWorktreePath(version);
        if (existsSync(sharedPath)) {
          spinner.text = `Removing unused shared version: ${version}...`;
          try {
            await execa('git', ['worktree', 'remove', sharedPath, '--force'], {
              cwd: workspaceRoot,
            });
            removedVersions.push(version);
          } catch (error: any) {
            spinner.warn(`Could not remove ${version}: ${error.message}`);
          }
        }
      }
    }

    if (removedVersions.length > 0) {
      spinner.succeed(chalk.green(`✓ Cleaned up ${removedVersions.length} unused shared version(s): ${removedVersions.join(', ')}`));
    } else {
      spinner.info('No unused shared versions to clean up');
    }
  } catch (error: any) {
    spinner.warn(`Could not cleanup shared versions: ${error.message}`);
  }
}

/**
 * Close all checked-out clients
 */
export async function closeAllClients(options: { cleanUnusedShared?: boolean } = {}) {
  const spinner = ora('Closing all checked-out clients...').start();

  try {
    const workspaceRoot = getWorkspaceRoot();
    const sitesDir = join(workspaceRoot, 'sites');

    // Collect all shared versions in use before closing
    const checkedOutClients = getCheckedOutClients();
    const sharedVersionsToCheck = new Set<string>();
    for (const clientName of checkedOutClients) {
      const config = getClientConfig(clientName);
      if (config?.sharedLibVersion) {
        sharedVersionsToCheck.add(config.sharedLibVersion);
      }
    }

    // Get list of worktrees
    const { stdout } = await execa('git', ['worktree', 'list', '--porcelain'], {
      cwd: workspaceRoot,
    });

    // Parse worktree list to find client worktrees
    const worktrees = stdout
      .split('\n\n')
      .map((block) => {
        const lines = block.split('\n');
        const worktreePath = lines[0]?.replace('worktree ', '');
        const branch = lines[2]?.replace('branch ', '');
        return { path: worktreePath, branch };
      })
      .filter((wt) => wt.path?.startsWith(sitesDir));

    if (worktrees.length === 0) {
      spinner.info(chalk.dim('No clients are currently checked out'));
      return;
    }

    spinner.text = `Found ${worktrees.length} checked-out client(s)`;

    // Close each client (without individual cleanup)
    for (const worktree of worktrees) {
      const clientName = worktree.path?.split('/').pop();
      if (clientName) {
        await closeClient(clientName, { cleanUnusedShared: false });
      }
    }

    spinner.succeed(chalk.green('✓ All clients closed'));

    // Do cleanup at the end if requested
    if (options.cleanUnusedShared) {
      await cleanupUnusedSharedVersions(Array.from(sharedVersionsToCheck), workspaceRoot);
    }
  } catch (error: any) {
    spinner.fail(chalk.red('Failed to close all clients'));
    console.error(chalk.red(error.message));
    process.exit(1);
  }
}
