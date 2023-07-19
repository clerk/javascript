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
  const finalURL = buildOrigin({ forwardedProto, forwardedHost, protocol: originURL.protocol, host });
  return finalURL && new URL(finalURL).origin !== originURL.origin;
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
