<script lang="ts">
  export let attempts;
</script>

{#if attempts}
  {#each attempts as attempt}
    {#if attempt == 'V'}
      <div class="V" />
    {:else}
      <div class="X" />
    {/if}
  {/each}
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
