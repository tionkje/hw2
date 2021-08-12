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
    return { props: { compid } };
  }
</script>

<script lang="ts">
  import { session, page } from '$app/stores';
  import { editCompoOpen, editMeterOpen, editThrowerOpen, sideOpen } from '$lib/stores.js';

  // $: $meterId = $page.query.get('met');
  // $: $categoryId = $page.query.get('cat');

  import Login from '$lib/Login.svelte';

  import Modal from '$lib/Modal.svelte';
  import EditCompetition from '$lib/EditCompetition.svelte';
  import EditMeters from '$lib/EditMeters.svelte';
  import EditThrower from '$lib/EditThrower.svelte';

  export let compid;

  let catName;
  $: catName = $compo.categories[$categoryId]?.name || '';

  import { onMount } from 'svelte';
  import { PUSHER_KEY, PUSHER_CLUSTER } from '$lib/Env';
  import Pusher from 'pusher-js';

  onMount(() => {
    // Pusher.logToConsole = true;

    var pusher = new Pusher(PUSHER_KEY, {
      cluster: PUSHER_CLUSTER,
    });

    var channel = pusher.subscribe(`compo_${compid}`);
    channel.bind('full', (data) => {
      console.log(data.throwers[data.meters[0].throwOrder[0]].name);
      $compo = data;
    });
  });
</script>

<svelte:head>
  <title>{$compo.name || $compo._id} {catName}</title>
</svelte:head>

{#if $session.loggedin}
  <Modal bind:open={$editCompoOpen} canClose={false}>
    <EditCompetition bind:compo={$compo} on:close={(e) => ($editCompoOpen = false)} />
  </Modal>
  <Modal bind:open={$editMeterOpen} canClose={false}>
    Add meter
    <EditMeters bind:compo={$compo} on:close={(e) => ($editMeterOpen = false)} />
  </Modal>
  <Modal bind:open={$editThrowerOpen} canClose={false}>
    Add meter
    <EditThrower bind:throwerId={$editThrowerOpen} bind:compo={$compo} on:close={(e) => ($editThrowerOpen = false)} />
  </Modal>
{/if}

<ul class:open={$sideOpen}>
  <div class="icon btn" on:click={(e) => ($sideOpen = false)}>×</div>
  {#if $session.loggedin}
    <li><a href on:click|preventDefault={(e) => ($editCompoOpen = true)}>Edit</a></li>
  {/if}
  {#if $session.loggedin}
    <li><a href on:click|preventDefault={(e) => ($editMeterOpen = true)}>Meters</a></li>
  {/if}
  <li><a href="..">List</a></li>
  <li><a href="{compid}/print?cat={$categoryId}">Print</a></li>
  <li><h4>categories</h4></li>
  {#each $compo.categories as cat, index}
    <li class:active={$categoryId == index} on:click={(e) => ($sideOpen = false)}>
      <a href="?cat={index}">{cat.name}</a>
    </li>
  {/each}
  <li><h4>meters</h4></li>
  {#each $compo.meters as meter, mid}
    <li class:active={$meterId == mid} on:click={(e) => ($sideOpen = false)}>
      <a href="?met={mid}">{meter.name}</a>
    </li>
  {/each}
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
    <button on:click={(e) => ($editMeterOpen = true)}>Add Meter</button>
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
  ul > li.active {
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
</style>
