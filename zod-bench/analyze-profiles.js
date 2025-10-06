#!/usr/bin/env node

// This script analyzes and compares CPU profiles from both runtimes

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

function analyzeProfile(profilePath, name) {
  const profile = JSON.parse(readFileSync(profilePath, 'utf-8'));

  const startTime = profile.startTime;
  const endTime = profile.endTime;
  const duration = endTime - startTime;

  // Analyze nodes to find most expensive operations
  const nodes = profile.nodes || [];
  const samples = profile.samples || [];
  const timeDeltas = profile.timeDeltas || [];

  // Calculate time spent in each function
  const functionTimes = new Map();

  samples.forEach((nodeId, index) => {
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      const functionName = node.callFrame.functionName || '(anonymous)';
      const url = node.callFrame.url || '';
      const key = `${functionName} - ${url}`;
      const timeDelta = timeDeltas[index] || 0;

      functionTimes.set(key, (functionTimes.get(key) || 0) + timeDelta);
    }
  });

  // Sort by time spent
  const sorted = Array.from(functionTimes.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20);

  console.log(`\n=== ${name} Profile Analysis ===`);
  console.log(`Total Duration: ${(duration / 1000000).toFixed(2)}ms`);
  console.log(`Total Nodes: ${nodes.length}`);
  console.log(`Total Samples: ${samples.length}`);
  console.log(`\nTop 20 Functions by Time:`);

  sorted.forEach(([key, time], index) => {
    console.log(`${index + 1}. ${key}`);
    console.log(`   Time: ${(time / 1000).toFixed(2)}ms`);
  });

  return {
    name,
    duration: duration / 1000000,
    nodes: nodes.length,
    samples: samples.length,
    topFunctions: sorted.slice(0, 10).map(([key, time]) => ({
      function: key,
      time: time / 1000
    }))
  };
}

console.log('=== AI SDK Startup Profile Comparison ===\n');

// Analyze Cloudflare Worker profile
const cfProfile = analyzeProfile(
  join(__dirname, 'cf/worker-startup.cpuprofile'),
  'Cloudflare Worker'
);

// Analyze Node.js profile
const nodejsProfile = analyzeProfile(
  join(__dirname, 'nodejs/startup.cpuprofile'),
  'Node.js Express'
);

console.log('\n\n=== Comparison Summary ===');
console.log(`\nCloudflare Worker:`);
console.log(`  - Profile Duration: ${cfProfile.duration.toFixed(4)}ms`);
console.log(`  - Nodes: ${cfProfile.nodes}`);
console.log(`  - Samples: ${cfProfile.samples}`);

console.log(`\nNode.js Express:`);
console.log(`  - Profile Duration: ${nodejsProfile.duration.toFixed(4)}ms`);
console.log(`  - Nodes: ${nodejsProfile.nodes}`);
console.log(`  - Samples: ${nodejsProfile.samples}`);

console.log(`\nProfile Size Comparison:`);
console.log(`  - CF Profile is ${(cfProfile.duration / nodejsProfile.duration).toFixed(2)}x the duration`);
console.log(`  - CF has ${(cfProfile.nodes / nodejsProfile.nodes).toFixed(2)}x the nodes`);
console.log(`  - CF has ${(cfProfile.samples / nodejsProfile.samples).toFixed(2)}x the samples`);

console.log('\n=== Analysis Complete ===');
console.log('\nNext Steps:');
console.log('1. Load the CPU profiles in Chrome DevTools to view flamegraphs:');
console.log('   - Open chrome://inspect');
console.log('   - Click "Open dedicated DevTools for Node"');
console.log('   - Go to Profiler tab and click "Load"');
console.log('   - Load cf/worker-startup.cpuprofile');
console.log('   - Load nodejs/nodejs-startup.cpuprofile');
console.log('');
console.log('2. Look for:');
console.log('   - Module resolution/loading time');
console.log('   - AI SDK initialization overhead');
console.log('   - esbuild bundling effects (CF)');
console.log('   - Express initialization overhead (Node.js)');
console.log('');
console.log('3. Key areas to investigate:');
console.log('   - Time spent in AI SDK imports');
console.log('   - Zod schema validation overhead');
console.log('   - Provider initialization');
console.log('   - Runtime-specific overhead');
