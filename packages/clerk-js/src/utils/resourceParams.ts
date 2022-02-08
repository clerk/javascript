export function normalizeUnsafeMetadata<
  T extends Record<string, unknown> & {
    unsafe_metadata?: Record<string, unknown>;
  },
>(params: T) {
  const { unsafe_metadata } = { ...params };
  const unsafeMetadataJSON = unsafe_metadata
    ? typeof unsafe_metadata === 'object'
      ? JSON.stringify(unsafe_metadata)
      : unsafe_metadata
    : '';
  return {
    ...params,
    ...(unsafe_metadata ? { unsafe_metadata: unsafeMetadataJSON } : {}),
  };
}
