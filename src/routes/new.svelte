<script context="module" lang="ts">
  import type { LoadOutput, LoadInput } from '@sveltejs/kit';
  export async function load({ session }: LoadInput): Promise<LoadOutput> {
    if (!session.loggedin) return { status: 401, error: 'Not logged in' };
    return {};
  }
</script>

<script lang="ts">
  import { session } from '$app/stores';
  let list;
  async function getList() {
    const res = await fetch('api/hwget?action=list');
    if (!res.ok) throw new Error(res.statusText);
    list = await res.json();
  }

  let throwers;
  async function getThrowers(id) {
    const res = await fetch(`api/hwget?action=throwers&id=${id}`);
    if (!res.ok) throw new Error(res.statusText);
    throwers = await res.json();
  }

  let newCompo;
  async function createCompetition() {
    const res = await fetch('api/compos', { method: 'PUT' });
    if (!res.ok) throw new Error(res.statusText);
    newCompo = await res.json();
  }
</script>

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

<button on:click={createCompetition}>Create New</button>
{#if newCompo}
  <pre>{JSON.stringify(newCompo, 0,2)}</pre>
{/if}
