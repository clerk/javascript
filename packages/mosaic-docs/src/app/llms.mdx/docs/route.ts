import { readFileSync } from 'node:fs';
import path from 'node:path';

import { mdxToMarkdown } from '@/core/mdx-markdown';

export const dynamic = 'force-static';

export function GET() {
  const markdown = mdxToMarkdown(readFileSync(path.join(process.cwd(), 'src/content/setup.mdx'), 'utf8'));
  return new Response(markdown, { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
}
