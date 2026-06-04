// @ts-check — JSDoc-typed plugin helpers.
/**
 * Small markdown utilities. These are inlined from `typedoc-plugin-markdown`'s
 * internal `dist/libs/markdown/` and `dist/libs/utils/` modules — the plugin's
 * public API doesn't re-export them, and reaching into `dist/` directly breaks
 * when the dependency updates.
 *
 * Keep these byte-equivalent to the upstream behavior so generated markdown
 * stays consistent with what typedoc-plugin-markdown produces.
 *
 * @see https://github.com/typedoc2md/typedoc-plugin-markdown/blob/main/packages/typedoc-plugin-markdown/src/libs/markdown/
 * @see https://github.com/typedoc2md/typedoc-plugin-markdown/blob/main/packages/typedoc-plugin-markdown/src/libs/utils/
 */

/**
 * Escape characters with special meaning in MDX so they render literally.
 *
 * @param {string} str
 */
export function escapeChars(str) {
  return str
    .replace(/>/g, '\\>')
    .replace(/</g, '\\<')
    .replace(/{/g, '\\{')
    .replace(/}/g, '\\}')
    .replace(/_/g, '\\_')
    .replace(/`/g, '\\`')
    .replace(/\|/g, '\\|')
    .replace(/\[/g, '\\[')
    .replace(/\]/g, '\\]')
    .replace(/\*/g, '\\*');
}

/**
 * Wraps a string in backticks. If the input contains pipes or backslashes (which
 * break inside markdown tables) the entire string is escaped instead. If it
 * already contains a backtick, wraps in double backticks.
 *
 * @param {string} text
 */
export function backTicks(text) {
  if (/(\||\\)/g.test(text)) {
    return escapeChars(text);
  }
  if (/`/g.test(text)) {
    return `\`\` ${text} \`\``;
  }
  return `\`${text}\``;
}

/**
 * Markdown ATX heading with the given level (capped at 6).
 *
 * @param {number} level
 * @param {string} text
 */
export function heading(level, text) {
  const l = level > 6 ? 6 : level;
  return `${'#'.repeat(l)} ${text}`;
}

/**
 * Collapse newlines and excess whitespace so a string is safe to use as a
 * single markdown table cell.
 *
 * @param {string} str
 */
export function removeLineBreaks(str) {
  return str?.replace(/\r?\n/g, ' ').replace(/ {2,}/g, ' ');
}

/**
 * Sanitize a markdown table cell: flatten newlines, unwrap any fenced code
 * block into inline backticks, and collapse runs of spaces.
 *
 * @param {string} str
 */
function formatTableCell(str) {
  return str
    .replace(/\r?\n/g, ' ')
    .replace(/```(\w+\s)?([\s\S]*?)```/gs, (_match, _lang, body) => `\`${body.trim()}\``)
    .replace(/ +/g, ' ')
    .trim();
}

/**
 * Render a markdown pipe-table.
 *
 * @param {string[]} headers
 * @param {string[][]} rows
 * @param {boolean} [headerLeftAlign]
 */
export function table(headers, rows, headerLeftAlign = false) {
  const sep = headers.map(() => `${headerLeftAlign ? ':' : ''}------`).join(' | ');
  const body = rows.map(row => `| ${row.map(cell => formatTableCell(cell)).join(' | ')} |\n`).join('');
  return `\n| ${headers.join(' | ')} |\n| ${sep} |\n${body}`;
}

/**
 * Render an HTML `<table>` (used when MDX needs richer cell content than the
 * pipe-table syntax can express).
 *
 * @param {string[]} headers
 * @param {string[][]} rows
 * @param {boolean} [leftAlignHeadings]
 */
export function htmlTable(headers, rows, leftAlignHeadings = false) {
  const align = leftAlignHeadings ? ' align="left"' : '';
  const head = headers.map(h => `\n<th${align}>${h}</th>`).join('');
  const body = rows
    .map(row => {
      const cells = row.map(cell => `\n<td>\n\n${cell === '-' ? '&hyphen;' : cell}\n\n</td>`).join('');
      return `\n<tr>${cells}\n</tr>`;
    })
    .join('');
  return `<table>\n<thead>\n<tr>${head}\n</tr>\n</thead>\n<tbody>${body}\n</tbody>\n</table>`;
}
