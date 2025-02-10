import { constants as nextConstants } from '../constants';

export const isRedirect = (res: Response) => {
  return res.headers.get(nextConstants.Headers.NextRedirect);
};

export const setHeader = <T extends Response>(res: T, name: string, val: string): T => {
  res.headers.set(name, val);
  return res;
};
