<script lang="ts">
  import { compo, categoryId, meterId } from '$lib/stores.js';
  import Ranking from '$lib/Ranking.svelte';
  import ThrowOrder from '$lib/ThrowOrder.svelte';
  let catName;
  $: catName = $compo.categories[$categoryId]?.name || '';
</script>

{#if $categoryId && $compo.categories[$categoryId]}
  <Ranking />
{/if}

{#if $meterId && $compo.meters[$meterId]}
  <ThrowOrder />
{/if}
