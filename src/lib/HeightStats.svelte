<script>
  export let stats;
</script>

<div>
  <!-- <span class="count">{stats.count}</span> -->
  <span class="remaining">{stats.remaining}</span>
  <span class="eliminated">{stats.count - stats.remaining}</span>
</div>

<style>
  .remaining {
    color: green;
  }
  .eliminated {
    color: red;
    font-size: 1.2em;
  }
</style>
