<script lang="ts">
  import '../app.css';
</script>

<main>
  <slot />
</main>

<style>
  main {
    flex: 1;
    display: flex;
    flex-direction: column;
    width: 100%;
    /* max-width: 1024px; */
    margin: 0 auto;
  }

  @media (min-width: 480px) {
    main {
      /* padding: 1rem; */
    }
  }
</style>
