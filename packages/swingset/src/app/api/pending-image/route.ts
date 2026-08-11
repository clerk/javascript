// An image source that takes its time, so the Avatar docs can show `Avatar.Fallback`'s pending
// pulse against the component's own status machine rather than faking the attribute. It settles
// eventually — a request left hanging would never leave `loading`, and the point of the example
// is that the pulse stops.
const HOLD_MS = 60_000;

// 1×1 transparent PNG. What lands does not matter; how long it takes to land does.
const PIXEL = Uint8Array.from(
  atob('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='),
  character => character.charCodeAt(0),
);

// Held per request, and never cached: a cached response comes back `complete` on the next visit,
// which is precisely the case `Avatar.Image` resolves before paint, so the example would go quiet.
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  await new Promise<void>(resolve => {
    const timer = setTimeout(resolve, HOLD_MS);
    request.signal.addEventListener('abort', () => {
      clearTimeout(timer);
      resolve();
    });
  });

  return new Response(PIXEL, {
    headers: { 'cache-control': 'no-store', 'content-type': 'image/png' },
  });
}
