<script lang="ts">
  import { API } from '$lib/serverApi';
  import { session } from '$app/stores';

  import Attempts from '$lib/Attempts.svelte';

  export let compo;
  export let meterId;

  let meter;
  $: meter = compo.meters[meterId];
  let throwers;
  $: throwers = meter.throwOrder.map((tid) => ({
    categoryId: meter.categories.find((catId) => compo.throwers[tid].categories[catId]),
    thrower: compo.throwers[tid],
  }));
  let height;
  $: height = meter.height;

  async function judge(judge) {
    compo = await API.judgeThrow(compo._id, meter.throwOrder[0], height, judge, throwers[0].categoryId);
  }
  async function judgeSuccess() {
    await judge('V');
  }
  async function judgeFail() {
    await judge('X');
  }
</script>

{#each throwers as thrower}
  <div>
    {thrower.thrower.name}
    <Attempts attempts={thrower.thrower.categories[thrower.categoryId][height]} />
    {JSON.stringify(thrower.thrower.categories[thrower.categoryId][height], 0, 2)}
    {thrower.thrower.categories}
  </div>
{/each}

<!-- <pre>{JSON.stringify(meter,0,2)}</pre> -->
<!-- <pre>{JSON.stringify(throwers,0,2)}</pre> -->

<div class="judgePanel">
  <h1>{meter.name} {height}m</h1>

  {#if $session.loggedin}
    <button on:click={judgeSuccess}>
      <div class="V" />
    </button>
    <button on:click={judgeFail}>
      <div class="X" />
    </button>
  {/if}
</div>

<style>
  .V {
    display: inline-block;
    color: green;
  }
  /* .V:before{content:'✓' font-size:30px;} */
  .V:before {
    content: '✔';
  }
  .X {
    display: inline-block;
    color: red;
  }
  /* .X:before{content:'❌'} */
  .X:before {
    content: '✖';
  }

  .judgePanel {
    border: 1px solid black;
  }
</style>
