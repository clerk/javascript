/**
 * Read an expected JSON type File.
 *
 * Probably paired with:
 *  <input type='file' accept='application/JSON' ... />
 */
export async function readJSONFile(file: File): Promise<unknown> {
  const text = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener('load', function () {
      resolve(reader.result as string);
    });

    reader.addEventListener('error', reject);
    reader.readAsText(file);
  });

  // Parsed here rather than in the load listener, where a throw never reaches
  // the promise and leaves it pending.
  return JSON.parse(text);
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

export const extension = (mimeType: SupportedMimeType): string => {
  return MimeTypeToExtensionMap[mimeType];
};
