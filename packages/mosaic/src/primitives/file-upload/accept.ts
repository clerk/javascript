/**
 * Matches a file against an `accept` string using the same grammar as the
 * native `<input type="file" accept>` attribute: a comma-separated list of
 * file extensions (`.png`), exact MIME types (`image/png`), and wildcard MIME
 * groups (`image/*`). A missing or empty `accept` accepts everything.
 *
 * The native file picker already enforces `accept`, but drag-and-drop bypasses
 * it, so the Dropzone re-validates dropped files with this helper.
 */
export function isFileAccepted(file: File, accept: string | undefined): boolean {
  if (!accept) {
    return true;
  }

  const tokens = accept
    .split(',')
    .map(token => token.trim().toLowerCase())
    .filter(Boolean);

  if (tokens.length === 0) {
    return true;
  }

  const fileType = file.type.toLowerCase();
  const fileName = file.name.toLowerCase();

  return tokens.some(token => {
    if (token === '*' || token === '*/*') {
      return true;
    }
    if (token.startsWith('.')) {
      return fileName.endsWith(token);
    }
    if (token.endsWith('/*')) {
      // Wildcard MIME group, e.g. `image/*` matches `image/png`.
      return fileType.startsWith(`${token.slice(0, -1)}`);
    }
    return fileType === token;
  });
}
