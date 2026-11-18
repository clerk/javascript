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
  const fileName = file.name.toLowerCase();
  return matchesAccept(file.type, accept, token => fileName.endsWith(token));
}

/**
 * Whether a file of this MIME type could be accepted, judged while it is still
 * being dragged. Browsers hide file names until the drop, so extension tokens
 * and a blank type cannot rule a file out yet.
 */
export function mayAcceptType(type: string, accept: string | undefined): boolean {
  return type === '' || matchesAccept(type, accept, () => true);
}

function matchesAccept(type: string, accept: string | undefined, matchesExtension: (token: string) => boolean) {
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

  const fileType = type.toLowerCase();

  return tokens.some(token => {
    if (token === '*' || token === '*/*') {
      return true;
    }
    if (token.startsWith('.')) {
      return matchesExtension(token);
    }
    if (token.endsWith('/*')) {
      // Wildcard MIME group, e.g. `image/*` matches `image/png`.
      return fileType.startsWith(`${token.slice(0, -1)}`);
    }
    return fileType === token;
  });
}
