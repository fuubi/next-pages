import { existsSync, readdirSync, statSync, readFileSync } from 'fs';
import { join } from 'path';
import chalk from 'chalk';

export async function listSites() {
  // Get workspace root (CLI is in tools/cli, so go up 2 levels)
  const workspaceRoot = join(process.cwd(), '..', '..');
  const sitesDir = join(workspaceRoot, 'sites');

  if (!existsSync(sitesDir)) {
    console.error(chalk.red('✗ sites/ directory not found'));
    return;
  }

  const sites = readdirSync(sitesDir)
    .filter(f => statSync(join(sitesDir, f)).isDirectory());

  if (sites.length === 0) {
    console.log(chalk.yellow('No sites found. Create one with: garage create <name>'));
    return;
  }

  console.log(chalk.bold(`\nFound ${sites.length} site(s):\n`));

  for (const site of sites) {
    const configPath = join(sitesDir, site, 'site.config.ts');
    let info = '';

    if (existsSync(configPath)) {
      try {
        const content = readFileSync(configPath, 'utf-8');
        const domainMatch = content.match(/domain:\s*['"]([^'"]+)['"]/);
        const languageMatch = content.match(/language:\s*['"]([^'"]+)['"]/);

        if (domainMatch) info += chalk.gray(` → ${domainMatch[1]}`);
        if (languageMatch) info += chalk.gray(` (${languageMatch[1]})`);
      } catch { }
    }

    console.log(chalk.cyan(`  • ${site}`) + info);
  }

  console.log('');
}
