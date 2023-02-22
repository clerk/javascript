export const getSingleValueFromArrayHeader = (value?: string[] | string): string | undefined => {
  return (Array.isArray(value) ? value[0] : value) || undefined;
};

export const getClientUat = (cookies: any, name: string) => {
  if (cookies[name]) {
    return cookies[name];
  }

  return cookies['__client_uat'];
};
