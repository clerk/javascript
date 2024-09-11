import { pathToRegexp as pathToRegexpBase } from './compiled/path-to-regexp';

export const pathToRegexp = (path: string) => {
  try {
    // @ts-ignore no types exists for the pre-compiled package
    return pathToRegexpBase(path) as RegExp;
  } catch (e: any) {
    throw new Error(
      `Invalid path: ${path}.\nConsult the documentation of path-to-regexp here: https://github.com/pillarjs/path-to-regexp\n${e.message}`,
    );
  }
};
