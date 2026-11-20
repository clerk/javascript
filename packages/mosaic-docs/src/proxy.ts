import { markdownProxy } from '@/next/proxy';

export const proxy = markdownProxy('/llms.mdx');

export const config = {
  matcher: ['/docs/setup', '/docs/:kind/:slug'],
};
