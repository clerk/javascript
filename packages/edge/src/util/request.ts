export function checkCrossOrigin(
  origin: string | null,
  initialHost: string | null,
  forwardedHost: string | null,
  port: string | null
) {
  // TODO: Does a request without Host, count as false or should we throw ?
  if (!origin || !initialHost) {
    return false;
  }

  // Need to append the protocol if not exists for URL parse to work correctly
  if (
    !initialHost.startsWith("http://") &&
    !initialHost.startsWith("https://")
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

  if (port && port !== "80" && port !== "443") {
    forwardedHost = `${forwardedHost}:${port}`;
  }

  return origin !== forwardedHost;
}
