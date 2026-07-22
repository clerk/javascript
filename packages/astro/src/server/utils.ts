import { constants } from '@clerk/backend/internal';

export function getAuthKeyFromRequest(req: Request, key: keyof typeof constants.Attributes): string | null | undefined {
  return getHeader(req, constants.Headers[key]);
}

function getHeader(req: Request, name: string) {
  return req.headers.get(name);
}

export const isRedirect = (res: Response) => {
  return (
    [300, 301, 302, 303, 304, 307, 308].includes(res.status) ||
    res.headers.get(constants.Headers.ClerkRedirectTo) === 'true'
  );
};

export const setHeader = <T extends Response>(res: T, name: string, val: string): T => {
  res.headers.set(name, val);
  return res;
};
