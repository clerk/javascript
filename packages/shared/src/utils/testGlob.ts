import globToRegexp from 'glob-to-regexp';

export const testGlob = (pattern: string, input: string) => {
  const re = globToRegexp(pattern);
  return re.test(input);
};
