<script context="module" lang="ts">
  import Ranking from '$lib/Ranking.svelte';
  import type { LoadOutput, LoadInput } from '@sveltejs/kit';
  export const prerender = true;
  export async function load({ fetch, page }: LoadInput): Promise<LoadOutput> {
    const { compid } = page.params;
    let res = await fetch(`/api/${compid}`);
    if (res.ok) {
      return {
        props: { compo: await res.json(), categoryId: page.query.get('cat') },
      };
    }
    console.error(await res.text());
  }
</script>

<script lang="ts">
  export let compo;
  export let categoryId;
  let catName;
  $: catName = compo.categories[categoryId]?.name || '';
</script>

<h1>{compo.name}</h1>
<h2>{catName}</h2>
<Ranking bind:compo bind:categoryId />
