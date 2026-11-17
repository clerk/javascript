import { docToMarkdown } from '@/core/doc-markdown';
import { llmsFull, llmsIndex } from '@/core/llms';
import { type DocEntry, docHref, docKinds, docsOfKind, relatedHref } from '@/lib/docs';
import { site } from '@/lib/site';

export function docsIndexMarkdown(): string {
  return llmsIndex(
    site,
    docKinds.map(({ kind, title }) => ({
      title,
      pages: docsOfKind(kind).map(entry => ({
        title: entry.doc.name,
        href: docHref(entry),
        description: entry.doc.description,
      })),
    })),
  );
}

export function docsFullMarkdown(): string {
  return llmsFull(
    site,
    docKinds.flatMap(({ kind }) =>
      docsOfKind(kind).map(entry => ({ href: docHref(entry), markdown: docMarkdown(entry) })),
    ),
  );
}

export function docMarkdown(entry: DocEntry): string {
  return docToMarkdown(entry.doc, relatedHref);
}
