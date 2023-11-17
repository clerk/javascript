import { constants } from './constants';

const getHeader = (req: Request, key: string) => req.headers.get(key);
const getFirstValueFromHeader = (value?: string | null) => value?.split(',')[0];

type BuildRequestUrl =
  | ((request: Request, path?: string | BuildOriginOptions) => URL)
  | ((request: Request, opts?: string | BuildOriginOptions) => URL)
  | ((request: Request, pathOrOpts?: string | BuildOriginOptions, opts?: BuildOriginOptions) => URL);

export const buildRequestUrl: BuildRequestUrl = (request, pathOrOpts, opts) => {
  const initialUrl = new URL(request.url);

  let path: string | undefined;
  let options: BuildOriginOptions | undefined;

  if (typeof pathOrOpts === 'object' && 'hostPreference' in pathOrOpts) {
    options = pathOrOpts;
  } else {
    path = pathOrOpts;
    options = opts;
  }

  const forwardedProto = getHeader(request, constants.Headers.ForwardedProto);
  const forwardedHost = getHeader(request, constants.Headers.ForwardedHost);
  const host = getHeader(request, constants.Headers.Host);
  const protocol = initialUrl.protocol;

  const base = buildOrigin({ protocol, forwardedProto, forwardedHost, host: host || initialUrl.host }, options);

  return new URL(path || initialUrl.pathname, base);
};

export type BuildOriginOptions = {
  hostPreference: 'default' | 'forwarded';
};

type BuildOriginParams = {
  protocol?: string;
  forwardedProto?: string | null;
  forwardedHost?: string | null;
  host?: string | null;
};
type BuildOrigin = (params: BuildOriginParams, options?: BuildOriginOptions) => string;

export const buildOrigin: BuildOrigin = ({ protocol, forwardedProto, forwardedHost, host }, opts) => {
  const { hostPreference = 'default' } = opts || {};

  const fwd = getFirstValueFromHeader(forwardedHost);

  const resolvedHost = hostPreference === 'default' ? host ?? fwd : fwd ?? host;
  const resolvedProtocol = getFirstValueFromHeader(forwardedProto) ?? protocol?.replace(/[:/]/, '');

  if (!resolvedHost || !resolvedProtocol) {
    return '';
  }

  return `${resolvedProtocol}://${resolvedHost}`;
};
