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
  host?: string | null;
  forwardedHost?: string | null;
  forwardedPort?: string | null;
  forwardedProto?: string | null;
}) {
  const fwdProto = getFirstValueFromHeaderValue(forwardedProto);
  let fwdPort = getFirstValueFromHeaderValue(forwardedPort);

  // If forwardedPort mismatch with forwardedProto determine forwardedPort
  // from forwardedProto as fallback (if exists)
  // This check fixes the Railway App issue
  const fwdProtoHasMoreValuesThanFwdPorts =
    (forwardedProto || '').split(',').length > (forwardedPort || '').split(',').length;
  if (fwdProto && fwdProtoHasMoreValuesThanFwdPorts) {
    fwdPort = getPortFromProtocol(fwdProto);
  }

  const originProtocol = getProtocolVerb(originURL.protocol);
  if (fwdProto && fwdProto !== originProtocol) {
    return true;
  }

  const protocol = fwdProto || originProtocol;
  /* The forwarded host prioritised over host to be checked against the referrer.  */
  const finalURL = convertHostHeaderValueToURL(forwardedHost || host || undefined, protocol);
  finalURL.port = fwdPort || finalURL.port;

  if (getPort(finalURL) !== getPort(originURL)) {
    return true;
  }
  if (finalURL.hostname !== originURL.hostname) {
    return true;
  }

  return false;
}

export function convertHostHeaderValueToURL(host?: string, protocol = 'https'): URL {
  /**
   * The protocol is added for the URL constructor to work properly.
   * We do not check for the protocol at any point later on.
   */
  return new URL(`${protocol}://${host}`);
}

const PROTOCOL_TO_PORT_MAPPING: Record<string, string> = {
  http: '80',
  https: '443',
} as const;

function getPort(url: URL) {
  return url.port || getPortFromProtocol(url.protocol);
}

function getPortFromProtocol(protocol: string) {
  return PROTOCOL_TO_PORT_MAPPING[protocol];
}

function getFirstValueFromHeaderValue(value?: string | null) {
  return value?.split(',')[0]?.trim() || '';
}

function getProtocolVerb(protocol: string) {
  return protocol?.replace(/:$/, '') || '';
}
