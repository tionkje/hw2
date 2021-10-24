<script lang="ts">
  import { compo, categoryId, meterId } from '$lib/stores.js';

  import Attempts from '$lib/Attempts.svelte';
  import Thrower from '$lib/Thrower.svelte';
  import HeightStats from '$lib/HeightStats.svelte';

  // throwers in this category
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
    const ranked = $compo.categories[$categoryId].ranking;
    ranking = [
      // upcoming throwers
      ...throwOrder.map((tid) => [tid, -1]),
      // skipping this height or already successfully thrown
      ...throwers
        .slice()
        .sort((a, b) => a.skipHeight - b.skipHeight)
        .map((x) => $compo.throwers.indexOf(x))
        // filter all but the remaining throwers
        .filter((tid) => !throwOrder.includes(tid) && !ranked.find(([id]) => id == tid))
        .map((tid) => [tid, -2]),
      // eliminated throwers
      ...ranked,
    ];
  }

  let currentThrowers = [];
  $: currentThrowers = $compo.meters.map((x) => x.throwOrder[0]);
</script>

<div
  class="ranking"
  style="grid-template-columns: repeat(4, max-content) {heights.length ? `repeat(${heights.length}, 1fr)` : ''};"
>
  <div style="display:contents" class="topheader">
    <div class="leftheader">#</div>
    <div class="rank">#</div>
    <div class="height" />
    <div class="name">name</div>
    {#each heights as height}
      <div>
        <div>{height}m</div>
        <HeightStats stats={$compo.categories[$categoryId].stats[height]} />
      </div>
    {/each}
  </div>
  {#each ranking as [throwerId, rank]}
    <div style="display:contents" class:current={currentThrowers.includes(throwerId)}>
      <div class="leftheader">{$compo.throwers[throwerId].rugnr}</div>
      {#if $compo.throwers[throwerId].success}
        {#if rank >= 0}
          <div class="rank">{rank + 1}</div>
        {:else}
          <div class="rank">-</div>
        {/if}
        <div class="height">{$compo.throwers[throwerId].success}m</div>
      {:else}
        <!-- eliminated without success -->
        <div class="rank">-</div>
        <div class="height" />
      {/if}
      <div class="name"><Thrower bind:throwerId /></div>
      {#each heights as height, index}
        <div
          class:activeHeight={$compo.meters
            .filter((m) => m.categories.includes(Number($categoryId)))
            .some((x) => x.height == height)}
        >
          <!-- Skipping this height -->
          {#if +$compo.throwers[throwerId].skipHeight >= height && $compo.throwers[throwerId].categories[$categoryId][height]?.length == 0}
            &#10148;
          {/if}

          <Attempts bind:attempts={$compo.throwers[throwerId].categories[$categoryId][height]} />
          {#if $compo.meters.some((x) => x.throwOrder[0] == throwerId && x.height == height)}
            ?
          {/if}
        </div>
      {/each}
    </div>
  {/each}
</div>

<style>
  .ranking {
    --grid-gap: 1px;
    --grid-cell-padding: 5px;
    --rank-width: 27px;
    --height-width: 50px;
    --background-color: white;
    --background-color-current: #ffcaa4;
    --background-color-active-height: #ffe1cb;
    --text-color: black;
    --shadow-color: #afafaf;

    display: grid;
    grid-gap: var(--grid-gap);
    width: max-content;
    position: relative;
    color: var(--text-color);
  }
  .ranking > div > * {
    background: var(--background-color);
    white-space: nowrap;
    text-align: left;
    padding: 0px var(--grid-cell-padding);
  }
  .ranking .topheader > div {
    position: sticky;
    top: 0;
    text-align: center;
    box-shadow: 0px 2px 4px 0px var(--shadow-color);
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .ranking .leftheader {
    position: sticky;
    left: 0;
    box-shadow: 2px 0 4px 0px var(--shadow-color);
  }
  .ranking .leftheader.topheader {
    z-index: 3;
  }
  .ranking .activeHeight {
    background-color: var(--background-color-active-height);
  }
  .ranking .current > * {
    background-color: var(--background-color-current);
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
