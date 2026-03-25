import { execa } from 'execa';
import ora from 'ora';
import chalk from 'chalk';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { getWorkspaceRoot } from '../utils/workspace.ts';

/**
 * Close (remove) a client's worktree
 * Note: src/shared/ is a regular checkout, not a worktree, so it's removed with the client
 */
export async function closeClient(clientName: string) {
  const spinner = ora(`Closing ${clientName}...`).start();

  try {
    const workspaceRoot = getWorkspaceRoot();
    const clientPath = join(workspaceRoot, 'sites', clientName);

    // Check if client is checked out
    if (!existsSync(clientPath)) {
      spinner.warn(chalk.yellow(`Client ${clientName} is not checked out`));
      process.exit(0);
    }

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

    // Remove client worktree (this will remove src/shared/ as well since it's just files)
    spinner.text = 'Removing client worktree...';
    await execa('git', ['worktree', 'remove', clientPath], {
      cwd: workspaceRoot,
    });

    spinner.succeed(chalk.green(`✓ Successfully closed ${clientName}`));
    console.log();
    console.log(chalk.dim(`Worktree removed: ${clientPath}`));
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
 * Close all checked-out clients
 */
export async function closeAllClients() {
  const spinner = ora('Closing all checked-out clients...').start();

  try {
    const workspaceRoot = getWorkspaceRoot();
    const sitesDir = join(workspaceRoot, 'sites');

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

    // Close each client
    for (const worktree of worktrees) {
      const clientName = worktree.path?.split('/').pop();
      if (clientName) {
        await closeClient(clientName);
      }
    }

    spinner.succeed(chalk.green('✓ All clients closed'));
  } catch (error: any) {
    spinner.fail(chalk.red('Failed to close all clients'));
    console.error(chalk.red(error.message));
    process.exit(1);
  }
}
