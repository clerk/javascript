import { pathToRegexp } from './pathToRegexp';

export const paths = {
  toRegexp: (path: string) => {
    try {
      // @ts-ignore precompiled package - no types available
      return pathToRegexp(path);
    } catch (e: any) {
      throw new Error(
        `Invalid path: ${path}.\nConsult the documentation of path-to-regexp here: https://github.com/pillarjs/path-to-regexp\n${e.message}`,
      );
    }
  },
};
