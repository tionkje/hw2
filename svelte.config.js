import preprocess from 'svelte-preprocess';
import vercel from '@sveltejs/adapter-vercel';
import { readFileSync } from 'fs';

const pkg = JSON.parse(readFileSync('./package.json'));

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://github.com/sveltejs/svelte-preprocess
  // for more information about preprocessors
  preprocess: preprocess(),

  kit: {
    // hydrate the <div id="svelte"> element in src/app.html
    target: '#svelte',
    adapter: vercel(),
    vite: {
      ssr: {
        external: Object.keys(pkg.dependencies),
      },
    },
  },
};

export default config;
