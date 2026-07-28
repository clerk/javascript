/**
 * Clones a request without its body or signal for authentication.
 *
 * @internal
 */
export const patchRequest = (request: Request) => {
  // Node's bundled undici rejects cross-realm signals from framework Request subclasses.
  const clonedRequest = new Request(request.url, {
    headers: request.headers,
    method: request.method,
    redirect: request.redirect,
    cache: request.cache,
  });

  if (clonedRequest.method !== 'GET' && clonedRequest.body !== null && !('duplex' in clonedRequest)) {
    (clonedRequest as unknown as { duplex: 'half' }).duplex = 'half';
  }

  return clonedRequest;
};
