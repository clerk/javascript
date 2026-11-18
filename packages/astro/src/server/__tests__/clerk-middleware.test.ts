import { signedOutAuthObject } from '@clerk/backend/internal';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../clerk-client', () => ({
  clerkClient: () => ({
    authenticateRequest: () =>
      Promise.resolve({
        status: 'signed-out',
        headers: new Headers(),
        publishableKey: 'pk_test_Y2xlcmsuZXhhbXBsZS5jb20k',
        toAuth: () => signedOutAuthObject({}),
      }),
  }),
}));
vi.mock('#async-local-storage', async () => {
  const { AsyncLocalStorage } = await import('node:async_hooks');
  return { authAsyncStorage: new AsyncLocalStorage() };
});

import { clerkMiddleware } from '../clerk-middleware';

const env = {
  PUBLIC_CLERK_PUBLISHABLE_KEY: 'pk_test_Y2xlcmsuZXhhbXBsZS5jb20k',
  CLERK_SECRET_KEY: 'sk_test_xxx',
};

async function render(chunks: string[]) {
  const encoder = new TextEncoder();
  const body = new ReadableStream({
    start(controller) {
      chunks.forEach(chunk => controller.enqueue(encoder.encode(chunk)));
      controller.close();
    },
  });
  const url = new URL('http://localhost/');
  const context: any = {
    request: new Request(url, { headers: { accept: 'text/html' } }),
    url,
    locals: { runtime: { env } },
    cookies: { get: () => undefined },
    redirect: () => new Response(null, { status: 307 }),
  };
  const next = () => Promise.resolve(new Response(body, { headers: { 'content-type': 'text/html' } }));
  const res: Response = await (clerkMiddleware() as any)(context, next);
  const html = await res.text();
  return { html, doc: new DOMParser().parseFromString(html, 'text/html') };
}

const value = 'x</head><p id=after-value>';
const escapeAttribute = (value: string) => value.replace(/&/g, '&amp;').replace(/"/g, '&quot;');

const head = `<!DOCTYPE html><html><head><meta name="description" content="${escapeAttribute(value)}"><title>t</title>`;
const decode = (content: string | null | undefined) => JSON.parse(Buffer.from(content ?? '', 'base64url').toString());

describe('clerkMiddleware', () => {
  it('inserts the Clerk tags before the real </head> when an attribute value contains </head>', async () => {
    const { doc } = await render([`${head}</head><body>`, '</body></html>']);

    expect(doc.getElementById('after-value')).toBeNull();
    expect(decode(doc.head.querySelector('meta[name="clerk-astro-data"]')?.getAttribute('content'))).toMatchObject({
      userId: null,
    });
    expect(decode(doc.head.querySelector('meta[name="clerk-astro-safe-vars"]')?.getAttribute('content'))).toMatchObject(
      {
        publishableKey: env.PUBLIC_CLERK_PUBLISHABLE_KEY,
      },
    );
    expect(doc.head.querySelector('link[rel="preload"][as="script"]')).not.toBeNull();
  });

  it('inserts tags with no quotes or end tags', async () => {
    const { html } = await render([`${head}</head><body></body></html>`]);
    const inserted = html.slice(head.length, html.indexOf('</head>', head.length));

    expect(inserted).toContain('clerk-astro-data');
    expect(inserted).not.toMatch(/["'`]|<\//);
  });
});
