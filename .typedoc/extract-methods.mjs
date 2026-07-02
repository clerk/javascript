// @ts-check
/**
 * TypeDoc plugin that runs during the markdown render pass. Acts as a marker slicer:
 * `custom-theme.mjs` emits marker-wrapped inline method content and marker-wrapped `## Properties`
 * sections into `output.contents` during its own `MarkdownPageEvent.END` listener. This plugin, which
 * loads after `custom-theme.mjs` and `custom-plugin.mjs`, reads those markers and:
 *
 * - slices method sections out of `output.contents` synchronously (before prettier), and writes them
 *   as raw `methods/<name>.mdx` — matches the pre-refactor behavior where extract-methods bypassed
 *   prettier for method files;
 * - queues a `preWriteAsyncJob` to run **after** typedoc-plugin-markdown's prettier job. Once
 *   `output.contents` is prettier-formatted, extract the Properties body from between its markers
 *   and write it to sibling `properties.mdx` — inheriting prettier's column alignment. Strip the
 *   entire `## Properties` region + markers from the parent page contents.
 *
 * Must load **after** `custom-plugin.mjs` so its `MarkdownPageEvent.END` listener — which applies
 * link replacements to `output.contents` — runs first (link replacements pass through HTML comment
 * markers unchanged).
 *
 * Has zero reflection access: all generation lives in `custom-theme.mjs`.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { MarkdownPageEvent } from 'typedoc-plugin-markdown';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Parse `<!-- clerk:method-start filename="X" -->\n<content>\n<!-- clerk:method-end -->` blocks
 * out of the marker-wrapped methods block that `custom-theme.mjs` appends. Runs before prettier so
 * method content is preserved raw.
 *
 * @param {string} contents
 * @returns {{ filename: string, content: string }[]}
 */
function parseMethodMarkers(contents) {
  /** @type {{ filename: string, content: string }[]} */
  const results = [];
  const re = /<!-- clerk:method-start filename=(?:"([^"]+)"|'([^']+)') -->\n([\s\S]*?)\n<!-- clerk:method-end -->/g;
  let m;
  while ((m = re.exec(contents)) !== null) {
    const filename = m[1] ?? m[2];
    const content = m[3].trimEnd() + '\n';
    results.push({ filename, content });
  }
  return results;
}

/**
 * Strip the appended methods block (everything between `<!-- clerk:methods-block-start -->` and
 * `<!-- clerk:methods-block-end -->`) plus its enclosing blank lines. Leaves a single newline in
 * place so the parent page's trailing whitespace matches the pre-refactor `stripReferenceObjectPropertiesSection`
 * output (which does `.trimEnd() + '\n'`).
 *
 * @param {string} contents
 * @returns {string}
 */
function stripMethodsBlock(contents) {
  return contents.replace(/\n*<!-- clerk:methods-block-start -->[\s\S]*?<!-- clerk:methods-block-end -->\n*/g, '\n');
}

/**
 * Extract the Properties body from between markers. Called AFTER prettier so the returned body
 * is column-aligned, matching pre-refactor behavior where the properties.mdx was sliced from the
 * already-prettified page.
 *
 * @param {string} contents
 * @returns {string | undefined}
 */
function extractPropertiesBetweenMarkers(contents) {
  const m = contents.match(/<!-- clerk:properties-start -->\n?([\s\S]*?)\n?<!-- clerk:properties-end -->/);
  if (!m) return undefined;
  const body = m[1].trim();
  return body.length ? body : undefined;
}

/**
 * Remove the entire `## Properties` region plus its markers, producing output equivalent to the
 * pre-refactor `stripReferenceObjectPropertiesSection` (which did
 * `contents.replace(/\n## Properties\n+[\s\S]*$/, '').trimEnd() + '\n'`).
 *
 * Pages where `## Properties` is the very first line (no leading `\n`) intentionally do NOT get
 * their section stripped — matches pre-refactor behavior. In that case we still remove the wrapper
 * markers themselves so they don't leak into the final MDX.
 *
 * @param {string} contents
 * @returns {string}
 */
function stripPropertiesSectionWithMarkers(contents) {
  if (!contents.includes('<!-- clerk:properties-start -->')) {
    return contents;
  }
  // Case 1: leading `\n## Properties` — strip the entire section (heading + markers + body) and
  // any trailing content, then re-add a single trailing newline. Mirrors the pre-refactor regex.
  if (/\n## Properties\n+<!-- clerk:properties-start -->/.test(contents)) {
    const stripped = contents.replace(
      /\n## Properties\n+<!-- clerk:properties-start -->[\s\S]*?<!-- clerk:properties-end -->[\s\S]*$/,
      '',
    );
    return stripped.trimEnd() + '\n';
  }
  // Case 2: `## Properties` at start-of-file (billing-namespace pattern). Pre-refactor left the
  // section in place. Strip just the marker comments plus any adjacent blank lines prettier may
  // have inserted around them.
  return contents
    .replace(/<!-- clerk:properties-start -->\n+/g, '')
    .replace(/\n+<!-- clerk:properties-end -->\n*/g, '\n');
}

/**
 * Plugin entry: registers a `MarkdownPageEvent.END` listener that slices method markers
 * synchronously (pre-prettier) then defers Properties extraction / marker stripping until after
 * prettier via `preWriteAsyncJobs`.
 *
 * @param {import('typedoc-plugin-markdown').MarkdownApplication} app
 */
export function load(app) {
  // Priority -200: fire after `custom-theme.mjs`'s emit listener (registered at -100), which in
  // turn fires after `custom-plugin.mjs`'s link replacements (default priority 0). By the time
  // this slicer runs, marker-wrapped inline methods have been appended and the Properties section
  // has been wrapped — and no other END listener will touch our contents after us.
  app.renderer.on(
    MarkdownPageEvent.END,
    output => {
      const contents = output.contents ?? '';
      const hasMethodsBlock = contents.includes('<!-- clerk:methods-block-start -->');
      const hasPropertiesMarkers = contents.includes('<!-- clerk:properties-start -->');
      if (!hasMethodsBlock && !hasPropertiesMarkers) {
        return;
      }

      // Slice method sections BEFORE prettier — content already went through link replacements
      // inside `buildMethodMdx` (in `custom-theme.mjs`) and must be preserved raw (matching the
      // pre-refactor behavior where methods bypassed prettier). Immediately strip the methods
      // block so prettier doesn't process it.
      const methods = hasMethodsBlock ? parseMethodMarkers(contents) : [];
      if (hasMethodsBlock) {
        output.contents = stripMethodsBlock(contents);
      }

      const pageUrl = output.url ?? '(unknown)';
      const objectDir = path.dirname(output.filename);
      const methodsDir = path.join(objectDir, 'methods');

      output.preWriteAsyncJobs.push(() => {
        const post = output.contents ?? '';

        // Extract the (now prettier-formatted) Properties body from between its markers, write it
        // out, then strip the whole `## Properties` region (heading + markers + body) from the
        // parent page.
        const propertiesBody = extractPropertiesBetweenMarkers(post);
        if (propertiesBody) {
          fs.mkdirSync(objectDir, { recursive: true });
          const propertiesPath = path.join(objectDir, 'properties.mdx');
          fs.writeFileSync(propertiesPath, `${propertiesBody.trimEnd()}\n`, 'utf-8');
          console.log(`[extract-methods] Wrote ${path.relative(path.join(__dirname, '..'), propertiesPath)}`);
        }
        output.contents = stripPropertiesSectionWithMarkers(post);

        if (methods.length === 0) {
          return;
        }
        fs.mkdirSync(methodsDir, { recursive: true });
        for (const { filename, content } of methods) {
          const filePath = path.join(methodsDir, filename);
          fs.writeFileSync(filePath, content, 'utf-8');
          console.log(`[extract-methods] Wrote ${path.relative(path.join(__dirname, '..'), filePath)}`);
        }
        console.log(`[extract-methods] ${pageUrl}: wrote ${methods.length} method file(s)`);
      });
    },
    -200,
  );
}
