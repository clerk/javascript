export const getSingleValueFromArrayHeader = (value?: string[] | string): string | undefined => {
  return (Array.isArray(value) ? value[0] : value) || undefined;
};
