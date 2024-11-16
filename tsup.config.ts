// tsup.config.ts
import { defineConfig } from 'tsup'

export default defineConfig({
  format: ['cjs'],
  entry: {
    'client/index': 'src/client/index.ts',
    'client/baseplugins': 'src/client/baseplugins/index.ts',
    'client/plugins': 'src/client/plugins/index.ts',

    'server/index': 'src/server/index.ts',
    'server/baseplugins': 'src/server/baseplugins/index.ts',
    'server/plugins': 'src/server/plugins/index.ts',
  },
  dts: {
    resolve: true,
    compilerOptions: {
      moduleResolution: "node",
      preserveSymlinks: true,
      baseUrl: "src",
    }
  },
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
    options.outbase = 'src'
    options.preserveSymlinks = true
    // Add this to preserve original export names
    options.keepNames = true
  }
})