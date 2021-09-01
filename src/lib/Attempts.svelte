<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();
  function update() {
    dispatch('update', attempts);
  }

  export let attempts = [];
  export let edit = false;
  const onBlur = (e) => {
    attempts = e.target.value.match(/X|V/gi);
    update();
  };
</script>

{#if attempts}
  {#if edit}
    <input type="text" value={attempts.join(',')} on:blur={onBlur} />
  {:else}
    {#each attempts as attempt}
      {#if attempt == 'V'}
        <div class="V" />
      {:else}
        <div class="X" />
      {/if}
    {/each}
  {/if}
{/if}

<style>
  .V {
    display: inline-block;
    color: green;
  }
  /* .V:before{content:'✓' font-size:30px;} */
  .V:before {
    content: '✔';
  }
  .X {
    display: inline-block;
    color: red;
  }
  /* .X:before{content:'❌'} */
  .X:before {
    content: '✖';
  }
</style>
