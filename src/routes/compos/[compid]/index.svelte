<script context="module" lang="ts">
  import type { LoadOutput, LoadInput } from '@sveltejs/kit';
  export const prerender = true;
  export async function load({ fetch, page }: LoadInput): Promise<LoadOutput> {
    const { compid } = page.params;
    let res = await fetch(`/api/${compid}`);
    if (res.ok) {
      return {
        props: { compo: await res.json() },
      };
    }
    /* console.error(res.text()); */
    console.error(await res.text());
  }
</script>

<script lang="ts">
  export let compo;
  let categoryId;
  let throwers;
  $: throwers = compo.throwers.filter((t) => t.categories[categoryId]);
</script>

<ul>
  {#each compo.categories as cat, index}
    <li class:active={categoryId == index} on:click={(e) => (categoryId = index)}>{cat.name}</li>
  {/each}
</ul>

<div>
  {#each throwers as thrower}
    <div>
      {thrower.name}
    </div>
  {/each}
</div>

<pre>
  {JSON.stringify(throwers,0,2)}
</pre>

<style>
  ul {
    display: flex;
  }
  ul > li {
    list-style: none;
    cursor: pointer;
    margin: 5px;
  }
  ul > li.active {
    border-bottom: 1px solid red;
  }
</style>
