import { execa } from 'execa';
import ora from 'ora';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { existsSync, mkdirSync, writeFileSync, rmSync } from 'fs';
import { join } from 'path';
import {
  getWorkspaceRoot,
  getClientConfig,
  upsertClientConfig,
  type ClientConfig,
} from '../utils/workspace.js';
import { checkoutClient } from './checkout.js';

interface CreateOptions {
  name?: string;
  domain?: string;
  language?: string;
  sharedVersion?: string;
  noCheckout?: boolean;
}

export async function createSite(name: string, options: CreateOptions) {
  const spinner = ora('Creating new client site...').start();

  try {
    // Validate name
    if (!/^garage-[a-z0-9-]+$/.test(name)) {
      throw new Error('Site name must follow pattern: garage-{name} (lowercase, hyphens only)');
    }

    // Check if client already exists in registry
    const existing = getClientConfig(name);
    if (existing) {
      throw new Error(`Client ${name} already exists in registry`);
    }

    const workspaceRoot = getWorkspaceRoot();
    const branchName = `client/${name}`;

    // Check if branch already exists
    try {
      const { stdout } = await execa('git', ['branch', '--list', branchName], {
        cwd: workspaceRoot,
      });
      if (stdout.trim()) {
        throw new Error(`Branch ${branchName} already exists`);
      }
    } catch (error: any) {
      if (!error.message.includes('already exists')) {
        throw error;
      }
    }

    spinner.text = 'Gathering site information...';

    // Interactive prompts - only ask for missing information
    const answers: any = {
      businessName: options.name,
      domain: options.domain,
      language: options.language || 'de',
      sharedVersion: options.sharedVersion || 'v1.0.0',
    };

    const prompts = [];

    if (!options.name) {
      prompts.push({
        type: 'input',
        name: 'businessName',
        message: 'Business name:',
        validate: (input: string) => input.length > 0,
      });
    }

    if (!options.domain) {
      prompts.push({
        type: 'input',
        name: 'domain',
        message: 'Domain (e.g., garage-mueller.ch):',
        validate: (input: string) => /^[a-z0-9.-]+\.[a-z]{2,}$/.test(input),
      });
    }

    if (!options.language) {
      prompts.push({
        type: 'list',
        name: 'language',
        message: 'Primary language:',
        choices: ['de', 'fr', 'it', 'en'],
        default: 'de',
      });
    }

    if (!options.sharedVersion) {
      prompts.push({
        type: 'input',
        name: 'sharedVersion',
        message: 'Shared library version:',
        default: 'v1.0.0',
        validate: (input: string) => /^v\d+\.\d+\.\d+/.test(input),
      });
    }

    if (prompts.length > 0) {
      const responses = await inquirer.prompt(prompts);
      Object.assign(answers, responses);
    }

    // Create orphan branch
    spinner.text = `Creating orphan branch ${branchName}...`;
    const tempDir = join(workspaceRoot, '.tmp-client-' + name);

    try {
      // Create temporary directory for scaffolding
      if (existsSync(tempDir)) {
        rmSync(tempDir, { recursive: true, force: true });
      }
      mkdirSync(tempDir, { recursive: true });

      // Initialize git in temp directory with orphan branch
      await execa('git', ['checkout', '--orphan', branchName], {
        cwd: workspaceRoot,
      });

      // Remove all files from staging (orphan branch cleanup)
      try {
        await execa('git', ['rm', '-rf', '.'], {
          cwd: workspaceRoot,
          reject: false,
        });
      } catch (error) {
        // Ignore errors - this is just cleanup
      }

      // Create site structure directly in root
      spinner.text = 'Creating site structure...';
      createSiteStructure(workspaceRoot, name, answers);

      // Commit initial structure
      spinner.text = 'Committing initial structure...';
      await execa('git', ['add', '.'], { cwd: workspaceRoot });
      await execa(
        'git',
        ['commit', '-m', `Initial setup for ${name}\n\nShared lib: ${answers.sharedVersion}`],
        { cwd: workspaceRoot }
      );

      // Return to main branch
      await execa('git', ['checkout', 'main'], { cwd: workspaceRoot });

      // Register client in clients.json
      spinner.text = 'Registering client...';
      const clientConfig: ClientConfig = {
        name,
        branch: branchName,
        sharedLibVersion: answers.sharedVersion,
        sharedLibRepo: 'https://github.com/colombalink/shared-components.git',
        domain: answers.domain,
        language: answers.language,
        created: new Date().toISOString().split('T')[0],
      };
      upsertClientConfig(clientConfig);

      spinner.succeed(chalk.green(`✓ Client ${name} created successfully!`));

      console.log();
      console.log(chalk.bold('Client details:'));
      console.log(chalk.gray(`  Branch: ${branchName}`));
      console.log(chalk.gray(`  Domain: ${answers.domain}`));
      console.log(chalk.gray(`  Language: ${answers.language}`));
      console.log(chalk.gray(`  Shared lib: ${answers.sharedVersion}`));
      console.log();

      // Auto-checkout unless disabled
      if (!options.noCheckout) {
        console.log(chalk.blue('Checking out client...'));
        await checkoutClient(name);
      } else {
        console.log(chalk.bold('Next steps:'));
        console.log(chalk.cyan(`  cli checkout ${name}`));
        console.log(chalk.cyan(`  cd sites/${name}`));
        console.log(chalk.cyan('  npm install'));
        console.log(chalk.cyan('  npm run dev'));
      }
    } catch (error) {
      // Cleanup on error - try to return to main branch
      try {
        await execa('git', ['checkout', '-f', 'main'], { cwd: workspaceRoot });
        await execa('git', ['branch', '-D', branchName], { cwd: workspaceRoot, reject: false });
      } catch (cleanupError) {
        // Ignore cleanup errors
      }
      throw error;
    } finally {
      // Cleanup temp directory
      if (existsSync(tempDir)) {
        rmSync(tempDir, { recursive: true, force: true });
      }
    }
  } catch (error) {
    spinner.fail(chalk.red('Failed to create client site'));
    console.error(chalk.red(error instanceof Error ? error.message : String(error)));
    process.exit(1);
  }
}

function createSiteStructure(rootPath: string, name: string, config: any) {
  // Create directories at root level (since we're on orphan branch)
  const srcPath = join(rootPath, 'src');
  mkdirSync(join(srcPath, 'pages/de'), { recursive: true });
  mkdirSync(join(srcPath, 'pages/fr'), { recursive: true });
  mkdirSync(join(srcPath, 'pages/it'), { recursive: true });
  mkdirSync(join(srcPath, 'i18n'), { recursive: true });
  mkdirSync(join(rootPath, 'public/images'), { recursive: true });

  // Create .gitignore
  writeFileSync(
    join(rootPath, '.gitignore'),
    `# Build outputs
dist/
.astro/

# Dependencies  
node_modules/
package-lock.json

# Environment
.env
.env.*
!.env.example

# OS
.DS_Store
Thumbs.db

# Editor
.vscode/
.idea/
*.swp
*.swo
*~

# Logs
*.log
`
  );

  // Create site.config.ts
  writeFileSync(
    join(rootPath, 'site.config.ts'),
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
    join(rootPath, 'astro.config.ts'),
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
        '@shared': resolve(__dirname, 'src/shared'),
        '@templates': resolve(__dirname, '../../packages/templates'),
      },
    },
  },
});
`
  );

  // Create package.json
  writeFileSync(
    join(rootPath, 'package.json'),
    JSON.stringify(
      {
        name: name,
        version: '1.0.0',
        type: 'module',
        private: true,
        scripts: {
          dev: 'astro dev --host',
          build: 'astro check && astro build',
          preview: 'astro preview --host',
        },
        dependencies: {
          astro: '^6.0.0',
          motion: '^10.16.0',
        },
        devDependencies: {
          '@astrojs/check': '^0.9.0',
          typescript: '^5.6.0',
        },
      },
      null,
      2
    ) + '\n'
  );

  // Create tsconfig.json
  writeFileSync(
    join(rootPath, 'tsconfig.json'),
    JSON.stringify(
      {
        extends: 'astro/tsconfigs/strict',
        compilerOptions: {
          baseUrl: '.',
          paths: {
            '@shared/*': ['src/shared/*'],
            '@templates/*': ['../../packages/templates/*'],
          },
        },
      },
      null,
      2
    ) + '\n'
  );

  // Create i18n utils
  writeFileSync(
    join(srcPath, 'i18n/utils.ts'),
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
      cta: { text: 'Termin buchen', href: '/de/contact' },
    },
  };

  const contentFr = {
    hero: {
      title: `Bienvenue chez ${config.businessName}`,
      subtitle: 'Votre garage de confiance',
      cta: { text: 'Prendre rendez-vous', href: '/fr/contact' },
    },
  };

  const contentIt = {
    hero: {
      title: `Benvenuti al ${config.businessName}`,
      subtitle: 'La vostra officina di fiducia',
      cta: { text: 'Prenota appuntamento', href: '/it/contact' },
    },
  };

  // Create root index page (redirects to default language)
  writeFileSync(
    join(srcPath, 'pages/index.astro'),
    `---
// Redirect root to default language
import { defaultLang } from '../i18n/utils.ts';
return Astro.redirect(\`/\${defaultLang}/\`);
---
`
  );

  // Create German page with colocated content
  writeFileSync(join(srcPath, 'pages/de/index.json'), JSON.stringify(contentDe, null, 2) + '\n');

  writeFileSync(
    join(srcPath, 'pages/de/index.astro'),
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
  writeFileSync(join(srcPath, 'pages/fr/index.json'), JSON.stringify(contentFr, null, 2) + '\n');

  writeFileSync(
    join(srcPath, 'pages/fr/index.astro'),
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
  writeFileSync(join(srcPath, 'pages/it/index.json'), JSON.stringify(contentIt, null, 2) + '\n');

  writeFileSync(
    join(srcPath, 'pages/it/index.astro'),
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

  // Create README
  writeFileSync(
    join(rootPath, 'README.md'),
    `# ${config.businessName}

Client website for ${config.businessName} (${config.domain})

## Development

\`\`\`bash
npm install
npm run dev
\`\`\`

## Build

\`\`\`bash
npm run build
\`\`\`

## Shared Library

This client uses the shared component library version: **${config.sharedVersion}**

To upgrade the shared library:
\`\`\`bash
cli upgrade-shared ${name} <new-version>
\`\`\`
`
  );

  // Create astro.config.ts
  writeFileSync(
    join(rootPath, 'astro.config.ts'),
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
        '@shared': resolve(__dirname, 'src/shared'),
        '@templates': resolve(__dirname, '../../packages/templates'),
      },
    },
  },
});
`
  );

  // Create package.json
  writeFileSync(
    join(rootPath, 'package.json'),
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
          '@shared/*': ['../shared/*'],
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
      title: `Willkommen bei ${ config.businessName } `,
      subtitle: 'Ihre Autowerkstatt des Vertrauens',
      cta: { text: 'Termin buchen', href: '/de/contact' }
    }
  };

  const contentFr = {
    hero: {
      title: `Bienvenue chez ${ config.businessName } `,
      subtitle: 'Votre garage de confiance',
      cta: { text: 'Prendre rendez-vous', href: '/fr/contact' }
    }
  };

  const contentIt = {
    hero: {
      title: `Benvenuti al ${ config.businessName } `,
      subtitle: 'La vostra officina di fiducia',
      cta: { text: 'Prenota appuntamento', href: '/it/contact' }
    }
  };

  // Create root index page (redirects to default language)
  writeFileSync(
    join(sitePath, 'src/pages/index.astro'),
    `-- -
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
