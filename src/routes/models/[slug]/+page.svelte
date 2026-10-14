<script lang="ts">
  import ModelPage from "#lib/features/modelPage/ModelPage.svelte";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();
</script>

<ModelPage data={data} />
