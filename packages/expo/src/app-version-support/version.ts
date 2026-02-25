const APP_VERSION_REGEX = /^\d+(\.\d+)*$/;

export const isValidAppVersion = (value: string): boolean => APP_VERSION_REGEX.test(value);

export const compareAppVersions = (left: string, right: string): number => {
  const leftSegments = left.split('.').map(segment => Number.parseInt(segment, 10));
  const rightSegments = right.split('.').map(segment => Number.parseInt(segment, 10));
  const maxLength = Math.max(leftSegments.length, rightSegments.length);

  for (let index = 0; index < maxLength; index += 1) {
    const leftSegment = leftSegments[index] ?? 0;
    const rightSegment = rightSegments[index] ?? 0;

    if (leftSegment > rightSegment) {
      return 1;
    }

    if (leftSegment < rightSegment) {
      return -1;
    }
  }

  return 0;
};
