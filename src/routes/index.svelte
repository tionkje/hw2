<script context="module" lang="ts">
  import type { LoadOutput, LoadInput } from '@sveltejs/kit';
  export async function load({ fetch, page }: LoadInput): Promise<LoadOutput> {
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
  import { session } from '$app/stores';
  import Login from '$lib/Login.svelte';

  // close side of compo views when in list view
  import { sideOpen } from '$lib/stores.js';
  $sideOpen = false;

  export let compos = [];

  async function delCompo(id, name) {
    if (confirm(`Are you sure to delete ${name || id}?`)) {
      const res = await fetch(`api/${id}`, { method: 'DELETE' });
      if (!res.ok) return;
      compos = compos.filter((c) => c._id !== id);
      return;
    }
  }

  async function createCompetition() {
    const res = await fetch('api/compos', { method: 'POST' });
    if (!res.ok) throw new Error(res.statusText);
    const newCompo = await res.json();
    compos.push(newCompo);
    compos = compos;
  }
</script>

<svelte:head>
  <title>Home</title>
</svelte:head>

<section>
  {#each compos as comp}
    <div>
      <a href="./{comp.fromFile ? 'old_' + comp._id : comp.name || comp._id}">{comp.name || comp._id}</a>
      {#if !comp.fromFile && $session.loggedin}
        <button on:click={(e) => delCompo(comp._id, comp.name)}>Delete</button>
      {/if}
    </div>
  {/each}

  <Login />

  {#if $session.loggedin}
    <button on:click={createCompetition}>Create New</button>
  {/if}
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
