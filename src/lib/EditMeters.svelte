<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { API } from '$lib/serverApi';
  export let compo;

  let editCompo = JSON.parse(JSON.stringify(compo));

  const dispatch = createEventDispatcher();
  function close() {
    dispatch('close');
  }

  async function addMeter(e) {
    compo = await API.addMeter(compo._id, { name: e.target.name.value });
    editCompo = JSON.parse(JSON.stringify(compo));
  }
  async function removeMeter(meterId) {
    compo = await API.removeMeter(compo._id, meterId);
    editCompo = JSON.parse(JSON.stringify(compo));
  }
  async function saveMeter(meterId, meter) {
    compo = await API.updateMeter(compo._id, meterId, meter);
    editCompo = JSON.parse(JSON.stringify(compo));
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

  {#each editCompo.meters as meter, meterId}
    <form class="meter" on:submit|preventDefault={(e) => saveMeter(meterId, meter)}>
      <h4>{meter.name}</h4>
      <input name="name" bind:value={meter.name} />
      <input type="number" step="0.1" name="height" bind:value={meter.height} />
      <ul>
        {#each editCompo.categories as cat, categoryId}
          <li>
            <label>
              <input type="checkbox" bind:group={meter.categories} name="{categoryId}_cats" value={categoryId} />
              {cat.name}
            </label>
            <span class="eliminated">{cat.eliminated}</span>
            <span class="remaining">{cat.count - cat.eliminated}</span>
          </li>
        {/each}
        <ul>
          <!-- {editCompo.categories.map(x=>x.name)} -->
          <button type="submit">save</button>
          <button type="button" on:click={(e) => removeMeter(meterId)}>remove</button>
        </ul>
      </ul>
    </form>
  {/each}
  <!-- <pre>{JSON.stringify(editCompo, 0,2)}</pre> -->

  <button on:click={close}>Close</button>
</main>

<style>
  ul {
    list-style: none;
  }
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
  .meter {
    border: 1px solid grey;
  }
  .eliminated {
    color: red;
  }
  .remaining {
    color: blue;
  }
</style>
