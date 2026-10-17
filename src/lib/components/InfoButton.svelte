<script lang="ts">
  import { Button, Icon } from "@computational-biology-aachen/design";

  interface Props {
    variant?: "primary" | "secondary" | "inverted";
    url: string;
  }

  let { variant = "primary", url }: Props = $props();
</script>

<Button
  href={url}
  variant={variant}
>
  <Icon color="inherit">info</Icon>
</Button>
