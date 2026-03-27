#!/usr/bin/env -S node --experimental-strip-types --experimental-detect-module
import { Command } from 'commander';
import { createSite } from './commands/create.ts';
import { validateSite } from './commands/validate.ts';
import { listSites } from './commands/list.ts';
import { listSharedVersions } from './commands/list-shared.ts';
import { checkoutClient } from './commands/checkout.ts';
import { closeClient, closeAllClients } from './commands/close.ts';
import { upgradeSharedLib } from './commands/upgrade-shared.ts';

const program = new Command();

program
  .name('site')
  .description('CLI tool for managing client website projects')
  .version('0.2.0');

program
  .command('create')
  .description('Create a new client website (orphan branch)')
  .argument('<name>', 'Site name (kebab-case, e.g., garage-mueller)')
  .option('-n, --name <businessName>', 'Business name')
  .option('-d, --domain <domain>', 'Domain (e.g., garage-mueller.ch)')
  .option('-l, --language <language>', 'Primary language (de|fr|it|en)', 'de')
  .option('-s, --shared-version <version>', 'Shared library version tag (e.g., v1.0.0 or "latest")', 'latest')
  .option('--no-checkout', 'Do not automatically checkout after creating')
  .action(createSite);

program
  .command('checkout')
  .description('Checkout a client site with nested shared library worktree')
  .argument('<name>', 'Client name (e.g., garage-mueller)')
  .option('-f, --force', 'Force re-checkout if already checked out')
  .action(checkoutClient);

program
  .command('close')
  .description('Close (remove) client worktrees')
  .argument('[name]', 'Client name to close (closes all if omitted)')
  .option('-a, --all', 'Close all checked-out clients')
  .option('--clean-unused-shared', 'Remove orphaned shared version worktrees')
  .action(async (name: string | undefined, options: { all?: boolean; cleanUnusedShared?: boolean }) => {
    if (options.all || !name) {
      await closeAllClients({ cleanUnusedShared: options.cleanUnusedShared });
    } else {
      await closeClient(name, { cleanUnusedShared: options.cleanUnusedShared });
    }
  });

program
  .command('upgrade-shared')
  .description('Upgrade shared library version for a client')
  .argument('<client>', 'Client name')
  .argument('<version>', 'Target version tag (e.g., v1.1.0)')
  .action(upgradeSharedLib);

program
  .command('validate')
  .description('Validate site structure and configuration')
  .argument('[site]', 'Site name to validate (validates all if omitted)')
  .action(validateSite);

program
  .command('list')
  .description('List all client sites and their checkout status')
  .option('-c, --checked-out-only', 'Show only checked-out clients')
  .option('-a, --available-only', 'Show only available (not checked- out) clients')
  .action(listSites);

program
  .command('list-shared')
  .description('List all checked-out shared library versions')
  .action(listSharedVersions);

program.parse();
