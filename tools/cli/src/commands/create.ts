import { execa } from 'execa';
import ora from 'ora';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { getWorkspaceRoot, upsertClientConfig } from '../utils/workspace.ts';

interface CreateOptions {
  name?: string;
  domain?: string;
  language?: string;
  template?: string;
  worktree?: boolean;
  sharedVersion?: string;
  checkout?: boolean;
}

export async function createSite(name: string, options: CreateOptions) {
  let spinner = ora('Creating new client...').start();

  try {
    // Validate name
    if (!/^[a-z0-9-]+$/.test(name)) {
      throw new Error('Site name must be lowercase with hyphens only');
    }

    const workspaceRoot = getWorkspaceRoot();
    const branchName = `client/${name}`;

    // Default to "latest" if no version specified
    const sharedVersion = options.sharedVersion || 'latest';

    // Interactive prompts - only ask for missing information
    const answers: any = {
      businessName: options.name,
      domain: options.domain,
      language: options.language || 'de'
    };

    if (!options.name || !options.domain) {
      spinner.stop();
      
      const prompts = [];

      if (!options.name) {
        prompts.push({
          type: 'input',
          name: 'businessName',
          message: 'Business name:',
          validate: (input: string) => input.length > 0
        });
      }

      if (!options.domain) {
        prompts.push({
          type: 'input',
          name: 'domain',
          message: 'Domain (e.g., garage mueller.ch):',
          validate: (input: string) => /^[a-z0-9.-]+\.[a-z]{2,}$/.test(input)
        });
      }

      if (!options.language) {
        prompts.push({
          type: 'list',
          name: 'language',
          message: 'Primary language:',
          choices: ['de', 'fr', 'it', 'en'],
          default: 'de'
        });
      }

      const responses = await inquirer.prompt(prompts);
      Object.assign(answers, responses);
      
      spinner = ora('Creating client...').start();
    }

    // Create temporary directory for the new branch
    const tempDir = join(workspaceRoot, '.tmp-create', name);
    
    spinner.text = 'Creating temporary worktree...';

    // Create an empty detached worktree in temp location
    await execa('git', ['worktree', 'add', '--detach', tempDir], { cwd: workspaceRoot });

    try {
      // Remove all files in the temp worktree
      spinner.text = 'Preparing clean branch...';
      await execa('git', ['rm', '-rf', '.'], { cwd: tempDir }).catch(() => {
        // Ignore if no files to remove
      });

      spinner.text = 'Creating site structure...';

      // Create site structure in the temp directory
      createSiteStructure(tempDir, name, answers, sharedVersion);

      spinner.text = 'Committing initial structure...';

      // Commit the initial structure
      await execa('git', ['add', '.'], { cwd: tempDir });
      await execa('git', ['commit', '-m', `Initial setup for ${name}`], { cwd: tempDir });

      // Create the branch from this commit
      await execa('git', ['branch', branchName], { cwd: tempDir });

      spinner.text = 'Pushing branch to remote...';

      // Push the branch
      await execa('git', ['push', 'origin', branchName], { cwd: tempDir });

    } finally {
      // Clean up temp worktree
      spinner.text = 'Cleaning up...';
      await execa('git', ['worktree', 'remove', tempDir, '--force'], { cwd: workspaceRoot }).catch((err) => {
        // If automatic removal fails, try manual cleanup
        console.log(chalk.dim('Cleaning up manually...'));
        try {
          const { rmSync } = require('fs');
          rmSync(tempDir, { recursive: true, force: true });
        } catch {}
      });
    }

    spinner.text = 'Registering client in clients.json...';

    // Register the client in clients.json
    upsertClientConfig({
      name,
      branch: branchName,
      sharedLibVersion: sharedVersion,
      sharedLibRepo: 'origin', // Same repo
      domain: answers.domain,
      language: answers.language,
      created: new Date().toISOString(),
      notes: '',
    });

    spinner.succeed(chalk.green(`✓ Client ${name} created successfully!`));

    console.log('\n' + chalk.bold('Next steps:'));
    console.log(chalk.cyan(`  cli checkout ${name}`));
    console.log(chalk.cyan(`  cd sites/${name}`));
    console.log(chalk.cyan('  npm install'));
    console.log(chalk.cyan('  npm run dev'));
    console.log('');
    console.log(chalk.dim(`Shared library version: ${sharedVersion}`));

  } catch (error) {
    spinner.fail(chalk.red('Failed to create site'));
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

function createSiteStructure(basePath: string, name: string, config: any, sharedVersion: string) {
  // Create directories in the base path (temp worktree)
  mkdirSync(join(basePath, 'src/pages/de'), { recursive: true });
  mkdirSync(join(basePath, 'src/pages/fr'), { recursive: true });
  mkdirSync(join(basePath, 'src/pages/it'), { recursive: true });
  mkdirSync(join(basePath, 'src/i18n'), { recursive: true });
  mkdirSync(join(basePath, 'public/images'), { recursive: true });

  // Create .gitignore
  writeFileSync(
    join(basePath, '.gitignore'),
    `# build output
dist/
.output/

# generated types
.astro/

# dependencies
node_modules/

# logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# environment variables
.env
.env.production

# macOS-specific files
.DS_Store

# editor files
.vscode/
.idea/
`
  );

  // Create site.config.ts
  writeFileSync(
    join(basePath, 'site.config.ts'),
    `export default {
  name: '${config.businessName}',
  domain: '${config.domain}',
  language: '${config.language}',
  
  // Template selections
  templates: {
    hero: 'Classic',
    features: 'Grid',
    contact: 'WithMap'
  },
  
  // Brand colors
  colors: {
    primary: '#1a56db',
    secondary: '#7c3aed'
  }
} as const;
`
  );

  // Create astro.config.ts
  writeFileSync(
    join(basePath, 'astro.config.ts'),
    `import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  site: 'https://${config.domain}',
  compressHTML: true,
  build: {
    inlineStylesheets: 'auto',
  },
  i18n: {
    defaultLocale: '${config.language}',
    locales: ['de', 'fr', 'it'],
    routing: {
      prefixDefaultLocale: true,
    },
  },
});
`
  );

  // Create package.json with file: protocol reference
  const sharedPath = sharedVersion === 'latest'
    ? '../../packages/shared-latest'
    : `../../packages/shared-${sharedVersion}`;

  writeFileSync(
    join(basePath, 'package.json'),
    JSON.stringify({
      name: name,
      version: '1.0.0',
      type: 'module',
      private: true,
      scripts: {
        dev: 'astro dev --host',
        build: 'astro check && astro build',
        preview: 'astro preview --host'
      },
      dependencies: {
        '@colombalink/shared': `file:${sharedPath}`,
        astro: '^6.0.0',
        motion: '^10.16.0'
      },
      devDependencies: {
        '@astrojs/check': '^0.9.0',
        typescript: '^5.6.0'
      }
    }, null, 2)
  );

  // Create tsconfig.json
  writeFileSync(
    join(basePath, 'tsconfig.json'),
    JSON.stringify({
      extends: '../../tsconfig.json'
    }, null, 2)
  );

  // Create i18n utils
  writeFileSync(
    join(basePath, 'src/i18n/utils.ts'),
    `import { createI18n } from '@colombalink/shared/utils/i18n';

export const languages = {
  de: 'Deutsch',
  fr: 'Français',
  it: 'Italiano',
} as const;

export type Language = keyof typeof languages;

export const defaultLang: Language = '${config.language}';

// Create i18n utilities with site configuration
const i18n = createI18n(languages, defaultLang);

// Re-export all utilities
export const { getLangFromUrl, useTranslatedPath, getAlternateLanguageUrls } = i18n;
`
  );

  // Content for each language (colocated with pages)
  const contentDe = {
    hero: {
      title: `Willkommen bei ${config.businessName}`,
      subtitle: 'Ihre Autowerkstatt des Vertrauens',
      cta: { text: 'Termin buchen', href: '/de/contact' }
    }
  };

  const contentFr = {
    hero: {
      title: `Bienvenue chez ${config.businessName}`,
      subtitle: 'Votre garage de confiance',
      cta: { text: 'Prendre rendez-vous', href: '/fr/contact' }
    }
  };

  const contentIt = {
    hero: {
      title: `Benvenuti al ${config.businessName}`,
      subtitle: 'La vostra officina di fiducia',
      cta: { text: 'Prenota appuntamento', href: '/it/contact' }
    }
  };

  // Create root index page (redirects to default language)
  writeFileSync(
    join(basePath, 'src/pages/index.astro'),
    `---
// Redirect root to default language
import { defaultLang } from '../i18n/utils';
return Astro.redirect(\`/\${defaultLang}/\`);
---
`
  );

  // Create German page with colocated content
  writeFileSync(
    join(basePath, 'src/pages/de/index.json'),
    JSON.stringify(contentDe, null, 2)
  );

  writeFileSync(
    join(basePath, 'src/pages/de/index.astro'),
    `---
import BaseLayout from '@colombalink/shared/layouts/BaseLayout.astro';
import Hero from '@colombalink/shared/components/sections/Hero/Hero.astro';
import { getAlternateLanguageUrls } from '../../i18n/utils';
import content from './index.json';

const alternateLanguages = getAlternateLanguageUrls('/', 'de').map((alt: { lang: string; url: string }) => ({
  lang: alt.lang,
  url: \`https://${config.domain}\${alt.url}\`
}));
---

<BaseLayout 
  title="${config.businessName}" 
  lang="de"
  alternateLanguages={alternateLanguages}
>
  <Hero {...content.hero} />
</BaseLayout>
`
  );

  // Create French page with colocated content
  writeFileSync(
    join(basePath, 'src/pages/fr/index.json'),
    JSON.stringify(contentFr, null, 2)
  );

  writeFileSync(
    join(basePath, 'src/pages/fr/index.astro'),
    `---
import BaseLayout from '@colombalink/shared/layouts/BaseLayout.astro';
import Hero from '@colombalink/shared/components/sections/Hero/Hero.astro';
import { getAlternateLanguageUrls } from '../../i18n/utils';
import content from './index.json';

const alternateLanguages = getAlternateLanguageUrls('/', 'fr').map((alt: { lang: string; url: string }) => ({
  lang: alt.lang,
  url: \`https://${config.domain}\${alt.url}\`
}));
---

<BaseLayout 
  title="${config.businessName}" 
  lang="fr"
  alternateLanguages={alternateLanguages}
>
  <Hero {...content.hero} />
</BaseLayout>
`
  );

  // Create Italian page with colocated content
  writeFileSync(
    join(basePath, 'src/pages/it/index.json'),
    JSON.stringify(contentIt, null, 2)
  );

  writeFileSync(
    join(basePath, 'src/pages/it/index.astro'),
    `---
import BaseLayout from '@colombalink/shared/layouts/BaseLayout.astro';
import Hero from '@colombalink/shared/components/sections/Hero/Hero.astro';
import { getAlternateLanguageUrls } from '../../i18n/utils';
import content from './index.json';

const alternateLanguages = getAlternateLanguageUrls('/', 'it').map((alt: { lang: string; url: string }) => ({
  lang: alt.lang,
  url: \`https://${config.domain}\${alt.url}\`
}));
---

<BaseLayout 
  title="${config.businessName}" 
  lang="it"
  alternateLanguages={alternateLanguages}
>
  <Hero {...content.hero} />
</BaseLayout>
`
  );
}
