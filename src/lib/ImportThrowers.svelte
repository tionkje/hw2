<script lang="ts">
  export let compo;

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
    list = null;
  }
  async function addThrowers() {
    const data = [];

    console.log(throwers);
    var cats = {};
    throwers.forEach((t) => (cats[t.category] = 1));
    cats = Object.keys(cats);
    console.log(cats);
    cats.forEach((catName) => {
      data.push({ func: 'addCategory', args: [{ name: catName }] });
    });

    throwers.forEach((t) => {
      data.push({
        func: 'addThrower',
        args: [
          {
            name: t.name,
            categories: { [cats.indexOf(t.category)]: {} },
            skipHeight: t.startHeight,
            hwId: t.id,
            rugnr: t.rugnr,
          },
        ],
      });
    });

    const res = await fetch(`/api/${compo._id}`, { method: 'PUT', body: JSON.stringify(data) });
    if (!res.ok) throw new Error(res.statusText);

    compo = await res.json();
  }

  // TEMP
  // async function test() {
  //   await getList();
  //   await getThrowers(list.find((s) => s.status == 'Registering').id);
  //   // await addThrowers();
  // }
  // test();

  let addThrowerResult;
</script>

{#if !list}
  <button on:click={getList}>Import Registration list</button>
{:else}
  TODO: filter by status
  {#each list as compo}
    <div>
      {compo.status}
      {compo.name}
      <button on:click={(e) => getThrowers(compo.id)}>Fetch Throwers</button>
    </div>
  {/each}
{/if}
<!-- <pre>{JSON.stringify(list,0,2)}</pre> -->

{#if throwers}
  <div class="grid" style="grid-template-columns: repeat(5, max-content);">
    <div>hwID</div>
    <div>rugnr</div>
    <div>category</div>
    <div>startHeight</div>
    <div>name</div>
    {#each throwers as thrower}
      <div>{thrower.id}</div>
      <div>{thrower.rugnr}</div>
      <div>{thrower.category}</div>
      <div>{thrower.startHeight}</div>
      <div>{thrower.name}</div>
    {/each}
  </div>
  <button on:click={(e) => (addThrowerResult = addThrowers())}>Add Throwers</button>
  {#if addThrowerResult}
    {#await addThrowerResult}
      <p>...waiting</p>
    {:then number}
      <p>Throwers Added Successfully</p>
    {:catch error}
      <p style="color: red">{error.message}</p>
    {/await}
  {/if}
{/if}

<style>
  .grid {
    display: grid;
    overflow: auto;
    max-height: 30vh;
    box-shadow: inset 0 0 14px #0000006b;
  }
  .grid > * {
    padding: 0 5px;
  }
</style>
