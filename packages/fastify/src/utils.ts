import type { RequestAdapter } from '@clerk/backend';
import { constants } from '@clerk/backend';
import { parse } from 'cookie';
import type { FastifyRequest } from 'fastify';

export const getSingleValueFromArrayHeader = (value?: string[] | string): string | undefined => {
  return (Array.isArray(value) ? value[0] : value) || undefined;
};

export class FastifyRequestAdapter implements RequestAdapter {
  readonly reqCookies: Record<string, string>;
  constructor(readonly req: FastifyRequest) {
    this.reqCookies = parse(req?.raw?.headers?.cookie || '');
  }

  headers(key: string) {
    if (key === constants.Headers.ForwardedHost || key === constants.Headers.ForwardedPort) {
      return getSingleValueFromArrayHeader(this.req?.headers?.[key]);
    }
    return (this.req?.headers?.[key] as string) || undefined;
  }
  cookies(key: string) {
    return this.reqCookies?.[key] || undefined;
  }
  searchParams(): URLSearchParams | undefined {
    return undefined;
  }
}
