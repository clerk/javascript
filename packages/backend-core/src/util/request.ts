export function checkCrossOrigin(
  origin: string | null | undefined,
  initialHost: string,
  forwardedHost?: string | null,
  port?: string | null
) {

  // Remove request's protocol
  origin = origin?.trim().replace(/(^\w+:|^)\/\//, '');
  if (!origin) {
    return false;
  }

  // Need to append the protocol if not exists for URL parse to work correctly
  if (
    !initialHost.startsWith('http://') &&
    !initialHost.startsWith('https://')
  ) {
    initialHost = `https://${initialHost}`;
  }

  const hostURL = new URL(initialHost);

  if (!forwardedHost) {
    forwardedHost = hostURL.hostname;
  }

  if (!port) {
    port = hostURL.port;
  }

  if (port && port !== '80' && port !== '443') {
    forwardedHost = `${forwardedHost}:${port}`;
  }

  return origin !== forwardedHost;
}
