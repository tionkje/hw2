<script lang="ts">
  import { throwerImg, groupImg, countryImg } from '$lib/logos';
  import { compo, hwInfo, editThrowerOpen } from '$lib/stores.js';
  export let throwerId;
  $: thrower = $compo.throwers[throwerId];
  $: hwThrower = $hwInfo.throwers[thrower.hwId];
  $: group = $hwInfo.groups[hwThrower.vendelgroepid];
</script>

<div on:click={(e) => ($editThrowerOpen = throwerId)}>
  <img class="countryimg" src={countryImg(hwThrower.land)} />
  <img class="groupimg" src={groupImg(group.id)} />
  <span>
    {thrower.name}
  </span>
</div>

<style>
  img {
    width: 1.3em;
    /* height: 1.3em; */
  }
  div {
    display: flex;
    align-items: center;
    cursor: pointer;
    box-shadow: 0 0 3px 0px #b3b3b3;
  }
  div:hover {
    box-shadow: 0 0 4px 1px #383838;
    z-index: 5;
  }
  div > * {
    padding: 0px 2px;
  }
</style>
