<script lang="ts">
  import EditMeter from '$lib/EditMeter.svelte';
  import { API } from '$lib/serverApi';
  import { session } from '$app/stores';
  import { hwInfo } from '$lib/stores';
  import { compo, meterId } from '$lib/stores.js';

  import Attempts from '$lib/Attempts.svelte';
  import JudgeThrower from '$lib/JudgeThrower.svelte';
  import Thrower from '$lib/Thrower.svelte';

  let meter;
  $: meter = $compo.meters[$meterId];
  let categories;
  $: categories = meter?.categories ?? [];
  let throwers;
  $: throwers = [...(meter?.throwOrder || []), -1, ...(meter?.nextHeightThrowOrder || [])].map((tid) => {
    if (tid < 0) return null;
    return {
      tid,
      categoryId: meter?.categories.find((catId) => $compo.throwers[tid]?.categories[catId]),
      thrower: $compo.throwers[tid],
    };
  });
  let height;
  $: height = meter?.height;

  // get prev height
  let prevHeight;
  $: {
    // - get list off all heights of all active categories
    const heights = throwers
      .filter((x) => x)
      .flatMap((x) => Object.keys(x.thrower.categories[x.categoryId]).map(Number))
      .filter((x, i, a) => a.indexOf(x) == i)
      .sort((a, b) => a - b);
    // - get height one lower then current meter height
    const idx = heights.indexOf(height) - 1;
    prevHeight = idx < 0 ? false : heights[idx];
  }

  function getThrowerData(thrower) {
    const hwThrower = $hwInfo.throwers[thrower.hwId];
    const group = $hwInfo.groups[hwThrower.vendelgroepid];
    return { thrower, hwThrower, group };
  }
</script>

<main>
  {#if throwers.length > 0}
    <section style="grid-template-columns: repeat({prevHeight ? 4 : 3}, max-content)">
      <div style="display:contents">
        <div class="rugnr">#</div>
        <div class="name">name</div>
        {#if prevHeight}
          <div class="attempts prevHeight">{prevHeight}m</div>
        {/if}
        <div class="attempts height">{height}m</div>
      </div>
      {#each throwers as thrower, index}
        {#if thrower == null || !thrower.thrower}
          <div class="spacer" style="display:contents;">
            <div />
            <div>&nbsp;</div>
            {#if prevHeight}
              <div />
            {/if}
            <div />
          </div>
        {:else}
          <div class:first={index == 0} style="display:contents">
            <div class="rugnr">{thrower.thrower.rugnr}</div>
            <div class="name"><Thrower bind:throwerId={thrower.tid} /></div>
            {#if prevHeight}
              <div class="attempts prevHeight">
                <Attempts attempts={thrower.thrower.categories[thrower.categoryId][prevHeight]} />
              </div>
            {/if}
            <div class="attempts height">
              <Attempts attempts={thrower.thrower.categories[thrower.categoryId][height]} />
              {#if index == 0}
                ?
              {/if}
            </div>
          </div>
        {/if}
      {/each}
    </section>

    {#if $meterId}
      <JudgeThrower bind:throwerId={meter.throwOrder[0]} bind:categoryId={throwers[0].categoryId} />
    {/if}
  {:else}
    <div class="noThrowers">
      <div>No Throws at this height</div>
      <EditMeter compo={$compo} meterId={$meterId} />
    </div>
  {/if}
</main>

<style>
  main {
    --spacer-background-color: transparent;
    --background-color: white;
    --background-color-first: #ffcaa4;
    --text-color: black;

    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    height: 100%;
  }

  .noThrowers {
    display: flex;
    flex-direction: column;
    height: 100%;
    align-items: center;
    justify-content: space-evenly;
  }

  section {
    flex-shrink: 1;
    overflow: auto;
    display: grid;
    /* grid-template-columns: repeat(3, max-content); */
    grid-gap: 1px;
  }
  section > .spacer > * {
    background-color: var(--spacer-background-color);
  }
  section > div > * {
    background-color: var(--background-color);
    display: flex;
    align-items: center;
    padding: 2px 5px;
  }
  section > .first > * {
    background-color: var(--background-color-first);
  }
  .rugnr {
    text-align: right;
    display: block;
  }
  .attempts {
    text-align: right;
    min-width: 50px;
  }
  .prevHeight {
    opacity: 0.8;
  }
  .height {
    background: #f2e3de;
  }
</style>
