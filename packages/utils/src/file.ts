/**
 * Read an expected JSON type File.
 *
 * Probably paired with:
 *  <input type='file' accept='application/JSON' ... />
 */
export function readJSONFile(file: File): Promise<unknown> {
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
