<script lang="ts">
  import { API } from '$lib/serverApi';
  import { createEventDispatcher } from 'svelte';
  import { compo, hwInfo } from '$lib/stores';
  import Attempts from '$lib/Attempts.svelte';

  const dispatch = createEventDispatcher();
  function close() {
    dispatch('close');
  }

  export let throwerId;

  let thrower;
  $: thrower = $compo.throwers[throwerId];

  const save = async () => {
    $compo = await API.setThrower($compo._id, throwerId, thrower);
  };
</script>

{#if thrower}
  <main>
    <pre>{JSON.stringify($compo.throwers[throwerId], 0,2)}</pre>

    {#each Object.entries(thrower.categories) as [cat, attempts]}
      <h4>{$compo.categories[cat].name}</h4>
      {#each Object.entries(attempts) as [height, attempt]}
        <div>
          {height}
          <Attempts
            attempts={attempt}
            edit={true}
            on:update={(e) => {
              attempts[height] = e.detail;
              $compo = $compo;
            }}
          />
        </div>
      {/each}
    {/each}

    <footer>
      <button on:click={save}>Save</button>
      <button on:click={close}>Close</button>
    </footer>
  </main>
{/if}

<!-- {TEST.join()} -->

<!--       <Attempts bind:attempts={TEST} edit={true}/> -->
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
