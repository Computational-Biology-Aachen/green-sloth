import { slugify } from "#lib/mechanisms/index.js";
import {
  Bold,
  Code,
  H1,
  H2,
  H3,
  H4,
  H5,
  H6,
  Image,
  Li,
  Link,
  Pre,
  Sub,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  Ul,
} from "@computational-biology-aachen/design";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import type { Plugin } from "svelte-exmarkdown";

// Render markdown with the corporate-design components in place of the default
// HTML elements; anything unmapped falls back to plain HTML.
export const mdPlugins: Plugin[] = [
  {
    remarkPlugin: remarkMath,
    rehypePlugin: [rehypeKatex, { output: "html" }],
  },
  {
    renderer: {
      p: Text,
      h1: H1,
      h2: H2,
      h3: H3,
      h4: H4,
      h5: H5,
      h6: H6,
      a: Link,
      strong: Bold,
      img: Image,
      sub: Sub,
      ul: Ul,
      li: Li,
      code: Code,
      pre: Pre,
      table: Table,
      thead: Thead,
      tbody: Tbody,
      tr: Tr,
      th: Th,
      td: Td,
    },
  },
];

interface HastNode {
  type: string;
  tagName?: string;
  value?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
}

function textOf(node: HastNode): string {
  if (node.type === "text") return node.value ?? "";
  return (node.children ?? []).map(textOf).join("");
}

// The design-system headings take no id, so each h2/h3 gets an empty anchor
// <span id> in front of it instead (id = slugify(heading text)).
function rehypeHeadingAnchors() {
  return (tree: HastNode) => {
    const walk = (node: HastNode) => {
      if (!node.children) return;
      node.children = node.children.flatMap((child) => {
        walk(child);
        if (child.tagName !== "h2" && child.tagName !== "h3") return [child];
        const anchor: HastNode = {
          type: "element",
          tagName: "span",
          properties: { id: slugify(textOf(child)), className: ["md-anchor"] },
          children: [],
        };
        return [anchor, child];
      });
    };
    walk(tree);
  };
}

/** `mdPlugins` plus deep-linkable h2/h3 anchors. */
export const anchoredMdPlugins: Plugin[] = [
  ...mdPlugins,
  { rehypePlugin: rehypeHeadingAnchors },
];
