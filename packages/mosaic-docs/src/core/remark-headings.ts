import { valueToEstree } from 'estree-util-value-to-estree';
import GithubSlugger from 'github-slugger';
import type { Root } from 'mdast';
import { toString } from 'mdast-util-to-string';
import { visit } from 'unist-util-visit';

import type { TocHeading } from './toc.ts';

export default function remarkHeadings() {
  return (tree: Root): void => {
    const slugger = new GithubSlugger();
    const headings: TocHeading[] = [];

    visit(tree, 'heading', node => {
      const text = toString(node);
      const slug = slugger.slug(text);
      node.data = { ...node.data, hProperties: { ...node.data?.hProperties, id: slug } };
      if (node.depth === 2 || node.depth === 3) {
        headings.push({ depth: node.depth, slug, text });
      }
    });

    tree.children.unshift({
      type: 'mdxjsEsm',
      value: '',
      data: {
        estree: {
          type: 'Program',
          sourceType: 'module',
          body: [
            {
              type: 'ExportNamedDeclaration',
              specifiers: [],
              attributes: [],
              declaration: {
                type: 'VariableDeclaration',
                kind: 'const',
                declarations: [
                  {
                    type: 'VariableDeclarator',
                    id: { type: 'Identifier', name: 'headings' },
                    init: valueToEstree(headings),
                  },
                ],
              },
            },
          ],
        },
      },
    });
  };
}
