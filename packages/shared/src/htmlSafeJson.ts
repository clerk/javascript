// `<`, `>`, `/` (to neutralize `</script>` breakouts) plus the U+2028/U+2029 line
// terminators, which are valid in JSON strings but break executable script contexts.
const ESCAPE_REGEX = /[<>/\u2028\u2029]/g;

/**
 * `JSON.stringify` that is safe to embed directly inside an HTML `<script>` element.
 *
 * `JSON.stringify` leaves `<`, `>` and `/` untouched, so a `</script>` substring in any
 * string value would break out of the surrounding script block (XSS). Escaping those
 * characters to their `\uXXXX` forms keeps the value byte-identical after `JSON.parse`
 * while preventing the HTML parser from terminating the element early.
 */
export function htmlSafeJson(value: unknown): string {
  const json = JSON.stringify(value);
  if (json === undefined) {
    return 'undefined';
  }
  return json.replace(ESCAPE_REGEX, ch => `\\u${ch.charCodeAt(0).toString(16).padStart(4, '0')}`);
}
