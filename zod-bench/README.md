## Instructions

### Generate profile for the Worker:

1. `cd ./cf`
2. `pnpm install`
3. `npm run check-startup`

### Generate profile for the Node.js app:

1. `cd ./nodejs`
2. `npm run build:rollup` (TODO: fix the esbuild config, there is an esbuild option here but it is borked)
2. `npm run check-startup:rollup`

### Compare

From the `/zod-bench` dir:

`npm run analyze`

Should give you results like this

```
Cloudflare Worker:
  - Profile Duration: 0.0346ms
  - Nodes: 30
  - Samples: 14

Node.js Express:
  - Profile Duration: 0.0342ms
  - Nodes: 90
  - Samples: 26

Profile Size Comparison:
  - CF Profile is 1.01x the duration
  - CF has 0.33x the nodes
  - CF has 0.54x the samples
```


## vNext

- CLI tool
- Takes a Worker as input
- Generates code that can run in Node.js (ex: using https://github.com/mjackson/remix-the-web/tree/main/packages/node-fetch-server)
- Bundles it same way as Wrangler does, same esbuild config
- Generates a profile
- Analyzes and compares

^ Would be able to take a Worker and look at the startup time of the ~same code running in Node.js