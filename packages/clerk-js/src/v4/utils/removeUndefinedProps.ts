export const removeUndefinedProps = (obj: Record<string, unknown>) => {
  Object.keys(obj).forEach(key => obj[key] === undefined && delete obj[key]);
  return obj;
};
