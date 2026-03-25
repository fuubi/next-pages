import { execa } from 'execa';
import ora from 'ora';
import chalk from 'chalk';
import { existsSync, readFileSync, writeFileSync } from 'fs';
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
 * Upgrade the shared library version for a specific client
 * Updates both the worktree and the clients.json registry
 */
export async function upgradeSharedLib(clientName: string, newVersion: string) {
  const spinner = ora(`Upgrading shared library for ${clientName}...`).start();

  try {
    const workspaceRoot = getWorkspaceRoot();
    const clientsJsonPath = join(workspaceRoot, 'clients.json');
    const clientPath = join(workspaceRoot, 'sites', clientName);
    const sharedLibPath = join(clientPath, 'src', 'shared');

    // Load clients registry
    if (!existsSync(clientsJsonPath)) {
      throw new Error('clients.json not found. Is this a coordinator repository?');
    }

    const registry: ClientsRegistry = JSON.parse(
      readFileSync(clientsJsonPath, 'utf-8')
    );

    // Find client in registry
    const clientIndex = registry.clients.findIndex((c) => c.name === clientName);
    if (clientIndex === -1) {
      throw new Error(
        `Client '${clientName}' not found in registry. Available clients: ${registry.clients.map((c) => c.name).join(', ')}`
      );
    }

    const client = registry.clients[clientIndex];
    const oldVersion = client.sharedLibVersion;

    // Validate version format
    if (!/^v\d+\.\d+\.\d+/.test(newVersion)) {
      throw new Error(
        `Invalid version format: ${newVersion}. Expected format: v1.0.0`
      );
    }

    // Check if client is checked out
    if (!existsSync(clientPath)) {
      spinner.warn(
        chalk.yellow(
          `Client ${clientName} is not currently checked out. Only updating registry.`
        )
      );

      // Update registry only
      registry.clients[clientIndex].sharedLibVersion = newVersion;
      writeFileSync(clientsJsonPath, JSON.stringify(registry, null, 2) + '\n');

      spinner.succeed(
        chalk.green(
          `✓ Updated ${clientName} shared lib version: ${oldVersion} → ${newVersion}`
        )
      );
      console.log();
      console.log(
        chalk.dim(
          `Next time you checkout ${clientName}, it will use ${newVersion}`
        )
      );
      return;
    }

    // Check if shared lib worktree exists
    if (!existsSync(sharedLibPath)) {
      throw new Error(
        `Shared library worktree not found at ${sharedLibPath}. The client checkout may be incomplete.`
      );
    }

    // Check for uncommitted changes in shared lib
    spinner.text = 'Checking for uncommitted changes in shared library...';
    try {
      const { stdout: status } = await execa('git', ['status', '--porcelain'], {
        cwd: sharedLibPath,
      });

      if (status.trim()) {
        throw new Error(
          'Uncommitted changes detected in shared library. Shared lib should be read-only. Please discard changes first.'
        );
      }
    } catch (error: any) {
      if (error.message.includes('Uncommitted changes')) {
        throw error;
      }
      console.log(chalk.dim('Unable to check git status, continuing...'));
    }

    // Fetch latest tags from shared lib repo
    spinner.text = 'Fetching latest versions from shared library...';
    await execa('git', ['fetch', 'shared-lib', '--tags'], {
      cwd: clientPath,
    });

    // Check if the new version tag exists
    try {
      await execa('git', ['rev-parse', `tags/${newVersion}`], {
        cwd: clientPath,
      });
    } catch (error) {
      throw new Error(
        `Version tag ${newVersion} not found in shared library repository. Available versions: run 'git tag -l' in shared lib repo.`
      );
    }

    // Show what changed between versions
    spinner.text = 'Analyzing changes...';
    try {
      const { stdout: diff } = await execa(
        'git',
        ['log', '--oneline', `${oldVersion}..${newVersion}`],
        { cwd: sharedLibPath }
      );

      if (diff.trim()) {
        console.log();
        console.log(chalk.bold('Changes between versions:'));
        console.log(chalk.cyan(diff));
        console.log();
      }
    } catch (error) {
      console.log(chalk.dim('Unable to show version diff'));
    }

    // Update the shared lib worktree to the new version
    spinner.text = `Switching to ${newVersion}...`;
    await execa('git', ['checkout', newVersion], {
      cwd: sharedLibPath,
    });

    // Update the registry
    registry.clients[clientIndex].sharedLibVersion = newVersion;
    writeFileSync(clientsJsonPath, JSON.stringify(registry, null, 2) + '\n');

    spinner.succeed(
      chalk.green(
        `✓ Upgraded ${clientName} shared lib: ${oldVersion} → ${newVersion}`
      )
    );

    console.log();
    console.log(chalk.bold('Updated:'));
    console.log(chalk.cyan(`  Worktree: ${sharedLibPath}`));
    console.log(chalk.cyan(`  Registry: ${clientsJsonPath}`));
    console.log();
    console.log(chalk.dim('Test your client site to ensure compatibility.'));
    console.log(
      chalk.dim('Commit and push changes to the client branch when ready.')
    );
  } catch (error: any) {
    spinner.fail(chalk.red(`Failed to upgrade shared library for ${clientName}`));
    console.error(chalk.red(error.message));
    if (error.stderr) {
      console.error(chalk.dim(error.stderr));
    }
    process.exit(1);
  }
}

/**
 * List available shared library versions
 */
export async function listSharedLibVersions() {
  const spinner = ora('Fetching available shared library versions...').start();

  try {
    const workspaceRoot = getWorkspaceRoot();
    const clientsJsonPath = join(workspaceRoot, 'clients.json');

    // Load clients registry to get shared lib repo
    if (!existsSync(clientsJsonPath)) {
      throw new Error('clients.json not found. Is this a coordinator repository?');
    }

    const registry: ClientsRegistry = JSON.parse(
      readFileSync(clientsJsonPath, 'utf-8')
    );

    if (registry.clients.length === 0) {
      throw new Error('No clients in registry');
    }

    const sharedLibRepo = registry.clients[0].sharedLibRepo;

    // Fetch tags from shared lib repo
    const { stdout } = await execa('git', [
      'ls-remote',
      '--tags',
      '--sort=-v:refname',
      sharedLibRepo,
    ]);

    // Parse tags
    const tags = stdout
      .split('\n')
      .map((line) => {
        const match = line.match(/refs\/tags\/(v\d+\.\d+\.\d+)/);
        return match ? match[1] : null;
      })
      .filter((tag): tag is string => tag !== null);

    spinner.succeed('Available shared library versions:');
    console.log();

    if (tags.length === 0) {
      console.log(chalk.dim('No version tags found'));
      return;
    }

    // Show currently used versions
    const usedVersions = new Set(
      registry.clients.map((c) => c.sharedLibVersion)
    );

    tags.forEach((tag) => {
      const isUsed = usedVersions.has(tag);
      const marker = isUsed ? chalk.green('●') : chalk.dim('○');
      const label = isUsed ? chalk.green(tag) : chalk.dim(tag);
      console.log(`  ${marker} ${label}${isUsed ? chalk.dim(' (in use)') : ''}`);
    });

    console.log();
    console.log(chalk.dim(`Total versions: ${tags.length}`));
  } catch (error: any) {
    spinner.fail(chalk.red('Failed to fetch shared library versions'));
    console.error(chalk.red(error.message));
    process.exit(1);
  }
}
