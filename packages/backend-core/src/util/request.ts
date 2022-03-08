/**
 * This function is only used in the case where:
 * - DevOrStaging key is present
 * - The request carries referrer information
 * (This case most of the times signifies redirect from Clerk Auth pages)
 *
 */
export function checkCrossOriginReferrer({
  referrerURL,
  host,
  forwardedHost,
  forwardedPort,
  forwardedProto,
}: {
  referrerURL: URL;
  host: string;
  forwardedHost?: string | null;
  forwardedPort?: string | null;
  forwardedProto?: string | null;
}) {
  if (forwardedProto && forwardedProto !== referrerURL.protocol) {
    return true;
  }

  /* The forwarded host prioritised over host to be checked against the referrer.  */
  const finalURL = convertHostHeaderValueToURL(forwardedHost || host);

  finalURL.port = forwardedPort || finalURL.port;

  if (finalURL.port !== referrerURL.port) {
    return true;
  }
  if (finalURL.hostname !== referrerURL.hostname) {
    return true;
  }

  return false;
}

function convertHostHeaderValueToURL(host: string): URL {
  /**
   * The protocol is added for the URL constructor to work properly.
   * We do not check for the protocol at any point later on.
   */
  return new URL(`https://${host}`);
}
