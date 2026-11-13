<script lang="ts">
  import MechanismPage from "#lib/features/mechanisms/MechanismPage.svelte";

  let { data } = $props();
</script>

<MechanismPage
  meta={data.meta}
  md={data.md}
/>
