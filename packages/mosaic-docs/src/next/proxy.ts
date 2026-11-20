import { type NextRequest, NextResponse } from 'next/server';

import { prefersMarkdown } from '@/core/negotiation';

export function markdownProxy(markdownBase: string): (request: NextRequest) => NextResponse {
  return request => {
    const { pathname } = request.nextUrl;
    return !pathname.endsWith('.md') && prefersMarkdown(request.headers.get('accept'))
      ? NextResponse.rewrite(new URL(`${markdownBase}${pathname}`, request.url), { headers: { Vary: 'Accept' } })
      : NextResponse.next();
  };
}
