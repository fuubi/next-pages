import { execa } from 'execa';
import ora from 'ora';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

interface CreateOptions {
  name?: string;
  domain?: string;
  language?: string;
  template?: string;
  worktree?: boolean;
}

export async function createSite(name: string, options: CreateOptions) {
  const spinner = ora('Creating new garage site...').start();

  try {
    // Validate name
    if (!/^garage-[a-z0-9-]+$/.test(name)) {
      throw new Error('Site name must follow pattern: garage-{name} (lowercase, hyphens only)');
    }

    // Get workspace root (CLI is in tools/cli, so go up 2 levels)
    const workspaceRoot = join(process.cwd(), '..', '..');
    const sitePath = join(workspaceRoot, 'sites', name);

    // Check if site already exists
    if (existsSync(sitePath)) {
      throw new Error(`Site ${name} already exists at ${sitePath}`);
    }

    spinner.text = 'Gathering site information...';

    // Interactive prompts - only ask for missing information
    const answers: any = {
      businessName: options.name,
      domain: options.domain,
      language: options.language || 'de'
    };

    if (!options.name || !options.domain) {
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
          message: 'Domain (e.g., garage-mueller.ch):',
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
    }

    spinner.text = 'Creating directory structure...';

    // Create site structure
    createSiteStructure(sitePath, name, answers);

    if (options.worktree) {
      spinner.text = 'Setting up git worktree...';
      await setupWorktree(name, sitePath);
    }

    spinner.succeed(chalk.green(`✓ Site ${name} created successfully!`));

    console.log('\n' + chalk.bold('Next steps:'));
    if (options.worktree) {
      console.log(chalk.cyan(`  cd ../${name}-work`));
    } else {
      console.log(chalk.cyan(`  cd sites/${name}`));
    }
    console.log(chalk.cyan('  npm install'));
    console.log(chalk.cyan('  npm run dev'));

  } catch (error) {
    spinner.fail(chalk.red('Failed to create site'));
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

function createSiteStructure(sitePath: string, name: string, config: any) {
  // Create directories
  mkdirSync(sitePath, { recursive: true });
  mkdirSync(join(sitePath, 'src/pages/de'), { recursive: true });
  mkdirSync(join(sitePath, 'src/pages/fr'), { recursive: true });
  mkdirSync(join(sitePath, 'src/pages/it'), { recursive: true });
  mkdirSync(join(sitePath, 'src/i18n'), { recursive: true });
  mkdirSync(join(sitePath, 'public/images'), { recursive: true });

  // Create site.config.ts
  writeFileSync(
    join(sitePath, 'site.config.ts'),
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
    join(sitePath, 'astro.config.ts'),
    `import { defineConfig } from 'astro/config';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
  vite: {
    resolve: {
      alias: {
        '@shared': resolve(__dirname, '../../packages/shared'),
        '@templates': resolve(__dirname, '../../packages/templates'),
      },
    },
  },
});
`
  );

  // Create package.json
  writeFileSync(
    join(sitePath, 'package.json'),
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
    join(sitePath, 'tsconfig.json'),
    JSON.stringify({
      extends: '../../tsconfig.json',
      compilerOptions: {
        baseUrl: '.',
        paths: {
          '@shared/*': ['../../packages/shared/*'],
          '@templates/*': ['../../packages/templates/*']
        }
      }
    }, null, 2)
  );

  // Create i18n utils
  writeFileSync(
    join(sitePath, 'src/i18n/utils.ts'),
    `import { createI18n } from '@shared/utils/i18n.ts';

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
    join(sitePath, 'src/pages/index.astro'),
    `---
// Redirect root to default language
import { defaultLang } from '../i18n/utils.ts';
return Astro.redirect(\`/\${defaultLang}/\`);
---
`
  );

  // Create German page with colocated content
  writeFileSync(
    join(sitePath, 'src/pages/de/index.json'),
    JSON.stringify(contentDe, null, 2)
  );

  writeFileSync(
    join(sitePath, 'src/pages/de/index.astro'),
    `---
import BaseLayout from '@shared/layouts/BaseLayout.astro';
import Hero from '@templates/hero/Classic.astro';
import { getAlternateLanguageUrls } from '../../i18n/utils.ts';
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
    join(sitePath, 'src/pages/fr/index.json'),
    JSON.stringify(contentFr, null, 2)
  );

  writeFileSync(
    join(sitePath, 'src/pages/fr/index.astro'),
    `---
import BaseLayout from '@shared/layouts/BaseLayout.astro';
import Hero from '@templates/hero/Classic.astro';
import { getAlternateLanguageUrls } from '../../i18n/utils.ts';
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
    join(sitePath, 'src/pages/it/index.json'),
    JSON.stringify(contentIt, null, 2)
  );

  writeFileSync(
    join(sitePath, 'src/pages/it/index.astro'),
    `---
import BaseLayout from '@shared/layouts/BaseLayout.astro';
import Hero from '@templates/hero/Classic.astro';
import { getAlternateLanguageUrls } from '../../i18n/utils.ts';
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

async function setupWorktree(name: string, sitePath: string) {
  const branchName = `site/${name}`;

  // Create branch
  await execa('git', ['branch', branchName]);

  // Create worktree
  const worktreePath = join(process.cwd(), '..', `${name}-work`);
  await execa('git', ['worktree', 'add', worktreePath, branchName]);

  // Move site files to worktree
  await execa('mv', [sitePath, join(worktreePath, 'sites', name)]);

  // Commit initial structure
  await execa('git', ['-C', worktreePath, 'add', '.']);
  await execa('git', ['-C', worktreePath, 'commit', '-m', `Initial setup for ${name}`]);
}
