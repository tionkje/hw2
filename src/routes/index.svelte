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
    console.error(await res.text());
  }
</script>

<script lang="ts">
  import Login from '$lib/Login.svelte';

  export let compos;
</script>

<svelte:head>
  <title>Home</title>
</svelte:head>

<section>
  {#each compos as comp}
    <a href="./compos/{comp.id}">{comp.name}</a>
  {/each}

  <Login />
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
