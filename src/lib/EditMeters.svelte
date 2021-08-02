<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  export let compo;

  const dispatch = createEventDispatcher();
  function close() {
    dispatch('close');
  }
</script>

<main>
  <h1>Edit meters</h1>
  <!-- <form on:submit|preventDefault={submitName}> -->
  <!--   <input type="text" name="name" bind:value={name} /> -->
  <!-- </form> -->

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
