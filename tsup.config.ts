import { defineConfig } from 'tsup'

export default defineConfig({
  format: ['cjs'],
  entry: {
    'client/index': 'src/client/index.ts',
    'client/plugins': 'src/client/plugins/index.ts',
    'client/rpc': 'src/client/rpc/index.ts',

    'server/index': 'src/server/index.ts',
    'server/plugins': 'src/server/plugins/index.ts',

    'server/plugins/account': 'src/server/plugins/account/index.ts',
    'server/plugins/chat': 'src/server/plugins/chat/index.ts',
    'server/plugins/command': 'src/server/plugins/command/index.ts',
    'server/plugins/inventory': 'src/server/plugins/inventory/index.ts',
    'server/plugins/base': 'src/server/plugins/base/index.ts',
    'server/rpc': 'src/server/rpc/index.ts',

    'cef/rpc': 'src/cef/rpc/index.ts',
  },
  dts: {
    // Generate separate .d.ts files for each entry point
    entry: {
      'client/index': 'src/client/index.ts',
      'client/plugins': 'src/client/plugins/index.ts',
      'client/rpc': 'src/client/rpc/index.ts',

      'server/index': 'src/server/index.ts',
      'server/plugins': 'src/server/plugins/index.ts',
      'server/plugins/account': 'src/server/plugins/account/index.ts',
      'server/plugins/chat': 'src/server/plugins/chat/index.ts',
      'server/plugins/command': 'src/server/plugins/command/index.ts',
      'server/plugins/inventory': 'src/server/plugins/inventory/index.ts',
      'server/plugins/base': 'src/server/plugins/base/index.ts',
      'server/rpc': 'src/server/rpc/index.ts',

      'cef/rpc': 'src/cef/rpc/index.ts',
    },
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
  splitting: true, // Enable code splitting
  treeshake: true,
  outExtension({ format }) {
    return {
      js: format === 'esm' ? '.mjs' : '.js'
    }
  },
  esbuildOptions(options) {
    options.mainFields = ['module', 'main']
    options.conditions = ['import', 'require', 'node', 'default']
    options.resolveExtensions = ['.mjs', '.js', '.ts']
    options.outbase = 'src'
    options.preserveSymlinks = true
    options.keepNames = true
  }
})