export const createSlug = (str: string): string => {
  const trimmedStr = str.trim().toLowerCase();
  const slug = trimmedStr.replace(/[^a-z0-9]+/g, '-');
  return slug;
};
