import { execa } from 'execa';
import ora from 'ora';
import chalk from 'chalk';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import {
  getWorkspaceRoot,
  getClientConfig,
  upsertClientConfig,
  getSharedVersionWorktreePath,
  isSharedVersionCheckedOut,
  getLatestSharedVersion,
  getCurrentLatestWorktreeVersion,
} from '../utils/workspace.ts';
import { normalizeSiteName } from '../utils/normalize.ts';

/**
 * Upgrade the shared library version for a specific client
 * Updates the version worktree and client's package.json reference
 */
export async function upgradeSharedLib(clientName: string, newVersion: string) {
  // Normalize site name (strip sites/ prefix for tab-completion support)
  clientName = normalizeSiteName(clientName);

  const spinner = ora(`Upgrading shared library for ${clientName}...`).start();

  try {
    const workspaceRoot = getWorkspaceRoot();
    const clientPath = join(workspaceRoot, 'sites', clientName);

    // Get client config
    const client = getClientConfig(clientName);
    if (!client) {
      throw new Error(
        `Client '${clientName}' not found in registry.`
      );
    }

    const oldVersion = client.sharedLibVersion;

    // Validate version format (unless it's "latest")
    if (newVersion !== 'latest' && !/^v\d+\.\d+\.\d+/.test(newVersion)) {
      throw new Error(
        `Invalid version format: ${newVersion}. Expected format: v1.0.0 or "latest"`
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
      upsertClientConfig({
        ...client,
        sharedLibVersion: newVersion,
      });

      // Commit the clients.json update
      await execa('git', ['add', 'clients.json'], { cwd: workspaceRoot });
      await execa('git', ['commit', '-m', `Upgrade ${clientName} shared lib to ${newVersion}`], { cwd: workspaceRoot });

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

    // Fetch latest tags
    spinner.text = 'Fetching latest versions...';
    await execa('git', ['fetch', 'origin', '--tags'], {
      cwd: workspaceRoot,
    });

    // Determine actual version to use
    let actualNewVersion = newVersion;
    if (newVersion === 'latest') {
      const latestTag = await getLatestSharedVersion();
      if (!latestTag) {
        throw new Error('No version tags found in repository.');
      }
      actualNewVersion = latestTag;
    }

    // Get old actual version if it was "latest"
    let actualOldVersion = oldVersion;
    if (oldVersion === 'latest') {
      const currentLatest = await getCurrentLatestWorktreeVersion();
      if (currentLatest) {
        actualOldVersion = `${oldVersion} (${currentLatest})`;
      }
    }

    // Show what changed between versions (if both are specific versions)
    if (oldVersion !== 'latest' && newVersion !== 'latest') {
      spinner.text = 'Analyzing changes...';
      try {
        const { stdout: diff } = await execa(
          'git',
          ['log', '--oneline', `${oldVersion}..${newVersion}`],
          { cwd: workspaceRoot }
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
    }

    // Handle different upgrade scenarios
    if (oldVersion === 'latest' && newVersion === 'latest') {
      // Upgrading latest to latest: update the worktree to newest tag
      spinner.text = `Updating shared-latest to ${actualNewVersion}...`;
      const latestPath = getSharedVersionWorktreePath('latest');

      if (existsSync(latestPath)) {
        await execa('git', ['-C', latestPath, 'fetch', 'origin', '--tags'], {
          cwd: workspaceRoot
        });
        await execa('git', ['-C', latestPath, 'checkout', actualNewVersion], {
          cwd: workspaceRoot
        });
        spinner.succeed(`${chalk.green('✓')} Updated shared-latest worktree to ${chalk.cyan(actualNewVersion)}`);
      } else {
        // Create the latest worktree if it doesn't exist
        await execa('git', ['worktree', 'add', latestPath, actualNewVersion], {
          cwd: workspaceRoot
        });
        spinner.succeed(`${chalk.green('✓')} Created shared-latest worktree at ${chalk.cyan(actualNewVersion)}`);
      }

    } else if (oldVersion !== 'latest' && newVersion === 'latest') {
      // Upgrading from specific to latest: change package.json reference
      spinner.text = 'Updating package.json to use shared-latest...';

      // Ensure latest worktree exists
      const latestPath = getSharedVersionWorktreePath('latest');
      if (!existsSync(latestPath)) {
        await execa('git', ['worktree', 'add', latestPath, actualNewVersion], {
          cwd: workspaceRoot
        });
      }

      // Update package.json
      const packageJsonPath = join(clientPath, 'package.json');
      if (existsSync(packageJsonPath)) {
        const originalContent = readFileSync(packageJsonPath, 'utf-8');
        const packageJson = JSON.parse(originalContent);
        packageJson.dependencies['@colombalink/shared'] = 'file:../../packages/shared-latest';
        const hasTrailingNewline = originalContent.endsWith('\n');
        writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + (hasTrailingNewline ? '\n' : ''), 'utf-8');
      }

      spinner.succeed(`${chalk.green('✓')} Switched to shared-latest (${chalk.cyan(actualNewVersion)})`);

    } else if (oldVersion === 'latest' && newVersion !== 'latest') {
      // Upgrading from latest to specific: change package.json reference and ensure worktree exists
      spinner.text = `Creating shared-${newVersion} worktree...`;

      const specificPath = getSharedVersionWorktreePath(newVersion);
      if (!existsSync(specificPath)) {
        await execa('git', ['worktree', 'add', specificPath, newVersion], {
          cwd: workspaceRoot
        });
      }

      // Update package.json
      const packageJsonPath = join(clientPath, 'package.json');
      if (existsSync(packageJsonPath)) {
        const originalContent = readFileSync(packageJsonPath, 'utf-8');
        const packageJson = JSON.parse(originalContent);
        packageJson.dependencies['@colombalink/shared'] = `file:../../packages/shared-${newVersion}`;
        const hasTrailingNewline = originalContent.endsWith('\n');
        writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + (hasTrailingNewline ? '\n' : ''), 'utf-8');
      }

      spinner.succeed(`${chalk.green('✓')} Pinned to specific version ${chalk.cyan(newVersion)}`);

    } else {
      // Upgrading from specific to different specific: ensure new worktree exists
      spinner.text = `Checking shared-${newVersion} worktree...`;

      const newPath = getSharedVersionWorktreePath(newVersion);
      if (!existsSync(newPath)) {
        await execa('git', ['worktree', 'add', newPath, newVersion], {
          cwd: workspaceRoot
        });
        spinner.succeed(`${chalk.green('✓')} Created shared-${newVersion} worktree`);
      } else {
        spinner.info(`shared-${newVersion} worktree already exists`);
      }

      // Update package.json
      const packageJsonPath = join(clientPath, 'package.json');
      if (existsSync(packageJsonPath)) {
        const originalContent = readFileSync(packageJsonPath, 'utf-8');
        const packageJson = JSON.parse(originalContent);
        packageJson.dependencies['@colombalink/shared'] = `file:../../packages/shared-${newVersion}`;
        const hasTrailingNewline = originalContent.endsWith('\n');
        writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + (hasTrailingNewline ? '\n' : ''), 'utf-8');
      }

      spinner.succeed(`${chalk.green('✓')} Updated to version ${chalk.cyan(newVersion)}`);
    }

    // Update the registry
    upsertClientConfig({
      ...client,
      sharedLibVersion: newVersion,
    });

    // Commit the clients.json update
    await execa('git', ['add', 'clients.json'], { cwd: workspaceRoot });
    await execa('git', ['commit', '-m', `Upgrade ${clientName} shared lib to ${newVersion}`], { cwd: workspaceRoot });

    console.log();
    console.log(chalk.bold('Version Update:'));
    console.log(chalk.gray(`  ${actualOldVersion} → ${newVersion}${newVersion === 'latest' ? ` (${actualNewVersion})` : ''}`));
    console.log();
    console.log(chalk.dim('Registry updated. Test your client site to ensure compatibility.'));
    console.log(chalk.dim('Run `npm install` in the client directory to update dependencies.'));

  } catch (error: any) {
    spinner.fail(chalk.red(`Failed to upgrade shared library for ${clientName}`));
    console.error(chalk.red(error.message));
    if (error.stderr) {
      console.error(chalk.dim(error.stderr));
    }
    process.exit(1);
  }
}
