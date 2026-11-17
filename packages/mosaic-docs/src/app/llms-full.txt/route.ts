import { docsFullMarkdown } from '@/lib/llms-docs';

export const dynamic = 'force-static';

export function GET() {
  return new Response(docsFullMarkdown(), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
