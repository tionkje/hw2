<script lang="ts">
  import Attempts from '$lib/Attempts.svelte';
  export let compo;
  export let categoryId;
  let throwers;
  $: throwers = compo.throwers.filter((t) => t.categories[categoryId]);
  let heights;
  $: heights = throwers
    .flatMap((t) => Object.keys(t.categories[categoryId]))
    .filter((x, i, a) => a.indexOf(x) == i)
    .sort((a, b) => a - b);
</script>

{#if categoryId && compo.categories[categoryId]}
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
{/if}

<style>
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
