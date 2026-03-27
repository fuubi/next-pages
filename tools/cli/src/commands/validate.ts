import { existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import chalk from 'chalk';
import { getWorkspaceRoot } from '../utils/workspace.ts';
import { normalizeSiteName } from '../utils/normalize.ts';

interface ValidationResult {
  site: string;
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export async function validateSite(siteName?: string) {
  const workspaceRoot = getWorkspaceRoot();
  const sitesDir = join(workspaceRoot, 'sites');

  if (!existsSync(sitesDir)) {
    console.error(chalk.red('✗ sites/ directory not found. Are you in the monorepo root?'));
    process.exit(1);
  }

  // Normalize site name if provided (strip sites/ prefix for tab-completion support)
  if (siteName) {
    siteName = normalizeSiteName(siteName);
  }

  const sitesToValidate = siteName
    ? [siteName]
    : readdirSync(sitesDir).filter(f => statSync(join(sitesDir, f)).isDirectory());

  const results: ValidationResult[] = [];

  for (const site of sitesToValidate) {
    const result = validateSiteStructure(workspaceRoot, site);
    results.push(result);
    printValidationResult(result);
  }

  // Summary
  const validCount = results.filter(r => r.valid).length;
  const totalCount = results.length;

  console.log('\n' + chalk.bold('Summary:'));
  console.log(`${validCount}/${totalCount} sites passed validation`);

  if (validCount < totalCount) {
    process.exit(1);
  }
}

function validateSiteStructure(workspaceRoot: string, siteName: string): ValidationResult {
  const result: ValidationResult = {
    site: siteName,
    valid: true,
    errors: [],
    warnings: []
  };

  const sitePath = join(workspaceRoot, 'sites', siteName);

  // Check required files
  const requiredFiles = [
    'site.config.ts',
    'astro.config.ts',
    'package.json',
    'tsconfig.json',
    'src/pages/index.astro',
    'src/content/home.json'
  ];

  for (const file of requiredFiles) {
    if (!existsSync(join(sitePath, file))) {
      result.errors.push(`Missing required file: ${file}`);
      result.valid = false;
    }
  }

  // Check naming convention
  if (!siteName.startsWith('garage-')) {
    result.warnings.push('Site name should follow pattern: garage-{name}');
  }

  // Check for .js files (should be all TypeScript)
  const hasJsFiles = checkForJsFiles(sitePath);
  if (hasJsFiles) {
    result.errors.push('Found .js files - only TypeScript (.ts/.tsx) allowed');
    result.valid = false;
  }

  return result;
}

function checkForJsFiles(dir: string): boolean {
  try {
    const files = readdirSync(dir);
    for (const file of files) {
      const fullPath = join(dir, file);
      const stat = statSync(fullPath);

      if (stat.isDirectory() && file !== 'node_modules' && file !== 'dist') {
        if (checkForJsFiles(fullPath)) return true;
      } else if (file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.mjs')) {
        return true;
      }
    }
  } catch {
    return false;
  }
  return false;
}

function printValidationResult(result: ValidationResult) {
  console.log('\n' + chalk.bold(`Site: ${result.site}`));

  if (result.valid) {
    console.log(chalk.green('✓ All checks passed'));
  } else {
    console.log(chalk.red('✗ Validation failed'));
  }

  if (result.errors.length > 0) {
    console.log(chalk.red('\nErrors:'));
    result.errors.forEach(err => console.log(chalk.red(`  • ${err}`)));
  }

  if (result.warnings.length > 0) {
    console.log(chalk.yellow('\nWarnings:'));
    result.warnings.forEach(warn => console.log(chalk.yellow(`  • ${warn}`)));
  }
}
