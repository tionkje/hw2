<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  export let compo;
  const dispatch = createEventDispatcher();
  function close() {
    dispatch('close');
  }

  let list;
  async function getList() {
    const res = await fetch('/api/hwget?action=list');
    if (!res.ok) throw new Error(res.statusText);
    list = await res.json();
  }

  let throwers;
  async function getThrowers(id) {
    const res = await fetch(`/api/hwget?action=throwers&id=${id}`);
    if (!res.ok) throw new Error(res.statusText);
    throwers = await res.json();
  }

  // let newCompo;
  // async function createCompetition() {
  //   const res = await fetch('/api/compos', { method: 'POST' });
  //   if (!res.ok) throw new Error(res.statusText);
  //   newCompo = await res.json();
  // }
  async function submit(e) {
    const newName = e.target.name.value;
    console.log(compo);
    const data = { func: 'setName', args: [newName] };
    const res = await fetch(`/api/${compo._id}`, { method: 'PUT', body: JSON.stringify(data) });
    if (!res.ok) throw new Error(res.statusText);
    console.log(await res.json());
    compo.name = newName;
  }
  let name = compo.name;
</script>

<main>
  <form on:submit|preventDefault={submit}>
    <input type="text" name="name" bind:value={name} />
  </form>

  {#if list}
    {#each list as compo}
      <div>
        {compo.name}
        <button on:click={(e) => getThrowers(compo.id)}>Fetch Throwers</button>
      </div>
    {/each}
  {:else}
    <button on:click={getList}>Fetch list</button>
  {/if}
  <!-- <pre>{JSON.stringify(list,0,2)}</pre> -->

  {#if throwers}
    {#each throwers as thrower}
      <div>{thrower.rugnr} {thrower.category} {thrower.startHeight} {thrower.name}</div>
    {/each}
  {/if}

  <pre>{JSON.stringify(compo, 0,2)}</pre>

  <button on:click={close}>Close</button>
</main>

<style>
  main {
    background: white;
    max-width: 1024px;
    margin: 10px auto;
    border-radius: 20px;
    padding: 10px;
  }
</style>
