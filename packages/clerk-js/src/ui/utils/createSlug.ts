export const createSlug = (str: string): string => {
  const trimmedStr = str.trim().toLowerCase();
  const slug = trimmedStr.replace(/[^a-z0-9]+/g, '-');
  return slug;
};

export const isValidSlug = (str: string): boolean | string => {
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(str);
};
