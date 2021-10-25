<script context="module" lang="ts">
  import { compo, categoryId, meterId, hwInfo } from '$lib/stores.js';
  import type { LoadOutput, LoadInput } from '@sveltejs/kit';

  async function doFetch(fetch, url) {
    let res = await fetch(url);
    if (!res.ok) throw new Error(url + ' failed status: ' + res.statusText);
    return await res.json();
  }

  async function fetchHWInfo(fetch, hwIds) {
    const [groups, throwers] = await Promise.all([
      doFetch(fetch, `/api/hwget?action=groups`),
      doFetch(fetch, `/api/hwget?action=allThrowers&list=[${hwIds.join()}]`),
    ]);

    return {
      groups: Object.fromEntries(groups.map((g) => [g.id, g])),
      throwers: Object.fromEntries(throwers.map((t) => [t.id, t])),
    };
  }

  export async function load({ fetch, page }: LoadInput): Promise<LoadOutput> {
    const { compid } = page.params;

    const compoData = await doFetch(fetch, `/api/${compid}`);
    const hwInfoData = await fetchHWInfo(
      fetch,
      compoData.throwers.map((x) => x.hwId)
    );

    hwInfo.set(hwInfoData);
    compo.set(compoData);
    categoryId.set(page.query.get('cat'));
    meterId.set(page.query.get('met'));
    return { props: { compid: compoData._id } };
  }
</script>

<script lang="ts">
  import { session, page } from '$app/stores';
  import { editCompoOpen, editThrowerOpen, sideOpen, createFinaleOpen } from '$lib/stores.js';

  if (import.meta.env.DEV) {
    console.log('>> hwInfo:', $hwInfo);
    console.log('>> compo:', $compo);
    console.log('>> categoryId:', $categoryId);
    console.log('>> meterId:', $meterId);
  }

  // $: $meterId = $page.query.get('met');
  // $: $categoryId = $page.query.get('cat');

  import Login from '$lib/Login.svelte';

  import Modal from '$lib/Modal.svelte';
  import EditCompetition from '$lib/EditCompetition.svelte';
  import EditThrower from '$lib/EditThrower.svelte';
  import CreateFinale from '$lib/CreateFinale.svelte';

  export let compid;

  let catName;
  $: catName = $compo.categories[$categoryId]?.name || '';

  async function updateCompo() {
    const compoData = await doFetch(fetch, `/api/${$compo._id}`);
    console.log('new compo data', compoData);
    compo.set(compoData);
  }

  // setInterval(()=>updateCompo(),5000);

  import Ably from 'ably';
  import { ABLY_CHANNEL, ABLY_API_KEY_READONLY } from '$lib/Env';
  import { onMount } from 'svelte';

  onMount(() => {
    const ably = new Ably.Realtime(ABLY_API_KEY_READONLY);
    var channel = ably.channels.get(ABLY_CHANNEL);
    channel.subscribe(`compo_${$compo._id}`, async (message) => {
      console.log('Updated Compo', message.data);
      updateCompo();
      // $compo = message.data;
    });
  });
</script>

<svelte:head>
  <title>{$compo.name || $compo._id} {catName}</title>
</svelte:head>

{#if $session.loggedin}
  <div class="modals">
    <Modal bind:open={$editCompoOpen} canClose={false}>
      <EditCompetition bind:compo={$compo} on:close={(e) => ($editCompoOpen = false)} />
    </Modal>
    <Modal bind:open={$editThrowerOpen} canClose={true}>
      <EditThrower bind:throwerId={$editThrowerOpen} on:close={(e) => ($editThrowerOpen = false)} />
    </Modal>
    <Modal bind:open={$createFinaleOpen} canClose={true}>
      <CreateFinale bind:categoryId={$createFinaleOpen} on:close={(e) => ($createFinaleOpen = false)} />
    </Modal>
  </div>
{/if}

<ul class:open={$sideOpen}>
  <div class="icon btn" on:click={(e) => ($sideOpen = false)}>×</div>
  {#if $session.loggedin}
    <li><a href on:click|preventDefault={(e) => ($editCompoOpen = true)}>Edit Competition</a></li>
  {/if}
  <li><a href="..">Back to List</a></li>
  <li><a href="{compid}/print?cat={$categoryId}">Print Competition</a></li>
  {#if $compo.categories.length}
    <li><h4>Categories</h4></li>
  {/if}
  {#each $compo.categories as cat, catId}
    <li on:click={(e) => ($sideOpen = false)}>
      <a class:active={$categoryId == catId} href="?cat={catId}">{cat.name}</a>
    </li>
  {/each}
  {#if $compo.meters.length}
    <li><h4>Meters</h4></li>
  {/if}
  {#each $compo.meters as meter, mid}
    <li on:click={(e) => ($sideOpen = false)}>
      <a class:active={$meterId == mid} href="?met={mid}">{meter.name}</a>
    </li>
  {/each}

  <hr />
  <li><Login /></li>
</ul>
<div class="shim" class:open={$sideOpen} on:click={(e) => ($sideOpen = !$sideOpen)} />

<main>
  <nav>
    <div class="icon btn" on:click={(e) => ($sideOpen = true)}>☰</div>
    {$compo.name || $compo._id}
    {catName}
  </nav>

  {#if !compid.match('old_') && $compo.meters.length == 0 && $session.loggedin}
    <button on:click={(e) => ($editCompoOpen = true)}>Add Meter</button>
  {/if}

  {#if $compo.categories[$categoryId] || $compo.meters[$meterId]}
    <section>
      <slot />
    </section>
  {:else}
    <section class="list">
      {#if $session.loggedin && $compo.categories.length == 0}
        <a href on:click|preventDefault={(e) => ($editCompoOpen = true)}>Edit</a>
      {/if}
      <h4>Categories</h4>
      {#each $compo.categories as cat, categoryId}
        <div>
          <a href="?cat={categoryId}">{cat.name}</a>
        </div>
      {/each}
      <h4>Meters</h4>
      {#each $compo.meters as meter, meterId}
        <div>
          <a href="?met={meterId}">{meter.name}</a>
        </div>
      {/each}
    </section>
  {/if}
</main>

<style>
  ul {
    transform: translate(-100%);
    position: fixed;
    display: flex;
    flex-direction: column;
    transition: transform 0.4s;
    z-index: 10;
    background: white;
    height: 100vh;
    top: 0;
    margin: 0;
    padding: 0;
    min-width: 30vw;
  }
  ul.open {
    transform: translate(0);
    max-height: 100vh;
    overflow-y: auto;
  }
  .shim.open {
    opacity: 0.1;
    pointer-events: all;
  }
  .shim {
    z-index: 9;
    pointer-events: none;
    /* z-index:-1; */
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: black;
    opacity: 0;
    transition: opacity 0.4s;
  }
  ul > li {
    list-style: none;
    cursor: pointer;
    margin: 5px 20px;
  }
  ul > li > a.active {
    border-bottom: 1px solid red;
  }

  nav {
    display: flex;
    align-items: center;
  }
  main {
    position: fixed;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
  }

  .icon {
    font-size: 20px;
    padding: 2px 5px;
    width: 30px;
    height: 30px;
  }
  .btn {
    cursor: pointer;
    transition: transform 0.4s;
  }
  .btn:hover {
    transform: scale(1.1);
  }

  section {
    overflow: scroll;
    height: 100%;
  }
  section.list {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
  }
  .modals {
    z-index: 100;
  }
  .modals > * {
    position: fixed;
  }
</style>
