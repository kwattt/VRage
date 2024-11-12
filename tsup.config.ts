// tsup.config.ts
import { defineConfig } from 'tsup'

export default defineConfig({
  format: ['cjs', 'esm'],
  entry: {
    'index': 'src/index.ts',
    'client/index': 'src/client/index.ts',
    'server/index': 'src/server/index.ts',
  },
  dts: true,
  target: 'es2016',
  platform: 'node',
  shims: true,
  skipNodeModulesBundle: true,
  clean: true,
  splitting: false,
  treeshake: true,
  env: {
    NODE_ENV: process.env.NODE_ENV || 'production',
  },
})