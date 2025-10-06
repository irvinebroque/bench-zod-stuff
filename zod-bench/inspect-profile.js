#!/usr/bin/env node

// This script provides detailed inspection of a specific CPU profile

import { readFileSync } from 'fs';

if (process.argv.length < 3) {
  console.log('Usage: node inspect-profile.js <profile.cpuprofile>');
  console.log('');
  console.log('Examples:');
  console.log('  node inspect-profile.js cf/worker-startup.cpuprofile');
  console.log('  node inspect-profile.js nodejs/nodejs-startup.cpuprofile');
  process.exit(1);
}

const profilePath = process.argv[2];
const profile = JSON.parse(readFileSync(profilePath, 'utf-8'));

console.log(`\n=== Profile: ${profilePath} ===\n`);

// Basic stats
const startTime = profile.startTime;
const endTime = profile.endTime;
const duration = endTime - startTime;

console.log('Basic Information:');
console.log(`  Start Time: ${startTime}`);
console.log(`  End Time: ${endTime}`);
console.log(`  Duration: ${(duration / 1000000).toFixed(2)}ms`);
console.log(`  Total Nodes: ${profile.nodes.length}`);
console.log(`  Total Samples: ${profile.samples.length}`);
console.log('');

// Analyze function call times
const functionTimes = new Map();
const functionHitCount = new Map();

profile.samples.forEach((nodeId, index) => {
  const node = profile.nodes.find(n => n.id === nodeId);
  if (node) {
    const functionName = node.callFrame.functionName || '(anonymous)';
    const url = node.callFrame.url || '';
    const lineNumber = node.callFrame.lineNumber;
    const key = `${functionName} @ ${url}:${lineNumber}`;

    const timeDelta = profile.timeDeltas[index] || 0;
    functionTimes.set(key, (functionTimes.get(key) || 0) + timeDelta);
    functionHitCount.set(key, (functionHitCount.get(key) || 0) + 1);
  }
});

// Sort and display
const sorted = Array.from(functionTimes.entries())
  .sort((a, b) => b[1] - a[1]);

console.log('Top Functions by Time:');
console.log('');

sorted.slice(0, 30).forEach(([key, time], index) => {
  const hits = functionHitCount.get(key);
  const percentage = ((time / 1000) / (duration / 1000000) * 100).toFixed(1);
  console.log(`${(index + 1).toString().padStart(2)}. ${key}`);
  console.log(`    Time: ${(time / 1000).toFixed(2)}ms (${percentage}%)`);
  console.log(`    Hits: ${hits}`);
  console.log('');
});

// Categorize by module
console.log('\n=== Module Breakdown ===\n');

const moduleCategories = new Map();
sorted.forEach(([key, time]) => {
  let category = 'unknown';

  if (key.includes('node:') || key.includes('node-internal:')) {
    category = 'Node.js Internals';
  } else if (key.includes('node_modules')) {
    category = 'Dependencies';
  } else if (key.includes('zod')) {
    category = 'Zod';
  } else if (key.includes('ai') || key.includes('@ai-sdk')) {
    category = 'AI SDK';
  } else if (key.includes('express')) {
    category = 'Express';
  } else if (key.includes('(idle)') || key.includes('(garbage collector)')) {
    category = 'Runtime Overhead';
  } else if (key.includes('(program)') || key.includes('(anonymous)')) {
    category = 'Program/Anonymous';
  } else if (key.includes('Users/brendan')) {
    category = 'Application Code';
  }

  moduleCategories.set(category, (moduleCategories.get(category) || 0) + time);
});

const sortedCategories = Array.from(moduleCategories.entries())
  .sort((a, b) => b[1] - a[1]);

sortedCategories.forEach(([category, time]) => {
  const percentage = ((time / 1000) / (duration / 1000000) * 100).toFixed(1);
  console.log(`${category.padEnd(25)} ${(time / 1000).toFixed(2).padStart(8)}ms (${percentage.padStart(5)}%)`);
});

console.log('\n=== Analysis Complete ===\n');
