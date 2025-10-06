// Node.js Express AI SDK implementation
// This is a minimal example to benchmark AI SDK startup time

import express from 'express';
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('AI SDK Node.js Express Benchmark - Visit /generate to test');
});

app.get('/generate', async (req, res) => {
  try {
    // This is a basic example using the AI SDK
    // The startup cost includes importing and initializing the SDK
    const { text } = await generateText({
      model: openai('gpt-4o-mini'),
      prompt: 'Say hello in one sentence',
    });

    res.json({
      message: 'AI SDK Response',
      text: text,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      stack: error.stack
    });
  }
});

app.listen(PORT, () => {
  // If running in profile mode, give it a moment then exit
  if (process.env.PROFILE_MODE === 'startup') {
    setTimeout(() => {
      console.log('Profile complete, exiting...');
      process.exit(0);
    }, 100);
  }
});
