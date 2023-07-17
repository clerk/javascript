import { constants } from './constants';

// TODO: replace Request type with runtime.Request
// import type runtime from './runtime';
// type Request = typeof runtime.Request

const getHeader = (req: Request, key: string) => req.headers.get(key);
const getFirstValueFromHeader = (req: Request, key: string) => getHeader(req, key)?.split(',')[0];

type BuildRequestUrl = (request: Request, path?: string) => URL;
export const buildRequestUrl: BuildRequestUrl = (request, path) => {
  const initialUrl = new URL(request.url);

  const forwardedProto = getFirstValueFromHeader(request, constants.Headers.ForwardedProto);
  const forwardedHost = getFirstValueFromHeader(request, constants.Headers.ForwardedHost);
  const host = getHeader(request, constants.Headers.Host);

  const resolvedHost = forwardedHost ?? host ?? initialUrl.host;
  const resolvedProtocol = forwardedProto ?? initialUrl.protocol.replace(/[:/]/, '');

  return new URL(path || initialUrl.pathname, `${resolvedProtocol}://${resolvedHost}`);
};
