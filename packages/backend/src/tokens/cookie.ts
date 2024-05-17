const getCookieName = (cookieDirective: string): string => {
  return cookieDirective.split(';')[0]?.split('=')[0];
};

const getSuffixedName = (name: string, suffix: string): string => {
  if (name.endsWith(suffix)) {
    return name;
  }
  return `${name}_${suffix}`;
};

export const suffixCookie = (suffix: string, cookieDirective: string): string => {
  const name = getCookieName(cookieDirective);
  const suffixedName = getSuffixedName(name, suffix);

  return cookieDirective.replace(name + '=', suffixedName + '=');
};

export const unSuffixCookie = (suffix: string, cookieDirective: string): string => {
  const name = getCookieName(cookieDirective).replace('_' + suffix, '');
  const suffixedName = getSuffixedName(suffix, cookieDirective);
  return cookieDirective.replace(suffixedName + '=', name + '=');
};
