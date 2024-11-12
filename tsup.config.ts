import { defineConfig } from 'tsup'

export default defineConfig({
  format: ['cjs'],  // RageMP uses CommonJS, so we can remove ESM
  entry: {
    'client/index': 'src/client/index.ts',
    'server/index': 'src/server/index.ts',
  },
  dts: true,
  target: 'es2016',
  platform: 'node',
  shims: true,
  clean: true,
  splitting: false,
  treeshake: true,
  outExtension: () => ({
    js: '.js'  // Ensure consistent extensions
  }),
  // Bundle format configuration
  esbuildOptions(options) {
    options.mainFields = ['module', 'main']
    options.conditions = ['require', 'node']
  }
})