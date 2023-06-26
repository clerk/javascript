import { pathToRegexp } from 'path-to-regexp';

export const paths = {
  toRegexp: (path: string) => {
    try {
      return pathToRegexp(path);
    } catch (e: any) {
      throw new Error(
        `Invalid path: ${path}.\nConsult the documentation of path-to-regexp here: https://github.com/pillarjs/path-to-regexp\n${e.message}`,
      );
    }
  },
};
