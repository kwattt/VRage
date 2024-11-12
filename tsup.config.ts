import { defineConfig } from 'tsup'

export default defineConfig({
  format: ['cjs'],
  entry: {
    'index': 'src/index.ts',
    'client/index': 'src/client/index.ts',
    'server/index': 'src/server/index.ts'
  },
  dts: true,
  target: 'es2016',
  platform: 'node',
  shims: true,
  clean: true,
  splitting: false,
  treeshake: true,
  outExtension: () => ({
    js: '.js'
  }),
  esbuildOptions(options) {
    options.mainFields = ['main', 'module']
    options.conditions = ['require', 'node', 'default']
    options.resolveExtensions = ['.js', '.ts']
  }
})