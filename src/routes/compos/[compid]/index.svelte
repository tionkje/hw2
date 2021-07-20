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
    /* console.error(res.text()); */
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

  // $: location.hash = categoryId;
</script>

<ul>
  {#each compo.categories as cat, index}
    <!-- <li class:active={categoryId == index} on:click={(e) => (categoryId = index)}>{cat.name}</li> -->
    <li class:active={categoryId == index}><a href="?cat={index}">{cat.name}</a></li>
  {/each}
</ul>

{#if compo.categories[categoryId]}
  <div class="ranking" style="grid-template-columns: 1fr 1fr 1fr repeat({heights.length}, 1fr);">
    <div class="topheader leftheader rank">#</div>
    <div class="topheader leftheader height" />
    <div class="topheader leftheader name">name</div>
    {#each heights as height}
      <div class="topheader">{height}</div>
    {/each}
    {#each compo.categories[categoryId].ranking as [throwerId, rank]}
      <div class="leftheader rank">{rank + 1}</div>
      <div class="leftheader height">{compo.throwers[throwerId].success}m</div>
      <div class="leftheader name">{compo.throwers[throwerId].name}</div>
      {#each heights as height, index}
        <div>
          <!-- {compo.throwers[throwerId].categories[categoryId][height] || ' '} -->
          <Attempts bind:attempts={compo.throwers[throwerId].categories[categoryId][height]} />
        </div>
      {/each}
    {/each}
  </div>
{/if}

<!-- <div> -->
<!--   {#each throwers as thrower} -->
<!--     <div> -->
<!--       {thrower.name} -->
<!--     </div> -->
<!--   {/each} -->
<!-- </div> -->

<!-- <pre> -->
<!--   {JSON.stringify(compo.categories[categoryId]?.ranking,0,2)} -->
<!--   {JSON.stringify(throwers,0,2)} -->

<!-- </pre> -->
<style>
  ul {
    display: flex;
  }
  ul > li {
    list-style: none;
    cursor: pointer;
    margin: 5px;
  }
  ul > li.active {
    border-bottom: 1px solid red;
  }

  .ranking {
    --grid-gap: 1px;
    --grid-cell-padding: 5px;
    --rank-width: 17px;
    --height-width: 50px;

    display: grid;
    grid-gap: var(--grid-gap);
    width: 100vw;
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
    width: var(--rank-width);
    text-align: right;
  }
  .ranking .height {
    width: var(--height-width);
    text-align: right;
    left: calc(var(--rank-width) + 2 * var(--grid-cell-padding) + var(--grid-gap));
  }
  .ranking .name {
    left: calc(var(--rank-width) + var(--height-width) + 4 * var(--grid-cell-padding) + 2 * var(--grid-gap));
  }
</style>
