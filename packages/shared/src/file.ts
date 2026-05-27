/**
 * Read an expected JSON type File.
 *
 * Probably paired with:
 *  <input type='file' accept='application/JSON' ... />
 *
 * Renamed from `readJSONFile` to align naming with the rest of the parse-* helpers.
 */
export function parseJSONFile(file: File): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener('load', function () {
      const result = JSON.parse(reader.result as string);
      resolve(result);
    });

    reader.addEventListener('error', reject);
    reader.readAsText(file);
  });
}

const MimeTypeToExtensionMap = Object.freeze({
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'image/x-icon': 'ico',
  'image/vnd.microsoft.icon': 'ico',
} as const);

export type SupportedMimeType = keyof typeof MimeTypeToExtensionMap;

export type MimeTypeExtension = (typeof MimeTypeToExtensionMap)[SupportedMimeType];

export const extension = (mimeType: SupportedMimeType, fallback?: string): string => {
  return MimeTypeToExtensionMap[mimeType] ?? fallback ?? '';
};
