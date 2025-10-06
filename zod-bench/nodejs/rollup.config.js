// Rollup configuration for bundling the Node.js Express app
// Provides an alternative bundler to compare against esbuild and ncc

import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';

export default {
  input: 'server.mjs',
  output: {
    file: 'dist-rollup/index.js',
    format: 'es',
    sourcemap: true,
    banner: '// Bundled with Rollup for Node.js\n// This bundle provides an alternative to esbuild and ncc\n',
  },
  external: [
    // Node.js built-ins that should not be bundled
    'fs',
    'path',
    'url',
    'http',
    'https',
    'stream',
    'util',
    'events',
    'buffer',
    'crypto',
    'os',
    'net',
    'tls',
    'zlib',
    'querystring',
    'string_decoder',
    'punycode',
    'dns',
    'dgram',
    'child_process',
    'cluster',
    'module',
    'perf_hooks',
    'inspector',
    'async_hooks',
    'worker_threads',
  ],
  plugins: [
    resolve({
      preferBuiltins: true,
      exportConditions: ['node'],
    }),
    commonjs({
      ignoreDynamicRequires: false,
    }),
    json(),
  ],
  onwarn(warning, warn) {
    // Suppress certain warnings
    if (warning.code === 'CIRCULAR_DEPENDENCY') return;
    if (warning.code === 'THIS_IS_UNDEFINED') return;
    warn(warning);
  },
};
