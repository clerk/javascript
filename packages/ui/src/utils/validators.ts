export function isValidUrl(val: unknown): val is string {
  if (!val) {
    return false;
  }

  try {
    new URL(val as string);
    return true;
  } catch {
    return false;
  }
}

export function isDataUri(val?: string): val is string {
  if (!isValidUrl(val)) {
    return false;
  }

  return new URL(val).protocol === 'data:';
}

const CLERK_IMAGE_URL_BASES = ['https://img.clerk.com/', 'https://img.clerkstage.dev/', 'https://img.lclclerk.com/'];

export const isClerkImage = (src?: string): boolean => {
  return !!CLERK_IMAGE_URL_BASES.some(base => src?.includes(base));
};
