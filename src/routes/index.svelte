<script context="module" lang="ts">
  export const prerender = true;
  export async function load({ fetch }) {
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

  <button on:click={(e) => test()}>TEST</button>

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

  h1 {
    width: 100%;
  }

  .welcome {
    position: relative;
    width: 100%;
    height: 0;
    padding: 0 0 calc(100% * 495 / 2048) 0;
  }

  .welcome img {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    display: block;
  }
</style>
