<script lang="ts">
  import { compo, categoryId, meterId } from '$lib/stores.js';
  import Ranking from '$lib/Ranking.svelte';
  import ThrowOrder from '$lib/ThrowOrder.svelte';
  let catName;
  $: catName = $compo.categories[$categoryId]?.name || '';
</script>

{#if $categoryId && $compo.categories[$categoryId]?.ranking.length == 0}
  No rankings yet for {catName}
{/if}
{#if $categoryId && $compo.categories[$categoryId]?.ranking.length > 0}
  <Ranking bind:compo={$compo} bind:categoryId={$categoryId} />
{/if}

{#if $meterId && $compo.meters[$meterId]?.throwOrder.length > 0}
  <ThrowOrder bind:compo={$compo} bind:meterId={$meterId} />
{/if}

<!-- <pre>{JSON.stringify($compo.meters[$meterId],0,2)}</pre> -->
