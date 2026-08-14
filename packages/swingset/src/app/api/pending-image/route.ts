// Long enough to show `Avatar.Fallback`'s pending pulse, finite so the example can show it stop.
const HOLD_MS = 60_000;

// 1×1 transparent PNG.
const PIXEL = Uint8Array.from(
  atob('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='),
  character => character.charCodeAt(0),
);

// Never cached: a cached response comes back `complete`, which `Avatar.Image` resolves before
// paint, so the example would go quiet on a second visit.
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
