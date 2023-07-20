import { constants } from './constants';

const getHeader = (req: Request, key: string) => req.headers.get(key);
const getFirstValueFromHeader = (value?: string | null) => value?.split(',')[0];

type BuildRequestUrl = (request: Request, path?: string) => URL;
export const buildRequestUrl: BuildRequestUrl = (request, path) => {
  const initialUrl = new URL(request.url);

  const forwardedProto = getHeader(request, constants.Headers.ForwardedProto);
  const forwardedHost = getHeader(request, constants.Headers.ForwardedHost);
  const host = getHeader(request, constants.Headers.Host);
  const protocol = initialUrl.protocol;

  const base = buildOrigin({ protocol, forwardedProto, forwardedHost, host: host || initialUrl.host });

  return new URL(path || initialUrl.pathname, base);
};

type BuildOriginParams = {
  protocol?: string;
  forwardedProto?: string | null;
  forwardedHost?: string | null;
  host?: string | null;
};
type BuildOrigin = (params: BuildOriginParams) => string;
export const buildOrigin: BuildOrigin = ({ protocol, forwardedProto, forwardedHost, host }) => {
  const resolvedHost = getFirstValueFromHeader(forwardedHost) ?? host;
  const resolvedProtocol = getFirstValueFromHeader(forwardedProto) ?? protocol?.replace(/[:/]/, '');

  if (!resolvedHost || !resolvedProtocol) {
    return '';
  }

  return `${resolvedProtocol}://${resolvedHost}`;
};
