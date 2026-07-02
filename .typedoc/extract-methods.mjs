// @ts-check
/**
 * TypeDoc plugin that runs during the markdown render pass. Acts as a text slicer for the
 * parent-page shape that `custom-theme.mjs` produces:
 *
 * - Synchronously (before prettier) slices `## `methodName()`` and `## `namespace`` H2 sections
 *   from the parent's `output.contents` and reshapes each into `methods/<slug>.mdx`. The parent's
 *   sections stay in place — the slicer only reads.
 * - Queues a `preWriteAsyncJob` to run **after** typedoc-plugin-markdown's prettier job. Once
 *   `output.contents` is prettier-formatted, extract the Properties body from between the
 *   `<!-- clerk:properties-start/end -->` markers that `custom-theme.mjs` wraps around `##
 *   Properties`, and write it to sibling `properties.mdx` — inheriting prettier's column
 *   alignment. Strip the entire `## Properties` region + markers from the parent page contents.
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

import { BACKEND_API_CONFIG, REFERENCE_OBJECT_CONFIG } from './reference-objects.mjs';
import { toFileSlug } from './slug.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Parse a parent-page `## `methodName()`` H2 section into its logical parts. Handles both natural
 * typedoc-plugin-markdown sections (backend classes) and synthesized aggregator sections (shared
 * interfaces, extraMethodInterfaces).
 *
 * Expected shape (mixture across natural/synthesized — reshape logic tolerates either):
 *
 *     ## `name()`
 *     <description prose, possibly multi-paragraph>
 *     ```typescript
 *     function name(...)
 *     ```
 *     ### `TypeName` (nominal single-arg) OR ### Parameters
 *     <table body>
 *     ### Returns
 *     `Type` — <text>          (or just `Type` with no ` — `)
 *
 * @param {string} section
 */
function parseParentAggregatorSection(section) {
  const lines = section.split('\n');
  // Method titles are either bare (`## methodName()`) or qualified (`## `emailCode.sendCode()``).
  // Qualified names use `.` as separator (from `@extractMethods` namespaces).
  const titleMatch = lines[0]?.match(/^## `?([A-Za-z_$][A-Za-z0-9_$.]*)`?\(\)`?/);
  const name = titleMatch?.[1] ?? '';

  const sigStart = lines.findIndex((l, i) => i > 0 && l.startsWith('```typescript'));
  const sigEnd = sigStart === -1 ? -1 : lines.findIndex((l, i) => i > sigStart && l === '```');

  const descBeforeSig = sigStart === -1 ? lines.length : sigStart;
  const descLines = lines.slice(1, descBeforeSig);
  trimBlankBoundariesInPlace(descLines);
  const description = descLines.join('\n');

  const signature = sigStart !== -1 && sigEnd !== -1 ? lines.slice(sigStart, sigEnd + 1).join('\n') : '';

  const afterSig = sigEnd === -1 ? 1 + descBeforeSig : sigEnd + 1;
  const returnsIdx = lines.findIndex((l, i) => i >= afterSig && /^### Returns\b/.test(l));
  const searchEnd = returnsIdx === -1 ? lines.length : returnsIdx;
  const paramsIdx = lines.findIndex(
    (l, i) => i >= afterSig && i < searchEnd && /^### /.test(l) && !/^### Returns\b/.test(l),
  );

  let paramsHeadingLine = '';
  let paramsBody = '';
  if (paramsIdx !== -1) {
    paramsHeadingLine = lines[paramsIdx];
    const paramsBodyLines = lines.slice(paramsIdx + 1, searchEnd);
    trimBlankBoundariesInPlace(paramsBodyLines);
    paramsBody = paramsBodyLines.join('\n');
  }

  let returnsBody = '';
  if (returnsIdx !== -1) {
    const returnsLines = lines.slice(returnsIdx + 1);
    trimBlankBoundariesInPlace(returnsLines);
    returnsBody = returnsLines.join('\n');
  }

  return { name, description, signature, paramsHeadingLine, paramsBody, returnsBody };
}

/** @param {string[]} arr */
function trimBlankBoundariesInPlace(arr) {
  while (arr.length && arr[0].trim() === '') arr.shift();
  while (arr.length && arr[arr.length - 1].trim() === '') arr.pop();
}

/**
 * Take the `### Returns` body and produce the extracted-file `Returns <lowercased description>.`
 * prose that `buildMethodMdx` writes in via `formatReturnsLineFromTag(@returns)`. Two shapes are
 * possible depending on the theme's `signatureReturns` partial:
 *
 * - Condensed: `` `Type` — <description> `` — single line with em-dash separator. Description can
 *   extend across multiple lines (embedded `> [!WARNING]` callouts from `@returns` source).
 * - Uncondensed: `` `Type`\n\n<description> `` — default typedoc-plugin-markdown format when the
 *   theme's condense heuristic doesn't apply (typically when the return type prints on multiple
 *   lines, e.g. object literals).
 *
 * Empty string when the returns body only shows a type (no `@returns` text) — matches
 * `buildMethodMdx` which only emits `Returns …` when `@returns` tag content is present.
 *
 * @param {string} returnsBody
 */
function extractReturnsProseFromReturnsBody(returnsBody) {
  if (!returnsBody) return '';
  const dashIdx = returnsBody.indexOf(' — ');
  let rightSide = '';
  if (dashIdx !== -1) {
    rightSide = returnsBody.slice(dashIdx + 3);
  } else {
    const paragraphs = returnsBody.split('\n\n');
    if (paragraphs.length >= 2) {
      rightSide = paragraphs.slice(1).join('\n\n');
    }
  }
  if (!rightSide) return '';
  // Strip leading `- ` or `* ` prefix (source `@returns - foo` renders with a leading dash) and
  // lowercase the first character — matches custom-theme's `formatReturnsLineFromTag` /
  // `normalizeReturnsBody`.
  const normalized = rightSide.replace(/^\s*[-*]\s+/, '').trim();
  return `Returns ${normalized.charAt(0).toLowerCase()}${normalized.slice(1)}`;
}

/**
 * Reshape a parent-page property-table H2 section into the sub-doc shape produced by the
 * marker-block path (`buildExtractMethodsNamespacePropertyTableMdx` /
 * `buildPropertyTableDocMdx`). The parent's `## `name`` heading is demoted to `### `name``;
 * everything after the heading (description + table body) is preserved verbatim so whitespace
 * matches the marker-block output byte-for-byte.
 *
 * @param {string} section - full section text as returned by {@link findMethodH2Sections}
 * @returns {string}
 */
function reshapeAggregatorPropertyTableSectionToExtractedFile(section) {
  const nlIdx = section.indexOf('\n');
  if (nlIdx === -1) return `${section.replace(/^## /, '### ').trimEnd()}\n`;
  const rest = section.slice(nlIdx + 1);
  const demotedTitle = section.slice(0, nlIdx).replace(/^## /, '### ');
  return `${demotedTitle}\n${rest.trimEnd()}\n`;
}

/**
 * Reshape a parent-page `## `name()`` H2 section into the per-method extracted-file shape produced
 * by `buildMethodMdx` (which the marker-block path historically wrote). The output is intended to
 * be byte-identical to the marker-block output so we can drop the marker block emission entirely.
 *
 * - **`reference` format** (shared reference-object pages): keeps an `### `name()`` H3 title.
 *   Params heading is demoted to H4 (`#### `TypeName`` or `#### Parameters`).
 * - **`page` format** (backend API pages, one method per docs page): no title. Params heading
 *   is promoted to H2 (`## `TypeName`` or `## Parameters`).
 *
 * Params heading is always followed by `\n\n` (blank line + blank line, i.e. `\n\n\n`) before the
 * table body — matches the buildMethodMdx output. Every consecutive chunk is separated by a
 * single blank line.
 *
 * @param {ReturnType<typeof parseParentAggregatorSection>} parts
 * @param {'reference' | 'page'} methodFormat
 * @returns {string}
 */
function reshapeAggregatorSectionToExtractedFile(parts, methodFormat) {
  const returnsProse = extractReturnsProseFromReturnsBody(parts.returnsBody);
  const descriptionWithReturns = returnsProse
    ? parts.description
      ? `${parts.description}\n\n${returnsProse}`
      : returnsProse
    : parts.description;

  let outputParamsHeading = '';
  if (parts.paramsHeadingLine) {
    outputParamsHeading =
      methodFormat === 'reference'
        ? parts.paramsHeadingLine.replace(/^### /, '#### ')
        : parts.paramsHeadingLine.replace(/^### /, '## ');
  }

  /** @type {string[]} */
  const chunks = [];
  if (methodFormat === 'reference') chunks.push(`### \`${parts.name}()\``);
  if (descriptionWithReturns) chunks.push(descriptionWithReturns);
  if (parts.signature) chunks.push(parts.signature);
  if (outputParamsHeading && parts.paramsBody) {
    // Match buildMethodMdx: params heading is followed by a blank + blank before the table body.
    chunks.push(`${outputParamsHeading}\n\n\n${parts.paramsBody}`);
  } else if (outputParamsHeading) {
    chunks.push(outputParamsHeading);
  }
  return chunks.join('\n\n').trim() + '\n';
}

/**
 * Iterate `## `name()`` (method) and `## `name`` (property-table) H2 sections in the parent
 * contents, returning each as `{ name, section, shape }` in document order. Sections extend from
 * a `## ` heading until the next `## ` heading or end-of-file. Skips `## Properties` and any
 * other H2s that aren't identifier-shaped headings (e.g. `## Overview`).
 *
 * A section is classified `propertyTable` when its title has no `()` — matches what
 * `renderAggregatorPropertyTableSection` emits for `@extractMethods` namespace and non-callable
 * object-shape members.
 *
 * @param {string} contents
 * @returns {{ name: string, section: string, shape: 'method' | 'propertyTable' }[]}
 */
function findMethodH2Sections(contents) {
  if (!contents) return [];
  const lines = contents.split('\n');
  /** @type {{ start: number, name: string, shape: 'method' | 'propertyTable' }[]} */
  const starts = [];
  for (let i = 0; i < lines.length; i++) {
    const method = lines[i].match(/^## `?([A-Za-z_$][A-Za-z0-9_$.]*)`?\(\)`?[ \t]*$/);
    if (method) {
      starts.push({ start: i, name: method[1], shape: 'method' });
      continue;
    }
    const propTable = lines[i].match(/^## `([A-Za-z_$][A-Za-z0-9_$.]*)`[ \t]*$/);
    if (propTable) {
      starts.push({ start: i, name: propTable[1], shape: 'propertyTable' });
    }
  }
  /** @type {{ name: string, section: string, shape: 'method' | 'propertyTable' }[]} */
  const out = [];
  for (let i = 0; i < starts.length; i++) {
    const startLine = starts[i].start;
    const nextInList = i + 1 < starts.length ? starts[i + 1].start : -1;
    // Also stop at any other `## ` H2 that isn't in our list (e.g. `## Properties`).
    let endLine = lines.length;
    for (let j = startLine + 1; j < lines.length; j++) {
      if (lines[j].startsWith('## ')) {
        endLine = j;
        break;
      }
    }
    if (nextInList !== -1 && nextInList < endLine) endLine = nextInList;
    // Trim trailing separator lines like `***` typedoc places between natural sections.
    let sectionLines = lines.slice(startLine, endLine);
    while (sectionLines.length && /^(\s|\*+\s*)*$/.test(sectionLines[sectionLines.length - 1])) sectionLines.pop();
    out.push({ name: starts[i].name, section: sectionLines.join('\n'), shape: starts[i].shape });
  }
  return out;
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
 * Plugin entry: registers a `MarkdownPageEvent.END` listener that text-slices per-H2 sections
 * from the parent contents synchronously (pre-prettier), then defers Properties extraction /
 * marker stripping until after prettier via `preWriteAsyncJobs`.
 *
 * @param {import('typedoc-plugin-markdown').MarkdownApplication} app
 */
export function load(app) {
  // Priority -200: fire after `custom-theme.mjs`'s emit listener (registered at -100), which in
  // turn fires after `custom-plugin.mjs`'s link replacements (default priority 0). By the time
  // this slicer runs, aggregator sections have been synthesized and the Properties section has
  // been wrapped — and no other END listener will touch our contents after us.
  app.renderer.on(
    MarkdownPageEvent.END,
    output => {
      const contents = output.contents ?? '';
      const normUrl = (output.url ?? '').replace(/\\/g, '/');
      const pageUrl = output.url ?? '(unknown)';
      const objectDir = path.dirname(output.filename);
      const methodsDir = path.join(objectDir, 'methods');

      // Slice `## `methodName()`` and `## `namespace`` H2 sections from the parent's pre-prettier
      // content and reshape into per-method / per-property-table extracted files. Handles every
      // callable member (including `@extractMethods` namespace callables emitted with qualified
      // names) and every `@extractMethods` namespace / non-callable-with-object-shape property.
      const methodFormat =
        normUrl in REFERENCE_OBJECT_CONFIG ? 'reference' : normUrl in BACKEND_API_CONFIG ? 'page' : undefined;
      if (methodFormat) {
        const h2Sections = findMethodH2Sections(contents);
        if (h2Sections.length) {
          fs.mkdirSync(methodsDir, { recursive: true });
          for (const { name, section, shape } of h2Sections) {
            const extracted =
              shape === 'propertyTable'
                ? reshapeAggregatorPropertyTableSectionToExtractedFile(section)
                : reshapeAggregatorSectionToExtractedFile(parseParentAggregatorSection(section), methodFormat);
            const filename = `${name.split('.').map(toFileSlug).join('-')}.mdx`;
            fs.writeFileSync(path.join(methodsDir, filename), extracted, 'utf-8');
          }
          console.log(`[extract-methods] ${pageUrl}: text-slice wrote ${h2Sections.length} method file(s)`);
        }
      }

      if (!contents.includes('<!-- clerk:properties-start -->')) {
        return;
      }

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
      });
    },
    -200,
  );
}
