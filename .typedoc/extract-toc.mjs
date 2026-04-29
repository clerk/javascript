// @ts-check - Remark plugin for TOC extraction from markdown headings
/**
 * A remark plugin that extracts a table of contents (TOC) from markdown headings
 * and injects it into the document's YAML frontmatter as a structured `toc` field.
 *
 * This enables the docs rendering engine to access TOC data without re-parsing
 * the markdown, making it straightforward to render an expandable mobile TOC.
 *
 * Usage with the clerk-docs build pipeline (scripts/build-docs.ts):
 *
 *   import { extractToc } from './extract-toc.mjs'
 *
 *   remark()
 *     .use(remarkFrontmatter)
 *     .use(remarkMdx)
 *     .use(remarkGfm)
 *     .use(extractToc())
 *     .process(...)
 *
 * The resulting frontmatter will include a `toc` field like:
 *
 *   toc:
 *     - title: Getting started
 *       slug: getting-started
 *       level: 2
 *     - title: Installation
 *       slug: installation
 *       level: 3
 */

import { toString } from 'mdast-util-to-string';

/**
 * @typedef {Object} TocEntry
 * @property {string} title - The heading text content
 * @property {string} slug - The URL-safe anchor slug
 * @property {number} level - The heading level (2-4)
 */

/**
 * Simple slugify: lowercases, replaces non-alphanumeric chars with hyphens,
 * collapses multiple hyphens, and trims leading/trailing hyphens.
 * @param {string} text
 * @returns {string}
 */
export function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Extracts a custom heading ID from an MDX annotation like `## Heading {{ id: 'custom-id' }}`
 * @param {import('unist').Node} node
 * @returns {string | undefined}
 */
function extractCustomHeadingId(node) {
  if (!('children' in node) || !Array.isArray(node.children)) {
    return undefined;
  }

  const mdxExpression = node.children.find(
    /** @param {any} child */
    child => child?.type === 'mdxTextExpression',
  );

  if (!mdxExpression?.data?.estree?.body) {
    return undefined;
  }

  const expressionStatement = mdxExpression.data.estree.body.find(
    /** @param {any} child */
    child => child?.type === 'ExpressionStatement',
  );

  const idProp = expressionStatement?.expression?.properties?.find(
    /** @param {any} prop */
    prop => prop?.key?.name === 'id',
  );

  return idProp?.value?.value;
}

/**
 * Extracts heading text, excluding MDX expression nodes (like `{{ id: 'custom-id' }}`).
 * @param {import('unist').Node} node
 * @returns {string}
 */
function extractHeadingText(node) {
  if (!('children' in node) || !Array.isArray(node.children)) {
    return toString(node);
  }

  const textChildren = node.children.filter(
    /** @param {any} child */
    child => child.type !== 'mdxTextExpression',
  );

  return textChildren
    .map(child => toString(child))
    .join('')
    .trim();
}

/**
 * Extracts a structured table of contents from an array of heading AST nodes.
 *
 * @param {Array<{ node: import('unist').Node, depth: number }>} headings
 * @returns {TocEntry[]}
 */
export function buildTocFromHeadings(headings) {
  return headings
    .filter(({ depth }) => depth >= 2 && depth <= 4)
    .map(({ node, depth }) => {
      const title = extractHeadingText(node);
      const customId = extractCustomHeadingId(node);
      const slug = customId || slugify(title);

      return { title, slug, level: depth };
    })
    .filter(entry => entry.title.length > 0 && entry.slug.length > 0);
}

/**
 * Remark plugin that extracts TOC from headings and adds it to YAML frontmatter.
 *
 * @param {{ minDepth?: number, maxDepth?: number }} [options]
 * @returns {() => (tree: import('unist').Node) => void}
 */
export function extractToc(options = {}) {
  const { minDepth = 2, maxDepth = 4 } = options;

  return () =>
    /** @param {import('unist').Node} tree */
    tree => {
      if (!('children' in tree) || !Array.isArray(tree.children)) {
        return;
      }

      /** @type {Array<{ node: import('unist').Node, depth: number }>} */
      const headings = [];

      for (const child of tree.children) {
        if (child.type === 'heading' && 'depth' in child) {
          const depth = /** @type {number} */ (child.depth);
          if (depth >= minDepth && depth <= maxDepth) {
            headings.push({ node: child, depth });
          }
        }
      }

      const toc = buildTocFromHeadings(headings);

      if (toc.length === 0) {
        return;
      }

      const yamlNode = tree.children.find(
        /** @param {any} child */
        child => child.type === 'yaml',
      );

      if (yamlNode && 'value' in yamlNode && typeof yamlNode.value === 'string') {
        const tocYaml = toc
          .map(
            entry =>
              `  - title: "${entry.title.replace(/"/g, '\\"')}"\n    slug: "${entry.slug}"\n    level: ${entry.level}`,
          )
          .join('\n');

        yamlNode.value = `${yamlNode.value}\ntoc:\n${tocYaml}`;
      }
    };
}
