<script context="module" lang="ts">
  import type { LoadOutput, LoadInput } from '@sveltejs/kit';
  export const prerender = true;
  export async function load({ fetch }: LoadInput): Promise<LoadOutput> {
    let res = await fetch('/api/compo');
    if (res.ok) {
      return {
        props: { compos: await res.json() },
      };
    }
    console.error(res.text());
    console.error(await res.text());
  }
</script>

<script lang="ts">
  import Counter from '$lib/Counter/index.svelte';

  export let compos;

  async function test() {
    var body = { a: 'test' };

    var res = await fetch('/api/compo', {
      method: 'PUT',
      body: JSON.stringify(body),
    });
    var bla = await res.text();
    console.log(bla);
  }
</script>

<svelte:head>
  <title>Home</title>
</svelte:head>

<section>
  <pre>
  {JSON.stringify(compos)}
  </pre>
  hai

  <button on:click={() => test()}>TEST</button>

  <Counter />
</section>

<style>
  section {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    flex: 1;
  }
</style>
