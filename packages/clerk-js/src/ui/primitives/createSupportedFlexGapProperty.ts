/**
 * @supports selector() was released roughly at the same point as flexbox gap,
 * so we use that to check support since flexbox gap check is not supported.
 * @see https://birdsong.dev/blog/sloppy-supports-for-flexbox-gap/
 */
export const createSupportedFlexGapProperty = (val: string, dir: 'col' | 'row') => {
  return {
    '@supports selector(:first-child)': {
      gap: val,
    },
    '@supports not selector(:first-child)': {
      '& > *:not([hidden]):not([style*="visibility: hidden"]) + *:not([hidden]):not([style*="visibility: hidden"])': {
        marginLeft: dir === 'row' ? val : undefined,
        marginTop: dir === 'col' ? val : undefined,
      },
    },
  };
};
