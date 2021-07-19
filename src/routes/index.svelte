<script context="module" lang="ts">
  import type { LoadOutput, LoadInput } from '@sveltejs/kit';
  export const prerender = true;
  export async function load({ fetch }: LoadInput): Promise<LoadOutput> {
    let res = await fetch('/api/compos');
    if (res.ok) {
      return {
        props: { compos: await res.json() },
      };
    }
    /* console.error(res.text()); */
    console.error(await res.text());
  }
</script>

<script lang="ts">
  /* import Counter from '$lib/Counter/index.svelte'; */

  export let compos;

  /* async function test() { */
  /*   var body = { a: 'test' }; */
  /*  */
  /*   var res = await fetch('/api/compos', { */
  /*     method: 'PUT', */
  /*     body: JSON.stringify(body), */
  /*   }); */
  /*   var bla = await res.text(); */
  /*   console.log(bla); */
  /* } */
</script>

<svelte:head>
  <title>Home</title>
</svelte:head>

<section>
  {#each compos as comp}
    <a href="./compos/{comp.id}">{comp.name}</a>
  {/each}
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
