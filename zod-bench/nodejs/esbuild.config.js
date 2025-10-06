// esbuild configuration for bundling the Node.js Express app
// This bundles the app similarly to how Wrangler bundles for Cloudflare Workers

import * as esbuild from 'esbuild';
import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

console.log('Building with esbuild...');

try {
  await esbuild.build({
    entryPoints: [resolve(__dirname, 'server.mjs')],
    bundle: true,
    platform: 'node',
    target: 'node18',
    format: 'esm',
    outfile: resolve(__dirname, 'dist-esbuild/index.js'),
    external: [
      // These are typically available in Node.js and don't need bundling
    ],
    minify: false,
    sourcemap: true,
    banner: {
      js: '// Bundled with esbuild for Node.js\n// This bundle is comparable to Wrangler\'s output for Cloudflare Workers\n',
    },
    metafile: true,
    logLevel: 'info',
  });

  // Read the metafile to analyze bundle composition
  const metafilePath = resolve(__dirname, 'dist-esbuild/index.js.map');

  console.log('\n✅ Build successful!');
  console.log(`Output: dist-esbuild/index.js`);
  console.log(`\nTo run the bundled app:`);
  console.log(`  node dist-esbuild/index.js`);
  console.log(`\nTo profile startup:`);
  console.log(`  pnpm check-startup:esbuild`);
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}
