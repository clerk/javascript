// Pulled from `clerk-js/src/ui/utils/fromEntries.ts
export const fromEntries = (iterable: Iterable<any>) => {
  return [...iterable].reduce((obj, [key, val]) => {
    obj[key] = val;
    return obj;
  }, {});
};
