import { defineConfig } from 'astro/config';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
    output: 'static',
    site: 'http://localhost:4321',
    compressHTML: false, // Keep readable for development
    srcDir: './examples',
    publicDir: './public',
    vite: {
        resolve: {
            alias: {
                '@shared': resolve(__dirname, './'),
            },
        },
    },
});
