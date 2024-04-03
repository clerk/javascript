export const createFlexGapPropertyIosCompat = (val: string) => {
  // Resolve gap property compatibility issue on iOS 13
  // This is not needed for css grid, only for flex
  // TODO: Test whether we need to make the check more generic
  if (navigator?.userAgent?.match(/(iphone|ipad).+os.+13.+safari/i)) {
    return {
      '& > * + *': {
        marginTop: val,
      },
    };
  }
  return { gap: val };
};
