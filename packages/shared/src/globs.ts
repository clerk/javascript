import globToRegexp from 'glob-to-regexp';

export const globs = {
  toRegexp: (pattern: string): RegExp => {
    try {
      return globToRegexp(pattern);
    } catch (e: any) {
      throw new Error(
        `Invalid pattern: ${pattern}.\nConsult the documentation of glob-to-regexp here: https://www.npmjs.com/package/glob-to-regexp.\n${e.message}`,
      );
    }
  },
};
