<script context="module" lang="ts">
  import Attempts from '$lib/Attempts.svelte';
  import type { LoadOutput, LoadInput } from '@sveltejs/kit';
  export const prerender = true;
  export async function load({ fetch, page }: LoadInput): Promise<LoadOutput> {
    const { compid } = page.params;
    let res = await fetch(`/api/${compid}`);
    if (res.ok) {
      return {
        props: { compo: await res.json(), categoryId: page.query.get('cat') },
      };
    }
    console.error(await res.text());
  }
</script>

<script lang="ts">
  export let compo;
  export let categoryId;
  let throwers;
  $: throwers = compo.throwers.filter((t) => t.categories[categoryId]);
  let heights;
  $: heights = throwers
    .flatMap((t) => Object.keys(t.categories[categoryId]))
    .filter((x, i, a) => a.indexOf(x) == i)
    .sort((a, b) => a - b);

  let sideopen = false;
</script>

<ul class:open={sideopen}>
  <div class="icon btn" on:click={(e) => (sideopen = false)}>×</div>
  <li><a href="..">List</a></li>
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

    {compo.categories[categoryId]?.name || ''}
  </nav>

  {#if compo.categories[categoryId]}
    <section>
      <div class="ranking" style="grid-template-columns: repeat(4, max-content) repeat({heights.length}, 1fr);">
        <div class="topheader leftheader">#</div>
        <div class="topheader rank">#</div>
        <div class="topheader height" />
        <div class="topheader name">name</div>
        {#each heights as height}
          <div class="topheader">{height}</div>
        {/each}
        {#each compo.categories[categoryId].ranking as [throwerId, rank]}
          <div class="leftheader">{compo.throwers[throwerId].rugnr}</div>
          {#if compo.throwers[throwerId].success}
            <div class="rank">{rank + 1}</div>
            <div class="height">{compo.throwers[throwerId].success}m</div>
          {:else}
            <div class="rank">-</div>
            <div class="height" />
          {/if}
          <div class="name">{compo.throwers[throwerId].name}</div>
          {#each heights as height, index}
            <div>
              <!-- {compo.throwers[throwerId].categories[categoryId][height] || ' '} -->
              <Attempts bind:attempts={compo.throwers[throwerId].categories[categoryId][height]} />
            </div>
          {/each}
        {/each}
      </div>
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

  .ranking {
    --grid-gap: 1px;
    --grid-cell-padding: 5px;
    --rank-width: 27px;
    --height-width: 50px;

    display: grid;
    grid-gap: var(--grid-gap);
    width: max-content;
    position: relative;
  }
  .ranking > * {
    background: white;
    white-space: nowrap;
    text-align: left;
    padding: 0px var(--grid-cell-padding);
  }
  .ranking .topheader {
    position: sticky;
    top: 0;
    text-align: center;
    box-shadow: 0px 2px 4px 0px #afafaf;
  }
  .ranking .leftheader {
    position: sticky;
    left: 0;
    box-shadow: 2px 0 4px 0px #afafaf;
  }
  .ranking .leftheader.topheader {
    z-index: 3;
  }
  .ranking .rank {
    text-align: right;
  }
  .ranking .height {
    text-align: right;
  }
  .ranking .name {
  }
</style>
