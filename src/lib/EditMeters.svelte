<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { API } from '$lib/serverApi';
  export let compo;
  export let newMeterName;

  const dispatch = createEventDispatcher();
  function close() {
    dispatch('close');
  }

  async function addMeter(e) {
    compo = await API.addMeter(compo._id, { name: e.target.name.value });
  }
  async function removeMeter(idx) {
    compo = await API.removeMeter(compo._id, idx);
  }
</script>

<main>
  <h1>Edit meters</h1>
  <form on:submit|preventDefault={addMeter}>
    <input name="name" />
    <button>Add Meter</button>
  </form>
  <!-- <form on:submit|preventDefault={submitName}> -->
  <!--   <input type="text" name="name" bind:value={name} /> -->
  <!-- </form> -->

  {#each compo.meters as meter, idx}
    <div>{meter.name} <button on:click={(e) => removeMeter(idx)}>remove</button></div>
  {/each}
  <pre>{JSON.stringify(compo, 0,2)}</pre>

  <button on:click={close}>Close</button>
</main>

<style>
  pre {
    max-height: 50vh;
    overflow: auto;
  }
  main {
    background: white;
    max-width: 1024px;
    margin: 10px auto;
    border-radius: 20px;
    padding: 10px;
  }
</style>
