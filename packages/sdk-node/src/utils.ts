import type { IncomingMessage, ServerResponse } from 'http';

// https://nextjs.org/docs/api-routes/api-middlewares#connectexpress-middleware-support
export function runMiddleware(req: IncomingMessage, res: ServerResponse, fn: (...args: any) => any) {
  return new Promise((resolve, reject) => {
    // @ts-ignore
    void fn(req, res, result => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

export const getClientUat = (cookies: any, name: string) => {
  if (cookies[name]) {
    return cookies[name];
  }

  return cookies['__client_uat'];
};
