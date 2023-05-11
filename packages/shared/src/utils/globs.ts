import globToRegexp from 'glob-to-regexp';

export const globs = {
  toRegexp: (pattern: string) => {
    try {
      return globToRegexp(pattern) as RegExp;
    } catch (e: any) {
      throw new Error(
        `Invalid pattern: ${pattern}.\nConsult the documentation of glob-to-regexp here: https://www.npmjs.com/package/glob-to-regexp.\n${e.message}`,
      );
    }
  },
};
