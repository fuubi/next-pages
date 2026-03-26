export default {
  extensions: {
    ts: 'module',
  },
  nodeArguments: ['--experimental-strip-types', '--experimental-detect-module'],
  files: ['packages/**/*.test.ts', 'sites/**/*.test.ts', 'tools/**/*.test.ts'],
  timeout: '1m',
};
