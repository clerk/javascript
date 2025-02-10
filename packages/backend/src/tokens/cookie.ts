export const getCookieName = (cookieDirective: string): string => {
  return cookieDirective.split(';')[0]?.split('=')[0];
};

export const getCookieValue = (cookieDirective: string): string => {
  return cookieDirective.split(';')[0]?.split('=')[1];
};
