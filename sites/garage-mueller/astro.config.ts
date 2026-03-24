import { defineConfig } from 'astro/config';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  output: 'static',
  site: 'https://garage-mueller.ch',
  compressHTML: true,
  build: {
    inlineStylesheets: 'auto',
  },
  i18n: {
    defaultLocale: 'de',
    locales: ['de', 'fr', 'it'],
    routing: {
      prefixDefaultLocale: true, // /de/ = German, /fr/ = French, /it/ = Italian
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
