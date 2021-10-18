<script>
  import { API } from '$lib/serverApi';
  import { compo, hwInfo } from '$lib/stores';
  import { createEventDispatcher, afterUpdate } from 'svelte';
  const dispatch = createEventDispatcher();
  function close() {
    dispatch('close');
  }

  export let categoryId;
  let throwers;
  $: throwers = $compo.throwers
    .filter((x) => x.categories[categoryId])
    .sort((a, b) => {
      if (a.eliminated[categoryId] !== b.eliminated[categoryId])
        return a.eliminated[categoryId] - b.eliminated[categoryId];
      if (isNaN(a.success)) return 1;
      if (isNaN(b.success)) return -1;
      if (a.success !== b.success) return b.success - a.success;
      return 0;
    });

  let finaleThrowers;
  afterUpdate((...args) => {
    if (categoryId === false) return (finaleThrowers = false);
    if (finaleThrowers) return;
    finaleThrowers = throwers
      .filter((x) => x.categories[categoryId] && !x.eliminated[categoryId])
      .map((x) => $compo.throwers.indexOf(x))
      .slice(0, 3);
  });

  async function createCategory() {
    const newName = $compo.categories[categoryId].name + ' Finale';
    $compo = await API.createFinaleCategory($compo._id, newName, finaleThrowers);
    close();
  }
</script>

<main>
  {#if categoryId !== false && finaleThrowers}
    <h1>{$compo.categories[categoryId].name} Finale</h1>
    <!-- {$compo.categories[categoryId].name} -->
    {#each throwers as thrower}
      <div class:eliminated={thrower.eliminated[categoryId]}>
        <label>
          <input
            type="checkbox"
            bind:group={finaleThrowers}
            name="finaleThrowers"
            value={$compo.throwers.indexOf(thrower)}
          />
          {thrower.success || ''}
          {thrower.name}
        </label>
      </div>
    {/each}
    <button on:click={createCategory}>Create</button>
  {/if}
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
  .eliminated {
    background-color: red;
  }
</style>
