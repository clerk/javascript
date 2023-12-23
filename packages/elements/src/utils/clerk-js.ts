// Pulled from `clerk-js/src/ui/utils/fromEntries.ts
export const fromEntries = (iterable: Iterable<any>) => {
  return [...iterable].reduce((obj, [key, val]) => {
    obj[key] = val;
    return obj;
  }, {});
};

/**
 * Returns the URL for a static SVG image
 * using the new img.clerk.com service
 *
 * Pulled from `clerk-js/src/ui/common/constants.ts`
 */
export function iconImageUrl(id: string): string {
  return `https://img.clerk.com/static/${id}.svg`;
}
