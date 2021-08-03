<script context="module" lang="ts">
  import { compo, categoryId } from '$lib/stores.js';
  import type { LoadOutput, LoadInput } from '@sveltejs/kit';
  async function fetchCompo(fetch, compid) {
    let res = await fetch(`/api/${compid}`);
    if (res.ok) return await res.json();
    else console.log('Failed getting compo:', res.status, await res.text());
  }

  export async function load({ fetch, page }: LoadInput): Promise<LoadOutput> {
    const { compid } = page.params;
    compo.set(await fetchCompo(fetch, compid));
    categoryId.set(page.query.get('cat'));
    return { props: { compid } };
  }
</script>

<script lang="ts">
  import { session } from '$app/stores';

  import Login from '$lib/Login.svelte';

  import Modal from '$lib/Modal.svelte';
  import EditCompetition from '$lib/EditCompetition.svelte';
  import EditMeters from '$lib/EditMeters.svelte';

  export let compid;

  let catName;
  $: catName = $compo.categories[$categoryId]?.name || '';

  let sideopen = false;
  let editOpen = false;
  let editMeterOpen = false;
</script>

<svelte:head>
  <title>{$compo.name || $compo._id} {catName}</title>
</svelte:head>

{#if $session.loggedin}
  <Modal bind:open={editOpen} canClose={false}>
    <EditCompetition bind:compo={$compo} on:close={(e) => (editOpen = false)} />
  </Modal>
  <Modal bind:open={editMeterOpen} canClose={false}>
    Add meter
    <EditMeters bind:compo={$compo} on:close={(e) => (editMeterOpen = false)} />
  </Modal>
{/if}

<ul class:open={sideopen}>
  <div class="icon btn" on:click={(e) => (sideopen = false)}>×</div>
  {#if $session.loggedin}
    <li><a href on:click|preventDefault={(e) => (editOpen = true)}>Edit</a></li>
  {/if}
  {#if $session.loggedin}
    <li><a href on:click|preventDefault={(e) => (editMeterOpen = true)}>Meters</a></li>
  {/if}
  <li><a href="..">List</a></li>
  <li><a href="{compid}/print?cat={$categoryId}">Print</a></li>
  {#each $compo.categories as cat, index}
    <li class:active={$categoryId == index} on:click={(e) => (sideopen = false)}>
      <a href="?cat={index}">{cat.name}</a>
    </li>
  {/each}
  <li><Login /></li>
</ul>
<div class="shim" class:open={sideopen} on:click={(e) => (sideopen = !sideopen)} />

<main>
  <nav>
    <div class="icon btn" on:click={(e) => (sideopen = true)}>☰</div>
    {$compo.name || $compo._id}
    {catName}
  </nav>

  {#if !compid.match('old_') && $compo.meters.length == 0 && $session.loggedin}
    <button on:click={(e) => (editMeterOpen = true)}>Add Meter</button>
  {/if}

  {#if $compo.categories[$categoryId]}
    <section>
      <slot />
    </section>
  {:else}
    <section class="list">
      {#if $session.loggedin && $compo.categories.length == 0}
        <a href on:click|preventDefault={(e) => (editOpen = true)}>Edit</a>
      {/if}
      {#each $compo.categories as cat, index}
        <div>
          <a href="?cat={index}">{cat.name}</a>
        </div>
      {/each}
    </section>
  {/if}
</main>

<style>
  ul {
    transform: translate(-100%);
    position: fixed;
    display: flex;
    flex-direction: column;
    transition: transform 0.4s;
    z-index: 10;
    background: white;
    height: 100vh;
    top: 0;
    margin: 0;
    padding: 0;
  }
  ul.open {
    transform: translate(0);
  }
  .shim.open {
    opacity: 0.1;
    pointer-events: all;
  }
  .shim {
    z-index: 9;
    pointer-events: none;
    /* z-index:-1; */
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: black;
    opacity: 0;
    transition: opacity 0.4s;
  }
  ul > li {
    list-style: none;
    cursor: pointer;
    margin: 5px;
  }
  ul > li.active {
    border-bottom: 1px solid red;
  }

  nav {
    display: flex;
    align-items: center;
  }
  main {
    position: fixed;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
  }

  .icon {
    font-size: 20px;
    padding: 2px 5px;
    width: 30px;
    height: 30px;
  }
  .btn {
    cursor: pointer;
    transition: transform 0.4s;
  }
  .btn:hover {
    transform: scale(1.1);
  }

  section {
    overflow: scroll;
    height: 100%;
  }
  section.list {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
  }
</style>
