<script lang="ts">
    let { license, journal, doi }: { license: string; journal: string; doi: string } = $props();
</script>

<a class="copyright-bug" href={doi} target="_blank">
  <span class="copyright-text">
    {license} - {journal}
  </span>
</a>
<style>
  .copyright-bug {
    position: absolute;
    bottom: 0;
    left: 0;

    background-color: rgba(0, 0, 0, 0.7);
    color: white;

    border-top-right-radius: 12px;
    padding: 8px 16px;

    white-space: nowrap;

    width: auto;
    max-width: 85%;

    pointer-events: auto;
  }
</style>