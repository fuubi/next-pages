import { execa } from 'execa';
import ora from 'ora';
import chalk from 'chalk';
import { existsSync } from 'fs';
import { join } from 'path';
import { getWorkspaceRoot, getClientConfig } from '../utils/workspace.ts';
import { normalizeSiteName } from '../utils/normalize.ts';

interface RunOptions {
    background?: boolean;
}

/**
 * Run npm scripts in a client site from workspace root
 * Follows kubectl-like pattern: cli run <site> <script>
 */
export async function runSiteScript(
    siteName: string,
    script: string,
    options: RunOptions = {}
) {
    // Normalize site name (strip sites/ prefix for tab-completion support)
    siteName = normalizeSiteName(siteName);

    try {
        const workspaceRoot = getWorkspaceRoot();
        const sitePath = join(workspaceRoot, 'sites', siteName);

        // Validate site exists
        if (!existsSync(sitePath)) {
            console.error(
                chalk.red(`✗ Site '${siteName}' is not checked out.`)
            );
            console.log(chalk.dim(`Run: ${chalk.cyan(`cli checkout ${siteName}`)}`));
            process.exit(1);
        }

        // Validate site is registered
        const client = getClientConfig(siteName);
        if (!client) {
            console.error(
                chalk.red(`✗ Site '${siteName}' not found in registry.`)
            );
            process.exit(1);
        }

        // Check if package.json exists
        const packageJsonPath = join(sitePath, 'package.json');
        if (!existsSync(packageJsonPath)) {
            console.error(
                chalk.red(`✗ No package.json found in ${siteName}`)
            );
            process.exit(1);
        }

        // Map common script aliases
        const scriptMap: Record<string, string> = {
            install: 'install',
            dev: 'run dev',
            build: 'run build',
            preview: 'run preview',
            test: 'run test',
            lint: 'run lint',
            format: 'run format',
        };

        const npmCommand = scriptMap[script] || `run ${script}`;
        const [action, ...args] = npmCommand.split(' ');

        console.log(
            chalk.dim(
                `Running ${chalk.cyan(`npm ${npmCommand}`)} in ${chalk.bold(siteName)}...`
            )
        );
        console.log(chalk.dim(`Path: ${sitePath}`));
        console.log();

        // Run the npm command
        const subprocess = execa('npm', [action, ...args], {
            cwd: sitePath,
            stdio: 'inherit',
        });

        if (options.background) {
            console.log(chalk.green('✓ Started in background'));
            return;
        }

        await subprocess;

        console.log();
        console.log(chalk.green(`✓ Completed successfully`));
    } catch (error: any) {
        if (error.exitCode) {
            process.exit(error.exitCode);
        }
        console.error(chalk.red('✗ Command failed'));
        console.error(error.message);
        process.exit(1);
    }
}
