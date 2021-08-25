<script lang="ts">
  export let open = false;
  export let canClose = false;
  let me;
  function captureClick(e) {
    if (e.target === me && canClose) {
      open = false;
    }
  }
</script>

<div class:open={open !== false} bind:this={me} on:click={captureClick}>
  <slot />
</div>

<style>
  div {
    display: none;
    z-index: 100;
  }
  div.open {
    display: block;
  }
  div:after {
    z-index: -1;
    content: '';
    pointer-events: none;
    opacity: 0;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: black;
  }
  div.open:after {
    pointer-events: all;
    opacity: 0.4;
  }
</style>
