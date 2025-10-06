// Run with: node profile-startup.mjs path/to/entry.mjs

import inspector from 'inspector';
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

const target = process.argv[2];
if (!target) {
  console.error('Usage: node profile-startup.mjs <path-to-entry.mjs>');
  process.exit(1);
}

const session = new inspector.Session();
session.connect();

try { await session.post('Profiler.setSamplingInterval', { interval: 1000 }); } catch {}
await session.post('Profiler.enable');
await session.post('Profiler.start');

// Importing triggers parse + top-level execution/TLA across the module graph
await import(pathToFileURL(path.resolve(target)).href);

// Stop immediately after top-level completes
const { profile } = await new Promise((resolve, reject) => {
  session.post('Profiler.stop', (err, res) => (err ? reject(err) : resolve(res)));
});

const out = path.resolve(process.cwd(), 'startup.cpuprofile');
fs.writeFileSync(out, JSON.stringify(profile));
console.log(`Wrote ${out}`);
process.exit(0);
