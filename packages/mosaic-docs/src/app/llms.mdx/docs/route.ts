import { docHref, docKinds, docsOfKind } from '@/lib/docs';
import { site } from '@/lib/site';

export const dynamic = 'force-static';

export function GET() {
  const sections = docKinds.map(({ kind, title }) =>
    [
      `## ${title}`,
      docsOfKind(kind)
        .map(entry => `- [${entry.doc.name}](${docHref(entry)}.md): ${entry.doc.description}`)
        .join('\n'),
    ].join('\n\n'),
  );
  const markdown = `${[`# ${site.name}`, site.description, ...sections].join('\n\n')}\n`;
  return new Response(markdown, { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
}
