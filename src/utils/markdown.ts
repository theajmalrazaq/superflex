import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import { toString } from "mdast-util-to-string";
import type { Root, RootContent, Nodes } from "mdast";

const markdown = unified().use(remarkParse).use(remarkGfm);
export const parseMarkdown = (content: string): Root => markdown.parse(content);
export const markdownText = (content: string): string => toString(parseMarkdown(content));

export function markdownLinks(content: string | Root): string[] {
  const tree = typeof content === "string" ? parseMarkdown(content) : content;
  const definitions = new Map<string, string>();
  function collectDefinitions(node: Nodes) {
    if (node.type === "definition" && !definitions.has(node.identifier.toLowerCase()))
      definitions.set(node.identifier.toLowerCase(), node.url);
    if ("children" in node)
      for (const child of node.children) collectDefinitions(child as RootContent);
  }
  collectDefinitions(tree);
  const links: string[] = [];
  function walk(node: Nodes) {
    if (node.type === "code" || node.type === "inlineCode" || node.type === "definition") return;
    if (node.type === "link") links.push(node.url);
    if (node.type === "linkReference") {
      const url = definitions.get(node.identifier.toLowerCase());
      if (url) links.push(url);
    }

    if (node.type === "text") {
      for (const token of node.value.split(/\s+/)) {
        if (token.toLowerCase().startsWith("mailto:")) links.push(token);
      }
    }
    if ("children" in node) for (const child of node.children) walk(child as RootContent);
  }
  walk(tree);
  return links;
}

export function questionText(content: string): string {
  const tree = parseMarkdown(content);
  function clean(node: Nodes): string {
    if (["image", "imageReference", "html", "definition"].includes(node.type)) return "";
    if (node.type === "link" && toString(node) === node.url) return "";
    if (node.type === "break") return " ";
    if ("children" in node)
      return node.children
        .map((child) => clean(child as RootContent))
        .join(
          ["root", "list", "listItem", "blockquote", "table", "tableRow"].includes(node.type)
            ? " "
            : "",
        );
    return toString(node);
  }
  return clean(tree).replace(/\s+/g, " ").trim();
}
