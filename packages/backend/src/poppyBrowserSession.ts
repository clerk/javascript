import type { PoppyOptions } from './api/endpoints/PoppyApi';
import type { ClerkClient } from './index';

export function createPoppyBrowserSessionHandler(
  options: PoppyOptions & { clerkClient: Pick<ClerkClient, '__experimental_poppy'> },
) {
  const endpoint = new URL(options.browserSessionEndpoint);
  if (
    endpoint.protocol !== 'https:' ||
    endpoint.username ||
    endpoint.password ||
    endpoint.search ||
    endpoint.hash ||
    endpoint.href !== options.browserSessionEndpoint ||
    endpoint.pathname === '/' ||
    endpoint.pathname.endsWith('/')
  ) {
    throw new Error('Expected a canonical HTTPS browser Session endpoint.');
  }
  const redirect = new URL(options.redirectTo ?? '/', endpoint);
  if (redirect.origin !== endpoint.origin || redirect.username || redirect.password) {
    throw new Error('The browser Session redirect must stay on the Company origin.');
  }
  const { clerkClient, ...poppyOptions } = options;
  return (request: Request) => clerkClient.__experimental_poppy.proxyBrowserRequest(request, poppyOptions);
}
