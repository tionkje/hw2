<script lang="ts">
  import { API } from '$lib/serverApi';
  import { session } from '$app/stores';
  import { compo, meterId, hwInfo, editThrowerOpen } from '$lib/stores';
  import { throwerImg, groupImg, countryImg } from '$lib/logos';

  import Attempts from '$lib/Attempts.svelte';

  export let throwerId;
  export let categoryId;

  let height;
  $: height = $compo.meters[$meterId].height;
  let thrower;
  $: thrower = $compo.throwers[throwerId];
  let td;
  $: td = getThrowerData(thrower);

  let judging = false;
  function getThrowerData(thrower) {
    const hwThrower = $hwInfo.throwers[thrower.hwId];
    const group = $hwInfo.groups[hwThrower.vendelgroepid];
    return { thrower, hwThrower, group };
  }
  async function judge(judge) {
    const tid = throwerId;
    // throwerId = null;
    judging = true;
    $compo = await API.judgeThrow($compo._id, tid, height, judge, categoryId);
    judging = false;
  }
  async function judgeSuccess() {
    await judge('V');
  }
  async function judgeFail() {
    await judge('X');
  }
</script>

{#if !judging}
  <div class="judgePanel">
    <div on:click={(e) => ($editThrowerOpen = throwerId)} class="rugnr">{thrower.rugnr}</div>
    <div class="height">{height}m</div>
    <div on:click={(e) => ($editThrowerOpen = throwerId)} class="name">{thrower.name}</div>
    <!-- [<Attempts attempts={thrower.categories[categoryId][height]} />] -->
    <img
      class="countryimg"
      on:load={(e) => console.log('country')}
      src={countryImg(td.hwThrower.land)}
      width="64"
      height="64"
    />
    <img
      on:click={(e) => ($editThrowerOpen = throwerId)}
      class="faceimg"
      on:load={(e) => console.log('hai', e.target.src)}
      src={throwerImg(td.hwThrower.id)}
      width="150"
      height="150"
    />
    <img class="groupimg" src={groupImg(td.group.id)} width="150" height="150" />
    <!-- {td.hwThrower.recordhoogte} -->
    <!-- {td.hwThrower.hoogschikking} -->
    <!-- {td.group.code} -->
    <!-- {td.group.name} -->
    <div class="group">{td.group.shortname}</div>

    {#if $session.loggedin}
      <button class="successBtn" on:click={judgeSuccess}>
        <div class="V" />
      </button>
      <button class="failBtn" on:click={judgeFail}>
        <div class="X" />
      </button>
    {/if}

    <!-- <pre>{JSON.stringify(getThrowerData(thrower),0,2)}</pre> -->
    <!-- <pre>{JSON.stringify($hwInfo.throwers[thrower.thrower.hwId],0,2)}</pre> -->
  </div>
{/if}

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
    /* border: 1px solid black; */
    background: white;
    padding: 5px;
    width: 100vw;
    display: grid;
    grid-template:
      'rugnr name name height' auto
      'rugnr countryimg group height' auto
      'faceimg successBtn failBtn groupimg' auto
      / auto 1fr 1fr auto;
  }
  @media only screen and (max-width: 600px) {
    .judgePanel {
      grid-template:
        'rugnr height' auto
        'name name' auto
        'group countryimg' auto
        'faceimg groupimg' auto
        'successBtn failBtn' auto
        / auto auto;
    }
  }
  .height {
    grid-area: height;
  }
  .name {
    grid-area: name;
  }
  .rugnr {
    grid-area: rugnr;
  }
  .countryimg {
    grid-area: countryimg;
  }
  .faceimg {
    grid-area: faceimg;
  }
  .groupimg {
    grid-area: groupimg;
  }
  .group {
    grid-area: group;
  }
  .successBtn {
    grid-area: successBtn;
  }
  .failBtn {
    grid-area: failBtn;
  }

  .judgePanel > * {
    align-self: center;
    justify-self: center;
    padding: 2px;
  }
  .rugnr {
    font-size: 80px;
  }
  .height {
    font-size: 35px;
  }
  .name {
    font-size: 30px;
  }
  .group {
    font-size: 20px;
  }
  .countryimg {
  }
  .faceimg {
  }
  .groupimg {
  }
  .faceimg,
  .groupimg {
    border-radius: 20px;
    box-shadow: 0 0 5px 2px #00000059;
    /* border:1px solid black; */
    margin: 10px;
  }
  .successBtn {
  }
  .failBtn {
  }
  .successBtn,
  .failBtn {
    font-size: 100px;
    border: none;
    background: white;
    margin: 5px;
    box-shadow: 0px 0px 4px 2px #0004;
    justify-self: stretch;
    align-self: stretch;
    cursor: pointer;
  }
  .successBtn:hover,
  .failBtn:hover,
  .successBtn:active,
  .failBtn:active {
    box-shadow: 0px 0px 4px 2px #0008;
  }
</style>
