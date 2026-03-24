import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  site: 'https://garage-mueller.ch',
  compressHTML: true,
  build: {
    inlineStylesheets: 'auto',
  },
});
