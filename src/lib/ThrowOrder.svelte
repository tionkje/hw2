<script lang="ts">
  import { API } from '$lib/serverApi';
  import { session } from '$app/stores';
  import { hwInfo } from '$lib/stores';
  import { compo, meterId } from '$lib/stores.js';

  import Attempts from '$lib/Attempts.svelte';
  import JudgeThrower from '$lib/JudgeThrower.svelte';

  let meter;
  $: meter = $compo.meters[$meterId];
  let throwers;
  $: throwers = (meter?.throwOrder ?? []).map((tid) => ({
    categoryId: meter.categories.find((catId) => $compo.throwers[tid].categories[catId]),
    thrower: $compo.throwers[tid],
  }));
  let height;
  $: height = meter?.height;

  function getThrowerData(thrower) {
    const hwThrower = $hwInfo.throwers[thrower.hwId];
    const group = $hwInfo.groups[hwThrower.vendelgroepid];
    return { thrower, hwThrower, group };
  }
</script>

<main>
  <section>
    <div class="rugnr">#</div>
    <div class="name">name</div>
    <div class="attempts" />
    {#each throwers as thrower, index}
      <div class="rugnr">{thrower.thrower.rugnr}</div>
      <div class="name">{thrower.thrower.name}</div>
      <div class="attempts">
        <Attempts attempts={thrower.thrower.categories[thrower.categoryId][height]} />
        {#if index == 0}
          ?
        {/if}
      </div>
    {/each}
  </section>

  {#if $meterId}
    <JudgeThrower bind:throwerId={meter.throwOrder[0]} bind:categoryId={throwers[0].categoryId} />
  {/if}
</main>

<style>
  main {
    --background-color: white;
    --text-color: black;

    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    height: 100%;
  }

  section {
    flex-shrink: 1;
    overflow: auto;
    display: grid;
    grid-template-columns: repeat(3, max-content);
    grid-gap: 1px;
  }
  section > * {
    background-color: var(--background-color);
    display: flex;
    align-items: center;
    padding: 2px 5px;
  }
  .rugnr {
    text-align: right;
  }
  .attempts {
    text-align: right;
    min-width: 50px;
  }
</style>
