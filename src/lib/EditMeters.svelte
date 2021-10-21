<script lang="ts">
  import EditMeter from '$lib/EditMeter.svelte';
  import { createEventDispatcher } from 'svelte';
  import { API } from '$lib/serverApi';
  export let compo;

  let editCompo = JSON.parse(JSON.stringify(compo));

  const dispatch = createEventDispatcher();

  async function addMeter(e) {
    compo = await API.addMeter(compo._id, { name: e.target.name.value });
    editCompo = JSON.parse(JSON.stringify(compo));
  }
  async function removeMeter(meterId) {
    compo = await API.removeMeter(compo._id, meterId);
    editCompo = JSON.parse(JSON.stringify(compo));
  }
</script>

<main>
  <h1>Edit meters</h1>

  <form on:submit|preventDefault={addMeter}>
    <input name="name" />
    <button>Add Meter</button>
  </form>

  {#each editCompo.meters as meter, meterId}
    <EditMeter {compo} {meterId} />
    <button type="button" on:click={(e) => removeMeter(meterId)}>remove</button>
  {/each}

  <button on:click={(e) => dispatch('close')}>Close</button>
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
