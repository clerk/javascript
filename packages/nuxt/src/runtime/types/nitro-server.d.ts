import type { H3Event } from 'h3';

export {
  createError,
  eventHandler,
  getRequestHeaders,
  getRequestProtocol,
  getRequestURL,
  setResponseHeader,
  toWebRequest,
} from 'h3';
export type { EventHandler, H3Event } from 'h3';

// useRuntimeConfig is provided by Nitro at runtime. The consuming Nuxt app
// augments this type via its own generated .nuxt types.
declare function useRuntimeConfig(event?: H3Event): any;
export { useRuntimeConfig };
