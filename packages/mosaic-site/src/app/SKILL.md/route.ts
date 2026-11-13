import skill from '@/lib/skill.md?raw';

export const dynamic = 'force-static';

export function GET() {
  return new Response(skill, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
