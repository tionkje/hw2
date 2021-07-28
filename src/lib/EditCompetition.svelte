<script lang="ts">
  import ImportThrowers from '$lib/ImportThrowers.svelte';
  import { createEventDispatcher } from 'svelte';
  export let compo;

  const dispatch = createEventDispatcher();
  function close() {
    dispatch('close');
  }

  // let newCompo;
  // async function createCompetition() {
  //   const res = await fetch('/api/compos', { method: 'POST' });
  //   if (!res.ok) throw new Error(res.statusText);
  //   newCompo = await res.json();
  // }

  async function submitName(e) {
    const newName = e.target.name.value;
    // console.log(compo);
    const data = { func: 'setName', args: [newName] };
    const res = await fetch(`/api/${compo._id}`, { method: 'PUT', body: JSON.stringify(data) });
    if (!res.ok) throw new Error(res.statusText);
    // console.log(await res.json());
    compo.name = newName;
  }
  let name = compo.name;
</script>

<main>
  <form on:submit|preventDefault={submitName}>
    <input type="text" name="name" bind:value={name} />
  </form>

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
