// Cloudflare Worker AI SDK implementation
// This is a minimal example to benchmark AI SDK startup time

import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === '/') {
      return new Response('AI SDK Cloudflare Worker Benchmark - Visit /generate to test', {
        headers: { 'Content-Type': 'text/plain' },
      });
    }

    if (url.pathname === '/generate') {
      try {
        // This is a basic example using the AI SDK
        // The startup cost includes importing and initializing the SDK
        const { text } = await generateText({
          model: openai('gpt-4o-mini'),
          prompt: 'Say hello in one sentence',
        });

        return new Response(JSON.stringify({
          message: 'AI SDK Response',
          text: text,
          timestamp: new Date().toISOString()
        }), {
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (error) {
        return new Response(JSON.stringify({
          error: error.message,
          stack: error.stack
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    return new Response('Not Found', { status: 404 });
  },
};
