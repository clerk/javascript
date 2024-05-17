export const getSuffixedCookieName = (cookieName: string, publishableKey: string): string => {
  return `${cookieName}_${publishableKey.split('_').pop() || ''}`;
};
