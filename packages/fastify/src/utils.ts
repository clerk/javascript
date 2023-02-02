import { parse } from 'cookie';
import type { FastifyRequest } from 'fastify';

export const getCookie = (req: FastifyRequest, cookieName: string): string => {
  // TODO: refactor it since it may cause a performance issue to parse each time the cookies
  // we could replace req with cookiesObj
  const cookiesObj = parse(req.raw.headers.cookie || '');
  return cookiesObj[cookieName];
};

export const getSingleValueFromArrayHeader = (value?: string[] | string): string | undefined => {
  return (Array.isArray(value) ? value[0] : value) || undefined;
};
