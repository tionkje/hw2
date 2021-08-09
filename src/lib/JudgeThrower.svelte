<script lang="ts">
  import { API } from '$lib/serverApi';
  import { session } from '$app/stores';
  import { compo, meterId, hwInfo } from '$lib/stores.js';

  import Attempts from '$lib/Attempts.svelte';

  export let throwerId;
  export let categoryId;

  let height;
  $: height = $compo.meters[$meterId].height;
  let thrower;
  $: thrower = $compo.throwers[throwerId];
  let td;
  $: td = getThrowerData(thrower);

  function getThrowerData(thrower) {
    const hwThrower = $hwInfo.throwers[thrower.hwId];
    const group = $hwInfo.groups[hwThrower.vendelgroepid];
    return { thrower, hwThrower, group };
  }
  async function judge(judge) {
    $compo = await API.judgeThrow($compo._id, throwerId, height, judge, categoryId);
  }
  async function judgeSuccess() {
    await judge('V');
  }
  async function judgeFail() {
    await judge('X');
  }

  // https://images.weserv.nl/
  // <img src="//images.weserv.nl/?url=ory.weserv.nl/lichtenstein.jpg&w=300">
  // var picsurl= path=> `//images.weserv.nl/?url=http://www.hoogwerpers.be/hoogwerpers/pics/${path}`;
  var picsurl = (path) =>
    `//images.weserv.nl/?url=http://www.hoogwerpers.be/hoogwerpers/pics/${path}&w=150&h=150&t=letterbox&bg=white`;

  // var picsurl= `http://www.hoogwerpers.be/hoogwerpers/pics`;
  var throwerImg = (hwid) => picsurl(`werper${hwid}.jpg`);
  var groupImg = (vgid) => picsurl(`groep${vgid}.jpg`);
  var countryImg = (co) => `https://www.countryflags.io/${co}/flat/64.png`;
</script>

<div class="judgePanel">
  <h1>{height}m</h1>
  <h2>{thrower.name}</h2>
  [<Attempts attempts={thrower.categories[categoryId][height]} />]
  {thrower.rugnr}
  <img src={countryImg(td.hwThrower.land)} width="64" height="64" />
  <img src={throwerImg(td.hwThrower.id)} width="150" height="150" />
  <img src={groupImg(td.group.id)} width="150" height="150" />
  {td.hwThrower.recordhoogte}
  {td.hwThrower.hoogschikking}
  {td.group.code}
  <!-- {td.group.shortname} -->
  {td.group.name}

  {#if $session.loggedin}
    <button on:click={judgeSuccess}>
      <div class="V" />
    </button>
    <button on:click={judgeFail}>
      <div class="X" />
    </button>
  {/if}

  <pre>{JSON.stringify(getThrowerData(thrower),0,2)}</pre>
  <!-- <pre>{JSON.stringify($hwInfo.throwers[thrower.thrower.hwId],0,2)}</pre> -->
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
