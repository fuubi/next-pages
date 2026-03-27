import { execa } from 'execa';
import ora from 'ora';
import chalk from 'chalk';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import {
  getWorkspaceRoot,
  getSharedVersionWorktreePath,
  isSharedVersionCheckedOut,
  getLatestSharedVersion
} from '../utils/workspace.ts';

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

    // Step 2: Setup shared library worktree
    spinner.start(`Setting up shared lib ${client.sharedLibVersion}...`);

    // Determine actual version to use
    let actualVersion = client.sharedLibVersion;
    if (client.sharedLibVersion === 'latest') {
      const latestTag = await getLatestSharedVersion();
      if (!latestTag) {
        throw new Error('No version tags found in repository. Please create a version tag first.');
      }
      actualVersion = latestTag;
      spinner.info(`Latest version resolved to ${chalk.cyan(actualVersion)}`);
    }

    // Check if shared version worktree already exists
    const sharedVersionPath = getSharedVersionWorktreePath(client.sharedLibVersion);

    if (!isSharedVersionCheckedOut(client.sharedLibVersion)) {
      spinner.text = `Creating shared worktree at ${client.sharedLibVersion}...`;

      // Fetch tags to ensure we have the version
      await execa('git', ['fetch', 'origin', '--tags'], { cwd: workspaceRoot });

      // Create the worktree at the specific version tag
      await execa('git', ['worktree', 'add', sharedVersionPath, actualVersion], {
        cwd: workspaceRoot,
      });

      spinner.succeed(`Created shared worktree at ${sharedVersionPath}`);
    } else {
      spinner.info(`Shared worktree ${client.sharedLibVersion} already exists at ${sharedVersionPath}`);
    }

    // Step 3: Update client's package.json to use file: protocol
    spinner.start('Updating package.json...');
    const packageJsonPath = join(clientPath, 'package.json');

    if (existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));

      if (!packageJson.dependencies) {
        packageJson.dependencies = {};
      }

      // Update the shared library reference to use file: protocol
      const relativeSharedPath = client.sharedLibVersion === 'latest'
        ? '../../packages/shared-latest'
        : `../../packages/shared-${client.sharedLibVersion}`;

      packageJson.dependencies['@colombalink/shared'] = `file:${relativeSharedPath}`;

      writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n', 'utf-8');
      spinner.succeed('Updated package.json with file: protocol reference');
    } else {
      spinner.warn('package.json not found in client worktree');
    }

    spinner.succeed(
      chalk.green(
        `✓ Successfully checked out ${clientName} with shared lib ${client.sharedLibVersion}${client.sharedLibVersion === 'latest' ? ` (${actualVersion})` : ''}`
      )
    );

    console.log();
    console.log(chalk.bold('Client workspace:'));
    console.log(chalk.cyan(`  ${clientPath}`));
    console.log();
    console.log(chalk.bold('Shared library:'));
    console.log(chalk.cyan(`  ${sharedVersionPath}`));
    console.log(chalk.dim(`  Version: ${client.sharedLibVersion}${client.sharedLibVersion === 'latest' ? ` (currently ${actualVersion})` : ''}`));
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
