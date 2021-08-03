<script lang="ts">
  import { compo, categoryId } from '$lib/stores.js';
  import Ranking from '$lib/Ranking.svelte';
</script>

<Ranking bind:compo={$compo} bind:categoryId={$categoryId} />
