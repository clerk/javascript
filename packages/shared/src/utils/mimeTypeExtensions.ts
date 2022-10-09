const MimeTypeToExtensionMap = Object.freeze({
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'image/x-icon': 'ico',
  'image/vnd.microsoft.icon': 'ico',
} as const);

export type SupportedMimeType = keyof typeof MimeTypeToExtensionMap;

export const extension = (mimeType: SupportedMimeType): string => {
  return MimeTypeToExtensionMap[mimeType];
};
