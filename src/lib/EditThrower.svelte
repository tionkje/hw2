<script lang="ts">
  import { API } from '$lib/serverApi';
  import { createEventDispatcher } from 'svelte';
  import { compo, meterId, hwInfo } from '$lib/stores';
  import { throwerImg, groupImg, countryImg } from '$lib/logos';
  import Attempts from '$lib/Attempts.svelte';

  const dispatch = createEventDispatcher();
  function close() {
    dispatch('close');
  }

  export let throwerId;

  export let edit = false;

  let thrower;
  $: if (throwerId !== false) thrower = JSON.parse(JSON.stringify($compo.throwers[throwerId]));
  let hasChanges;
  $: hasChanges = JSON.stringify(thrower) !== JSON.stringify($compo.throwers[throwerId]);

  const save = async () => {
    $compo = await API.setThrower($compo._id, throwerId, thrower);
  };
  const reset = () => {
    thrower = JSON.parse(JSON.stringify($compo.throwers[throwerId]));
  };

  let td;
  $: td = getThrowerData(thrower);
  function getThrowerData(thrower) {
    if (!thrower) return;
    const hwThrower = $hwInfo.throwers[thrower.hwId];
    const group = $hwInfo.groups[hwThrower.vendelgroepid];
    return { thrower, hwThrower, group };
  }
</script>

{#if thrower}
  <main class="editPanel">
    <!-- {thrower.skipHeight} -->
    <!-- <pre>{JSON.stringify($compo.throwers[throwerId], 0,2)}</pre> -->
    <!-- <pre>{JSON.stringify(td, 0,2)}</pre> -->

    <div class="rugnr">{thrower.rugnr}</div>
    <div class="name">{thrower.name}</div>
    <!-- [<Attempts attempts={thrower.categories[categoryId][height]} />] -->
    <img
      class="countryimg"
      on:load={(e) => console.log('country')}
      src={countryImg(td.hwThrower.land)}
      width="64"
      height="64"
    />
    <img class="faceimg" src={throwerImg(td.hwThrower.id)} width="150" height="150" />
    <img class="groupimg" src={groupImg(td.group.id)} width="150" height="150" />
    <!-- {td.hwThrower.recordhoogte} -->
    <!-- {td.hwThrower.hoogschikking} -->
    <!-- {td.group.code} -->
    <!-- {td.group.name} -->
    <div class="group">{td.group.shortname}</div>

    <input class="editName" type="text" value={thrower.name} on:change={(e) => (thrower.name = e.target.value)} />
    <input
      class="editHeight"
      type="number"
      step="0.1"
      value={thrower.skipHeight}
      on:change={(e) => (thrower.skipHeight = e.target.value)}
    />
    {#if $meterId != null}
      <button on:click={(e) => (thrower.skipHeight = '' + $compo.meters[$meterId].height)}>
        {$compo.meters[$meterId].height}
      </button>
    {/if}

    <div class="editAttempts">
      {#each Object.entries(thrower.categories) as [cat, attempts]}
        <h4>{$compo.categories[cat].name}</h4>
        {#each Object.entries(attempts).sort(([a], [b]) => a - b) as [height, attempt], key}
          {#if edit || attempt.length}
            <div>
              {height}
              <Attempts
                attempts={attempt}
                {edit}
                on:update={(e) => {
                  attempts[height] = e.detail;
                }}
              />
            </div>
          {/if}
        {/each}
      {/each}

      <button type="button" on:click={(e) => (edit = !edit)}> &#9998; </button>
    </div>

    <footer class="footer">
      {#if hasChanges}
        <button on:click={save}>Save</button>
        <button on:click={reset}>Reset</button>
      {/if}
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
  .editPanel {
    /* border: 1px solid black; */
    background: white;
    padding: 5px;
    width: 100vw;
    display: grid;
    grid-template:
      'rugnr faceimg countryimg editAttempts' auto
      'name name groupimg editAttempts' auto
      'editName editName groupimg editAttempts' auto
      'editHeight editHeight group editAttempts' auto
      'footer footer footer footer' auto
      / auto auto auto auto;
  }
  @media only screen and (max-width: 400px) {
    .editPanel {
      grid-template:
        'rugnr faceimg ' auto
        'name name ' auto
        'editName editName ' auto
        'editHeight editHeight ' auto
        'countryimg editAttempts' auto
        'groupimg editAttempts' auto
        'group editAttempts' auto
        'footer footer' auto
        / auto auto;
    }
  }
  .editPanel > * {
    align-self: center;
    justify-self: center;
    padding: 2px;
  }
  .height {
    grid-area: height;
  }
  .name {
    grid-area: name;
  }
  .rugnr {
    grid-area: rugnr;
  }
  .countryimg {
    grid-area: countryimg;
  }
  .faceimg {
    grid-area: faceimg;
  }
  .groupimg {
    grid-area: groupimg;
  }
  .group {
    grid-area: group;
  }
  .editHeight {
    grid-area: editHeight;
  }
  .editName {
    grid-area: editName;
  }
  .editAttempts {
    grid-area: editAttempts;
  }
  .footer {
    grid-area: footer;
  }
  .name {
    font-size: 2em;
  }
  .rugnr {
    font-size: 4em;
  }
</style>
