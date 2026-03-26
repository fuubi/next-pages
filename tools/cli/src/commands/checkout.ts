import { execa } from 'execa';
import ora from 'ora';
import chalk from 'chalk';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { getWorkspaceRoot } from '../utils/workspace.ts';

interface ClientConfig {
  name: string;
  branch: string;
  sharedLibVersion: string;
  sharedLibRepo: string;
  domain: string;
  language: string;
  created: string;
}

interface ClientsRegistry {
  clients: ClientConfig[];
}

/**
 * Checkout a client site as a worktree with extracted shared components
 * Supports multiple clients checked out simultaneously
 */
export async function checkoutClient(clientName: string) {
  const spinner = ora(`Checking out ${clientName}...`).start();

  try {
    const workspaceRoot = getWorkspaceRoot();
    const clientsJsonPath = join(workspaceRoot, 'clients.json');

    // Load clients registry
    if (!existsSync(clientsJsonPath)) {
      throw new Error('clients.json not found. Is this a coordinator repository?');
    }

    const registry: ClientsRegistry = JSON.parse(
      readFileSync(clientsJsonPath, 'utf-8')
    );

    // Find client in registry
    const client = registry.clients.find((c) => c.name === clientName);
    if (!client) {
      throw new Error(
        `Client '${clientName}' not found in registry. Available clients: ${registry.clients.map((c) => c.name).join(', ')}`
      );
    }

    const clientPath = join(workspaceRoot, 'sites', clientName);
    const sharedLibPath = join(clientPath, 'src', 'shared');

    // Check if client is already checked out
    if (existsSync(clientPath)) {
      spinner.warn(
        chalk.yellow(
          `Client ${clientName} is already checked out at ${clientPath}`
        )
      );
      spinner.info('Re-checking out will remove and recreate the worktrees');

      // Clean up existing worktrees
      spinner.text = 'Removing existing worktrees...';
      try {
        await execa('git', ['worktree', 'remove', clientPath, '--force'], {
          cwd: workspaceRoot,
        });
      } catch (error) {
        // Worktree might not be registered if manually deleted
        console.log(chalk.dim('Worktree not registered in git, continuing...'));
      }
    }

    // Step 1: Create worktree for client branch
    spinner.text = `Creating worktree for ${client.branch}...`;
    await execa('git', ['worktree', 'add', clientPath, client.branch], {
      cwd: workspaceRoot,
    });
    spinner.succeed(`Created client worktree at ${clientPath}`);

    // Step 2: Checkout shared lib at specific version (regular checkout, not worktree)
    spinner.start(`Checking out shared lib ${client.sharedLibVersion}...`);

    // Create src/shared directory
    await execa('mkdir', ['-p', sharedLibPath], { cwd: workspaceRoot });

    // Use git archive to extract the shared components at the specific tag
    // This is cleaner than nested worktrees and follows git best practices
    const sharedBranch = 'shared/components';

    try {
      // Fetch the shared/components branch if needed
      await execa('git', ['fetch', 'origin', sharedBranch], {
        cwd: workspaceRoot,
      });

      // Extract files from the tag/branch to the target directory
      const { stdout: archive } = await execa(
        'git',
        ['archive', '--format=tar', client.sharedLibVersion],
        { cwd: workspaceRoot }
      );

      // Extract the archive to src/shared
      await execa('tar', ['-x', '-C', sharedLibPath], {
        cwd: workspaceRoot,
        input: archive,
      });

    } catch (error: any) {
      spinner.fail(`Failed to checkout shared lib`);
      throw new Error(`Could not extract shared components at ${client.sharedLibVersion}: ${error.message}`);
    }

    // Step 3: Copy shared public assets to site's public directory (only if new)
    spinner.start('Setting up public assets...');
    const sitePublicDir = join(clientPath, 'public');
    const sharedPublicDir = join(sharedLibPath, 'public');
    
    try {
      if (existsSync(sharedPublicDir)) {
        // Create site's public directory if it doesn't exist
        if (!existsSync(sitePublicDir)) {
          await execa('mkdir', ['-p', sitePublicDir], { cwd: workspaceRoot });
          // Fresh checkout - copy all shared assets
          await execa('cp', ['-r', `${sharedPublicDir}/.`, sitePublicDir], { 
            cwd: workspaceRoot 
          });
          spinner.succeed('Shared public assets copied to site');
        } else {
          // Public directory exists (tracked in git) - don't overwrite
          spinner.info('Public directory exists - preserving site-specific assets');
        }
      } else {
        spinner.info('No shared public assets to copy');
      }
    } catch (error: any) {
      spinner.warn(`Could not setup public assets: ${error.message}`);
    }

    spinner.succeed(
      chalk.green(
        `✓ Successfully checked out ${clientName} with shared lib ${client.sharedLibVersion}`
      )
    );

    console.log();
    console.log(chalk.bold('Client workspace:'));
    console.log(chalk.cyan(`  ${clientPath}`));
    console.log();
    console.log(chalk.bold('Shared library:'));
    console.log(chalk.cyan(`  ${sharedLibPath}`));
    console.log(chalk.dim(`  Version: ${client.sharedLibVersion}`));
    console.log();
    console.log(chalk.dim('You can now work on this client independently.'));
    console.log(chalk.dim(`To check out additional clients, run: cli checkout <client-name>`));
    console.log(chalk.dim(`To close this client, run: cli close ${clientName}`));
  } catch (error: any) {
    spinner.fail(chalk.red(`Failed to checkout ${clientName}`));
    console.error(chalk.red(error.message));
    if (error.stderr) {
      console.error(chalk.dim(error.stderr));
    }
    process.exit(1);
  }
}
