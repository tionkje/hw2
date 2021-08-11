<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();
  function close() {
    dispatch('close');
  }

  export let throwerId;
  export let compo;
</script>

<main>
  <pre>{JSON.stringify(compo.throwers[throwerId], 0,2)}</pre>

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
