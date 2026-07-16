<script lang="ts">
    let { license, journal }: { license: string; journal: string } = $props();
</script>

<div class="copyright-bug">
  <span class="copyright-text">
    © {license} - {journal}
  </span>
</div>

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

    pointer-events: none;
  }
</style>