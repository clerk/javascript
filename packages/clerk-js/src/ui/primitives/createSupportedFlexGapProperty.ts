export const createSupportedFlexGapProperty = (val: string, dir: 'col' | 'row') => {
  return {
    '@supports (gap: 1rem)': {
      gap: val,
    },
    '@supports not (gap: 1rem)': {
      '& > *:not([hidden]):not([style*="visibility: hidden"]) + *:not([hidden]):not([style*="visibility: hidden"])': {
        marginLeft: dir === 'row' ? val : undefined,
        marginTop: dir === 'col' ? val : undefined,
      },
    },
  };
};
