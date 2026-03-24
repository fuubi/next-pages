#!/usr/bin/env node
import { Command } from 'commander';
import { createSite } from './commands/create.ts';
import { validateSite } from './commands/validate.ts';
import { listSites } from './commands/list.ts';

const program = new Command();

program
  .name('garage')
  .description('CLI tool for managing garage website projects')
  .version('0.1.0');

program
  .command('create')
  .description('Create a new garage website')
  .argument('<name>', 'Site name (e.g., garage-mueller)')
  .option('-n, --name <businessName>', 'Business name')
  .option('-d, --domain <domain>', 'Domain (e.g., garage-mueller.ch)')
  .option('-l, --language <language>', 'Primary language (de|fr|it|en)', 'de')
  .option('-t, --template <template>', 'Template to use', 'default')
  .option('--worktree', 'Create as git worktree')
  .action(createSite);

program
  .command('validate')
  .description('Validate site structure and configuration')
  .argument('[site]', 'Site name to validate (validates all if omitted)')
  .action(validateSite);

program
  .command('list')
  .description('List all sites in the monorepo')
  .action(listSites);

program.parse();
