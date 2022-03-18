export function normalizeUnsafeMetadata<
  T extends Record<string, unknown> & {
    unsafeMetadata?: Record<string, unknown>;
  },
>(params: T) {
  const { unsafeMetadata } = { ...params };
  const unsafeMetadataJSON = unsafeMetadata
    ? typeof unsafeMetadata === 'object'
      ? JSON.stringify(unsafeMetadata)
      : unsafeMetadata
    : '';
  return {
    ...params,
    ...(unsafeMetadata ? { unsafeMetadata: unsafeMetadataJSON } : {}),
  };
}
