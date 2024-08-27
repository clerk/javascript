export const createSupportedFlexGapProperty = (val: string, dir: 'col' | 'row') => {
  if (navigator?.userAgent?.match(/(iphone|ipad).+(os).*(\s13).+safari/i)) {
    return {
      '& > *:not([hidden]):not([style*="visibility: hidden"]) + *:not([hidden]):not([style*="visibility: hidden"])': {
        marginLeft: dir === 'row' ? val : undefined,
        marginTop: dir === 'col' ? val : undefined,
      },
    };
  }
  return { gap: val };
};
