import { buildOrigin } from '../utils';
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
  forwardedProto,
}: {
  originURL: URL;
  host?: string | null;
  forwardedHost?: string | null;
  forwardedProto?: string | null;
}) {
  const finalURLstring = buildOrigin({ forwardedProto, forwardedHost, protocol: originURL.protocol, host });
  if (!finalURLstring) {
    return false;
  }
  const finalURL = new URL(finalURLstring);
  if (finalURL.origin === originURL.origin) {
    return false;
  }
  // AWS CloudFront always sets origin protocol to http, and it's impossible to change
  if (finalURL.host === originURL.host && finalURL.protocol === 'https:' && originURL.protocol === 'http:') {
    return false;
  }
  return true;
}

export function convertHostHeaderValueToURL(host?: string, protocol = 'https'): URL {
  /**
   * The protocol is added for the URL constructor to work properly.
   * We do not check for the protocol at any point later on.
   */
  return new URL(`${protocol}://${host}`);
}

type ErrorFields = {
  message: string;
  long_message: string;
  code: string;
};

export const getErrorObjectByCode = (errors: ErrorFields[], code: string) => {
  if (!errors) {
    return null;
  }

  return errors.find((err: ErrorFields) => err.code === code);
};
