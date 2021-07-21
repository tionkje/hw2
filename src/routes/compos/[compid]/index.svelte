<script context="module" lang="ts">
  import Ranking from '$lib/Ranking.svelte';
  import type { LoadOutput, LoadInput } from '@sveltejs/kit';
  export const prerender = true;
  export async function load({ fetch, page }: LoadInput): Promise<LoadOutput> {
    const { compid } = page.params;
    let res = await fetch(`/api/${compid}`);
    if (res.ok) {
      return {
        props: { compid, compo: await res.json(), categoryId: page.query.get('cat') },
      };
    }
    console.error(await res.text());
  }
</script>

<script lang="ts">
  export let compid;
  export let compo;
  export let categoryId;
  let catName;
  $: catName = compo.categories[categoryId]?.name || '';

  let sideopen = false;
</script>

<ul class:open={sideopen}>
  <div class="icon btn" on:click={(e) => (sideopen = false)}>×</div>
  <li><a href="..">List</a></li>
  <li><a href="./print/{compid}?cat={categoryId}">Print</a></li>
  {#each compo.categories as cat, index}
    <li class:active={categoryId == index} on:click={(e) => (sideopen = false)}>
      <a href="?cat={index}">{cat.name}</a>
    </li>
  {/each}
</ul>
<div class="shim" class:open={sideopen} on:click={(e) => (sideopen = !sideopen)} />

<main>
  <nav>
    <div class="icon btn" on:click={(e) => (sideopen = true)}>☰</div>

    {catName}
  </nav>

  {#if compo.categories[categoryId]}
    <section>
      <Ranking bind:compo bind:categoryId />
    </section>
  {:else}
    <section class="list">
      {#each compo.categories as cat, index}
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
  @media print {
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
</style>
