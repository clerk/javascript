import { docsIndexMarkdown } from '@/lib/llms-docs';

export const dynamic = 'force-static';

export function GET() {
  return new Response(docsIndexMarkdown(), { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
}
