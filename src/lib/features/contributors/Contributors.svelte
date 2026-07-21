<script lang="ts">
  import CardContributor from "$lib/components/CardContributor.svelte";
  import contributors from "$lib/contributors";

  const sorted = Object.keys(contributors)
    .sort()
    .map((key) => contributors[key]);
</script>

<div class="grid">
  {#each sorted as contributor (contributor.key)}
    <CardContributor contributor={contributor} />
  {/each}
</div>

<style>
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(500px, 1fr));
    gap: var(--space-6);
    margin: 0 auto;
    width: 100%;
    max-width: var(--max-width);
  }
</style>
