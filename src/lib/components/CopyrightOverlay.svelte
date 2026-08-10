<script lang="ts">
  let {
    license,
    journal,
    doi,
  }: { license: string; journal: string; doi: string } = $props();
</script>

<a
  class="copyright-bug"
  href={doi}
  target="_blank"
>
  <span class="copyright-text">
    {license} - {journal}
  </span>
</a>

<style>
  .copyright-bug {
    position: absolute;
    bottom: 0;
    left: 0;

    border-top-right-radius: 12px;

    background-color: rgba(0, 0, 0, 0.7);
    padding: 8px 16px;

    width: auto;
    max-width: 85%;

    pointer-events: auto;
    color: white;

    white-space: nowrap;
  }
</style>
