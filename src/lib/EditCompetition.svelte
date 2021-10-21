<script lang="ts">
  import EditMeter from '$lib/EditMeter.svelte';
  import { API } from '$lib/serverApi';
  import ImportThrowers from '$lib/ImportThrowers.svelte';
  import { createFinaleOpen } from '$lib/stores.js';
  import Modal from '$lib/Modal.svelte';
  import { createEventDispatcher } from 'svelte';
  export let compo;

  const dispatch = createEventDispatcher();

  async function submitName(e) {
    compo = await API.setName(compo._id, e.target.name.value);
    name = compo.name;
  }
  let name = compo.name;

  async function removeCategory(catId) {
    compo = await API.removeCategory(compo._id, catId);
    confirmDeleteOpen = false;
  }

  let confirmDeleteOpen;

  let editCompo = JSON.parse(JSON.stringify(compo));

  async function addMeter(e) {
    compo = await API.addMeter(compo._id, { name: e.target.name.value });
    editCompo = JSON.parse(JSON.stringify(compo));
  }
  async function removeMeter(meterId) {
    compo = await API.removeMeter(compo._id, meterId);
    editCompo = JSON.parse(JSON.stringify(compo));
  }
</script>

<Modal bind:open={confirmDeleteOpen} canClose={false}>
  <main>
    modal
    {confirmDeleteOpen}
    <button on:click={(e) => removeCategory(confirmDeleteOpen)}>Remove</button>
    <button on:click={(e) => (confirmDeleteOpen = false)}>Cancel</button>
    <main />
  </main></Modal
>

<main>
  <form on:submit|preventDefault={submitName}>
    <input type="text" name="name" bind:value={name} />
  </form>

  {#each compo.categories as cat, catId}
    <div>
      {cat.name} <button on:click={(e) => (confirmDeleteOpen = catId)}>×</button>
      {#if !cat.name.includes('Finale')}
        <button on:click|preventDefault={(e) => ($createFinaleOpen = catId)}>Finale</button>
      {/if}
    </div>
  {/each}

  {#if compo.throwers.length == 0}
    <ImportThrowers bind:compo />
  {/if}

  <h2>Meters</h2>

  <form on:submit|preventDefault={addMeter}>
    <input name="name" />
    <button>Add Meter</button>
  </form>

  {#each editCompo.meters as meter, meterId}
    <EditMeter {compo} {meterId} />
    <button type="button" on:click={(e) => removeMeter(meterId)}>remove</button>
  {/each}

  <!-- <pre>{JSON.stringify(compo, 0,2)}</pre> -->

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
