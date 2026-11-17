import { readFileSync } from 'node:fs';
import path from 'node:path';

import { docToMarkdown } from '@/core/doc-markdown';
import { llmsFull, llmsIndex } from '@/core/llms';
import { mdxToMarkdown } from '@/core/mdx-markdown';
import { type DocEntry, docHref, docKinds, docsOfKind, relatedMarkdownHref } from '@/lib/docs';
import { site } from '@/lib/site';

export function docsIndexMarkdown(): string {
  return llmsIndex(site, [
    {
      title: 'Get started',
      pages: [
        {
          title: 'Setup',
          href: '/docs/setup',
          description: 'Install Mosaic, import its stylesheet, and give your app root its own stacking context.',
        },
      ],
    },
    ...docKinds.map(({ kind, title }) => ({
      title,
      pages: docsOfKind(kind).map(entry => ({
        title: entry.doc.name,
        href: docHref(entry),
        description: entry.doc.description,
      })),
    })),
  ]);
}

export function docsFullMarkdown(): string {
  return llmsFull(site, [
    { href: '/docs/setup', markdown: setupMarkdown() },
    ...docKinds.flatMap(({ kind }) =>
      docsOfKind(kind).map(entry => ({ href: docHref(entry), markdown: docMarkdown(entry) })),
    ),
  ]);
}

export function setupMarkdown(): string {
  return mdxToMarkdown(readFileSync(path.join(process.cwd(), 'src/content/setup.mdx'), 'utf8'));
}

export function docMarkdown(entry: DocEntry): string {
  return docToMarkdown(entry.doc, relatedMarkdownHref);
}
