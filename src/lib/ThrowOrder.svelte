<script lang="ts">
  import EditMeter from '$lib/EditMeter.svelte';
  import { API } from '$lib/serverApi';
  import { session } from '$app/stores';
  import { hwInfo } from '$lib/stores';
  import { compo, meterId, editMeterOpen } from '$lib/stores.js';

  import Attempts from '$lib/Attempts.svelte';
  import JudgeThrower from '$lib/JudgeThrower.svelte';
  import Thrower from '$lib/Thrower.svelte';

  let meter;
  $: meter = $compo.meters[$meterId];
  let throwers;
  $: throwers = (meter?.throwOrder ?? []).map((tid) => ({
    tid,
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
  {#if throwers.length > 0}
    <section>
      <div style="display:contents">
        <div class="rugnr">#</div>
        <div class="name">name</div>
        <div class="attempts">{height}m</div>
      </div>
      {#each throwers as thrower, index}
        <div class:first={index == 0} style="display:contents">
          <div class="rugnr">{thrower.thrower.rugnr}</div>
          <div class="name"><Thrower bind:throwerId={thrower.tid} /></div>
          <div class="attempts">
            <Attempts attempts={thrower.thrower.categories[thrower.categoryId][height]} />
            {#if index == 0}
              ?
            {/if}
          </div>
        </div>
      {/each}
    </section>

    {#if $meterId}
      <JudgeThrower bind:throwerId={meter.throwOrder[0]} bind:categoryId={throwers[0].categoryId} />
    {/if}
  {:else}
    <div class="noThrowers">
      <div>No Throws at this height</div>
      <button on:click={(e) => ($editMeterOpen = true)}>Edit meters</button>
      <EditMeter compo={$compo} meterId={$meterId} />
    </div>
  {/if}
</main>

<style>
  main {
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
    grid-template-columns: repeat(3, max-content);
    grid-gap: 1px;
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
</style>
