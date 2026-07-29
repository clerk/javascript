// OAuth redirect chains can leave a stray `#` on the callback URL, literal or percent-encoded
// into the last query value, so strip it from both the URL and the extracted value.
export function getAuthSessionCallbackParam(url: string, name: string): string | null {
  let value: string | null;
  try {
    value = new URL(url.split('#')[0]).searchParams.get(name);
  } catch {
    return null;
  }
  return value?.split('#')[0] ?? null;
}
