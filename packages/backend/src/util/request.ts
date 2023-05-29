/**
 * This function is only used in the case where:
 * - DevOrStaging key is present
 * - The request carries referrer information
 * (This case most of the times signifies redirect from Clerk Auth pages)
 *
 */
export function checkCrossOrigin({
  originURL,
  host,
  forwardedHost,
  forwardedPort,
  forwardedProto,
}: {
  originURL: URL;
  host: string;
  forwardedHost?: string | null;
  forwardedPort?: string | null;
  forwardedProto?: string | null;
}) {
  if (forwardedProto && forwardedProto !== originURL.protocol) {
    return true;
  }

  const defaultHostProtocol = originURL.protocol;

  /* The forwarded host prioritised over host to be checked against the referrer.  */
  const finalURL = convertHostHeaderValueToURL(forwardedHost || host, defaultHostProtocol);

  const finalURLPort = (forwardedPort || finalURL.port || getDefaultPort(forwardedProto || defaultHostProtocol)) ?? '';

  if (finalURLPort !== (originURL.port || getDefaultPort(originURL.protocol))) {
    return true;
  }
  if (finalURL.hostname !== originURL.hostname) {
    return true;
  }

  return false;
}

export function convertHostHeaderValueToURL(host: string, protocol: string): URL {
  /**
   * The protocol is added for the URL constructor to work properly.
   * We do not check for the protocol at any point later on.
   */
  return new URL(`${protocol}//${host}`);
}

export function getDefaultPort(protocol: string): string | undefined {
  return {
    'http:': '80',
    'https:': '443',
  }[protocol];
}
