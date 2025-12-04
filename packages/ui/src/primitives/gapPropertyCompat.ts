export const createFlexGapPropertyIosCompat = (val: string, dir: 'col' | 'row') => {
  // Resolve gap property compatibility issue on iOS 13
  // This is not needed for css grid, only for flex
  if (navigator?.userAgent?.match(/(iphone|ipad).+(os).*(\s13_).+safari/i)) {
    return {
      '& > *:not([hidden]):not([style*="visibility: hidden"]) + *:not([hidden]):not([style*="visibility: hidden"])': {
        marginLeft: dir === 'row' ? val : undefined,
        marginTop: dir === 'col' ? val : undefined,
      },
    };
  }
  return { gap: val };
};
