<script>
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();
  import { API } from '$lib/serverApi';

  export let meterId;
  export let compo;
  let meter;
  $: meter = compo.meters[meterId];

  async function saveMeter() {
    compo = await API.updateMeter(compo._id, meterId, meter);
    // editCompo = JSON.parse(JSON.stringify(compo));
  }
</script>

<form class="meter" on:submit|preventDefault={saveMeter}>
  <h4>{meter.name}</h4>
  <input name="name" bind:value={meter.name} />
  <input type="number" step="0.1" name="height" bind:value={meter.height} />
  <ul>
    {#each compo.categories as cat, categoryId}
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
      <button type="submit">save</button>
    </ul>
  </ul>
</form>

<style>
  ul {
    list-style: none;
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
