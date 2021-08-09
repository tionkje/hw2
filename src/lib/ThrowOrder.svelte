<script lang="ts">
  import { API } from '$lib/serverApi';
  import { session } from '$app/stores';
  import { hwInfo } from '$lib/stores';

  import Attempts from '$lib/Attempts.svelte';
  import JudgeThrower from '$lib/JudgeThrower.svelte';

  export let compo;
  export let meterId;

  // console.log(hwInfo);

  let meter;
  $: meter = compo.meters[meterId];
  let throwers;
  $: throwers = meter.throwOrder.map((tid) => ({
    categoryId: meter.categories.find((catId) => compo.throwers[tid].categories[catId]),
    thrower: compo.throwers[tid],
  }));
  let height;
  $: height = meter.height;
  let currThrower;
  $: currThrower = throwers[0];

  async function judge(judge) {
    compo = await API.judgeThrow(compo._id, meter.throwOrder[0], height, judge, throwers[0].categoryId);
  }
  async function judgeSuccess() {
    await judge('V');
  }
  async function judgeFail() {
    await judge('X');
  }

  function getThrowerData(thrower) {
    const hwThrower = $hwInfo.throwers[thrower.hwId];
    const group = $hwInfo.groups[hwThrower.vendelgroepid];
    return { thrower, hwThrower, group };
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

<JudgeThrower bind:throwerId={meter.throwOrder[0]} bind:categoryId={throwers[0].categoryId} />

<div class="judgePanel">
  <h1>{meter.name} {height}m</h1>
  <h2>{currThrower.thrower.name}</h2>
  <pre>{JSON.stringify(getThrowerData(currThrower.thrower),0,2)}</pre>
  <pre>{JSON.stringify($hwInfo.throwers[currThrower.thrower.hwId],0,2)}</pre>

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
