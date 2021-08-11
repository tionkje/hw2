<script lang="ts">
  import { compo, categoryId, meterId } from '$lib/stores.js';

  import Attempts from '$lib/Attempts.svelte';
  import Thrower from '$lib/Thrower.svelte';

  let throwers;
  $: throwers = $compo.throwers.filter((t) => t.categories[$categoryId]);
  let throwOrder;
  $: throwOrder = $compo.meters
    .flatMap((m) => m.throwOrder)
    .filter((tid) => throwers.find((t) => $compo.throwers.indexOf(t) == tid));

  let heights;
  $: heights = throwers
    .flatMap((t) => Object.keys(t.categories[$categoryId]))
    .filter((x, i, a) => a.indexOf(x) == i)
    .sort((a, b) => a - b);
  let catName;
  $: catName = $compo.categories[$categoryId]?.name || '';
  let ranking = [];
  $: {
    const r = $compo.categories[$categoryId].ranking;
    ranking = [
      ...throwOrder.map((tid) => [tid, -1]),
      ...throwers
        .slice()
        .sort((a, b) => a.skipHeight - b.skipHeight)
        .map((x) => $compo.throwers.indexOf(x))
        .filter((tid) => !throwOrder.includes(tid) && !r.find(([id]) => id == tid))
        .map((tid) => [tid, -1]),
      ...r,
    ];
  }
</script>

<div
  class="ranking"
  style="grid-template-columns: repeat(4, max-content) {heights.length ? `repeat(${heights.length}, 1fr)` : ''};"
>
  <div class="topheader leftheader">#</div>
  <div class="topheader rank">#</div>
  <div class="topheader height" />
  <div class="topheader name">name</div>
  {#each heights as height}
    <div class="topheader">{height}m</div>
  {/each}
  <!-- {#each $compo.categories[$categoryId].ranking as [throwerId, rank]} -->
  {#each ranking as [throwerId, rank]}
    <div class="leftheader">{$compo.throwers[throwerId].rugnr}</div>
    {#if $compo.throwers[throwerId].success}
      {#if rank >= 0}
        <div class="rank">{rank + 1}</div>
      {:else}
        <div class="rank">-</div>
      {/if}
      <div class="height">{$compo.throwers[throwerId].success}m</div>
    {:else}
      <div class="rank">-</div>
      <div class="height" />
    {/if}
    <!-- <div class="name">{$compo.throwers[throwerId].name}</div> -->
    <div class="name"><Thrower bind:throwerId /></div>
    {#each heights as height, index}
      <div>
        <!-- {$compo.throwers[throwerId].categories[$categoryId][height] || ' '} -->
        <Attempts bind:attempts={$compo.throwers[throwerId].categories[$categoryId][height]} />
      </div>
    {/each}
  {/each}
</div>

<style>
  .ranking {
    --grid-gap: 1px;
    --grid-cell-padding: 5px;
    --rank-width: 27px;
    --height-width: 50px;
    --background-color: white;
    --text-color: black;
    --shadow-color: #afafaf;

    display: grid;
    grid-gap: var(--grid-gap);
    width: max-content;
    position: relative;
    color: var(--text-color);
  }
  .ranking > * {
    background: var(--background-color);
    white-space: nowrap;
    text-align: left;
    padding: 0px var(--grid-cell-padding);
  }
  .ranking .topheader {
    position: sticky;
    top: 0;
    text-align: center;
    box-shadow: 0px 2px 4px 0px var(--shadow-color);
  }
  .ranking .leftheader {
    position: sticky;
    left: 0;
    box-shadow: 2px 0 4px 0px var(--shadow-color);
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
