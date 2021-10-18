<script lang="ts">
  import { API } from '$lib/serverApi';
  import ImportThrowers from '$lib/ImportThrowers.svelte';
  import { createFinaleOpen } from '$lib/stores.js';
  import Modal from '$lib/Modal.svelte';
  import { createEventDispatcher } from 'svelte';
  export let compo;

  const dispatch = createEventDispatcher();
  function close() {
    dispatch('close');
  }

  async function submitName(e) {
    const newName = e.target.name.value;
    compo = await API.setName(compo._id, e.target.name.value);
    name = compo.name;
  }
  let name = compo.name;

  async function removeCategory(catId) {
    compo = await API.removeCategory(compo._id, catId);
    confirmDeleteOpen = false;
  }

  let confirmDeleteOpen;
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
