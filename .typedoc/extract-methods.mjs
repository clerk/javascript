// @ts-check
/**
 * For each entry in REFERENCE_OBJECTS_LIST, reads the TypeDoc output (e.g. `shared/clerk/clerk.mdx`), strips **Properties** from the main generated file and copies it into `properties.mdx`, and writes one .mdx per method under `methods/` (alongside the main page in that resource folder).
 *
 * Run after `typedoc` (same cwd as repo root). Uses a second TypeDoc convert pass to read reflections.
 *
 * Like `extract-returns-and-params.mjs`, parameter tables are not hand-built: they use the same
 * `MarkdownThemeContext.partials` as TypeDoc markdown output (`parametersTable` / `propertiesTable`, which call
 * `someType` and therefore pick up `custom-theme.mjs` union/`&lt;code&gt;` behavior). Router + theme are prepared
 * via `prepare-markdown-renderer.mjs` (same idea as `typedoc-plugin-markdown` `render()`).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  Application,
  Comment,
  IntersectionType,
  OptionalType,
  PageKind,
  ReferenceType,
  ReflectionKind,
  ReflectionType,
  UnionType,
} from 'typedoc';
import { MarkdownPageEvent, MarkdownTheme } from 'typedoc-plugin-markdown';
import { removeLineBreaks } from '../node_modules/typedoc-plugin-markdown/dist/libs/utils/index.js';

import typedocConfig from '../typedoc.config.mjs';
import { isCallableInterfaceProperty } from './custom-theme.mjs';
import {
  applyCatchAllMdReplacements,
  applyRelativeLinkReplacements,
  stripReferenceObjectPropertiesSection,
} from './custom-plugin.mjs';
import { prepareMarkdownRenderer } from './prepare-markdown-renderer.mjs';
import { REFERENCE_OBJECTS_LIST, REFERENCE_OBJECT_CONFIG } from './reference-objects.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * @param {number} level
 * @param {string} text
 */
function markdownHeading(level, text) {
  const l = Math.min(Math.max(level, 1), 6);
  return `${'#'.repeat(l)} ${text}`;
}

/**
 * Same as typedoc-plugin-markdown `removeLineBreaks` for table cells.
 *
 * @param {string | undefined} str
 */
function removeLineBreaksForTableCell(str) {
  return str?.replace(/\r?\n/g, ' ').replace(/ {2,}/g, ' ');
}

/**
 * Append data rows to a markdown table string (header + separator + rows).
 *
 * @param {string} tableMd
 * @param {string[]} rowLines Lines like `| a | b | c |`
 */
function appendMarkdownTableRows(tableMd, rowLines) {
  if (!rowLines.length) {
    return tableMd;
  }
  return `${tableMd.trimEnd()}\n${rowLines.join('\n')}\n`;
}

/**
 * Post-process the theme’s parameters markdown table. TypeDoc flattens object params as `parent.child` and may interleave those rows with other parameters. Here we (1) move each `parent.*` block directly under `parent`, and (2) rewrite dotted paths in the name column to optional-chaining (`parent?.child`, `a?.b?.c`). Top-level names are unchanged (`foo?`, `exa`).
 *
 * @param {string} tableMd
 */
function formatMethodParametersTable(tableMd) {
  const leadingNewlines = (tableMd.match(/^\n+/) ?? [''])[0];
  const nonEmpty = tableMd.split('\n').filter(l => l.trim().length);
  if (nonEmpty.length < 3) {
    return tableMd;
  }
  const header = nonEmpty[0];
  const sep = nonEmpty[1];
  const dataLines = nonEmpty.slice(2).filter(l => l.trim().startsWith('|'));
  if (dataLines.length <= 1) {
    return tableMd;
  }

  /** @param {string} line */
  const firstName = line => {
    const m = line.match(/^\|\s*(?:<a\s+id="[^"]*"\s*><\/a>\s*)?`([^`]+)`/);
    return m ? m[1] : '';
  };
  /** `parent.child` / `parent?.child` → grouping key `parent` (matches top-level `parent` or `parent?` via fallback below). */
  /** @param {string} raw */
  const parentOfNested = raw => {
    const j = raw.indexOf('?.');
    if (j !== -1) {
      return raw.slice(0, j);
    }
    const i = raw.indexOf('.');
    return i === -1 ? '' : raw.slice(0, i);
  };
  /** `a.b.c` → `a?.b?.c`; leave `foo?` and names without `.` alone. */
  /** @param {string} raw */
  const nameForDisplay = raw => (!raw.includes('.') || raw.includes('?.') ? raw : raw.split('.').join('?.'));
  /** @param {string} line @param {string} name */
  const replaceFirstName = (line, name) =>
    line.replace(/^(\|\s*(?:<a\s+id="[^"]*"\s*><\/a>\s*)?)`[^`]+`/, `$1\`${name}\``);

  const topLevelOrder = [];
  const seenTop = new Set();
  /** @type {Map<string, string[]>} */
  const childrenOf = new Map();

  for (const line of dataLines) {
    const raw = firstName(line);
    if (!raw) {
      continue;
    }
    if (!raw.includes('.')) {
      if (!seenTop.has(raw)) {
        seenTop.add(raw);
        topLevelOrder.push(raw);
      }
      continue;
    }
    const p = parentOfNested(raw);
    if (!p) {
      continue;
    }
    let bucket = childrenOf.get(p);
    if (!bucket) {
      bucket = [];
      childrenOf.set(p, bucket);
    }
    bucket.push(line);
  }

  for (const lines of childrenOf.values()) {
    lines.sort((a, b) => firstName(a).localeCompare(firstName(b)));
  }

  /** @param {string} top */
  const rowsForParent = top =>
    childrenOf.get(top) ?? (top.endsWith('?') ? childrenOf.get(top.slice(0, -1)) : undefined);

  const body = [];
  const emitted = new Set();

  for (const top of topLevelOrder) {
    const topLine = dataLines.find(l => firstName(l) === top);
    if (topLine) {
      const r = firstName(topLine);
      body.push(replaceFirstName(topLine, nameForDisplay(r)));
      emitted.add(topLine);
    }
    const kids = rowsForParent(top);
    if (kids) {
      for (const line of kids) {
        body.push(replaceFirstName(line, nameForDisplay(firstName(line))));
        emitted.add(line);
      }
    }
  }

  for (const line of dataLines) {
    if (!emitted.has(line)) {
      const r = firstName(line);
      body.push(r ? replaceFirstName(line, nameForDisplay(r)) : line);
    }
  }

  return `${leadingNewlines}${[header, sep, ...body].join('\n')}\n`;
}

/**
 * @param {import('typedoc').Application} app
 * @param {import('typedoc').ProjectReflection} project
 * @param {string} pageUrl e.g. `shared/clerk/index.mdx`
 * @param {import('typedoc').DeclarationReflection} interfaceDecl
 */
function createThemeContextForReferencePage(app, project, pageUrl, interfaceDecl) {
  const page = new MarkdownPageEvent(interfaceDecl);
  page.url = pageUrl;
  page.filename = path.join(app.options.getValue('out') ?? '', pageUrl);
  page.pageKind = PageKind.Reflection;
  page.project = project;
  const theme = /** @type {InstanceType<typeof MarkdownTheme> | undefined} */ (app.renderer.theme);
  if (!theme || typeof theme.getRenderContext !== 'function') {
    throw new Error('[extract-methods] Renderer theme is not ready; call prepareMarkdownRenderer(app) after convert');
  }
  return /** @type {import('typedoc-plugin-markdown').MarkdownThemeContext} */ (theme.getRenderContext(page));
}

/**
 * TypeDoc `code` display parts often already include backticks (same as {@link Comment.combineDisplayParts}).
 * Wrapping again would produce `` `Client` `` in MDX.
 *
 * @param {string} text
 */
function codeDisplayPartToMarkdown(text) {
  const trimmed = text.trim();
  if (trimmed.length >= 2 && trimmed.startsWith('`') && trimmed.endsWith('`')) {
    return trimmed;
  }
  return `\`${text}\``;
}

/**
 * @param {import('typedoc').CommentDisplayPart[] | undefined} parts
 */
function displayPartsToString(parts) {
  if (!parts?.length) {
    return '';
  }
  return parts
    .map(p => {
      if (p.kind === 'text') {
        return p.text;
      }
      if (p.kind === 'code') {
        return codeDisplayPartToMarkdown(p.text);
      }
      if (p.kind === 'inline-tag') {
        return p.text;
      }
      if (p.kind === 'relative-link') {
        return p.text;
      }
      return '';
    })
    .join('');
}

/**
 * @param {import('typedoc').ProjectReflection} project
 * @param {string} name
 * @param {string} [sourcePathHint] e.g. `types/clerk`
 */
function findInterfaceOrClass(project, name, sourcePathHint) {
  /** @type {import('typedoc').DeclarationReflection[]} */
  const candidates = [];
  for (const r of Object.values(project.reflections)) {
    if (r.name !== name) {
      continue;
    }
    if (!r.kindOf(ReflectionKind.Interface) && !r.kindOf(ReflectionKind.Class)) {
      continue;
    }
    candidates.push(/** @type {import('typedoc').DeclarationReflection} */ (r));
  }
  if (candidates.length === 0) {
    return undefined;
  }
  if (candidates.length === 1) {
    return candidates[0];
  }
  if (sourcePathHint) {
    const hit = candidates.find(c => c.sources?.some(s => s.fileName.replace(/\\/g, '/').includes(sourcePathHint)));
    if (hit) {
      return hit;
    }
  }
  return candidates[0];
}

/**
 * Walk instantiated generic / alias chains (e.g. `CheckAuthorization` → `CheckAuthorizationFn<Params>` → `(…) => boolean`) until we find a {@link ReflectionType} call signature. Uses reflection IDs to avoid infinite loops.
 *
 * @param {import('typedoc').Type | undefined} t
 * @param {Set<number>} visitedReflectionIds
 * @returns {import('typedoc').SignatureReflection | undefined}
 */
function getCallSignatureFromType(t, visitedReflectionIds) {
  if (!t || typeof t !== 'object') {
    return undefined;
  }
  const tag = /** @type {{ type?: string }} */ (t).type;
  if (tag === 'optional' && 'elementType' in t) {
    return getCallSignatureFromType(
      /** @type {{ elementType: import('typedoc').Type }} */ (t).elementType,
      visitedReflectionIds,
    );
  }
  if (t instanceof ReflectionType) {
    if (t.declaration?.signatures?.length) {
      return t.declaration.signatures[0];
    }
    return undefined;
  }
  if (t instanceof ReferenceType) {
    const target = t.reflection;
    if (
      target &&
      'signatures' in target &&
      /** @type {{ signatures?: import('typedoc').SignatureReflection[] }} */ (target).signatures?.length
    ) {
      return /** @type {import('typedoc').DeclarationReflection} */ (target).signatures[0];
    }
    if (!target || !('kind' in target)) {
      return undefined;
    }
    const decl = /** @type {import('typedoc').DeclarationReflection} */ (target);
    const id = decl.id;
    if (id != null) {
      if (visitedReflectionIds.has(id)) {
        return undefined;
      }
      visitedReflectionIds.add(id);
    }
    try {
      if (decl.kind === ReflectionKind.TypeAlias && decl.type) {
        return getCallSignatureFromType(decl.type, visitedReflectionIds);
      }
    } finally {
      if (id != null) {
        visitedReflectionIds.delete(id);
      }
    }
    return undefined;
  }
  if (t instanceof UnionType) {
    for (const arm of t.types) {
      const sig = getCallSignatureFromType(arm, visitedReflectionIds);
      if (sig) {
        return sig;
      }
    }
    return undefined;
  }
  if (t instanceof IntersectionType) {
    for (const arm of t.types) {
      const sig = getCallSignatureFromType(arm, visitedReflectionIds);
      if (sig) {
        return sig;
      }
    }
  }
  return undefined;
}

/**
 * @param {import('typedoc').DeclarationReflection} decl
 * @returns {import('typedoc').SignatureReflection | undefined}
 */
function getPrimaryCallSignature(decl) {
  if (decl.signatures?.length) {
    return decl.signatures[0];
  }
  const t = decl.type;
  if (t && 'declaration' in t && t.declaration?.signatures?.length) {
    return t.declaration.signatures[0];
  }
  // E.g. `navigate: CustomNavigation` — for `type Fn = () => void`, signatures often live on the inner `declaration` of `alias.type` (ReflectionType), not on `alias.signatures` (see `custom-theme.mjs` `isCallablePropertyValueType`).
  if (t && typeof t === 'object' && 'type' in t && /** @type {{ type?: string }} */ (t).type === 'reference') {
    const ref = /** @type {import('typedoc').ReferenceType} */ (t);
    const target = ref.reflection;
    const sigs =
      target && 'signatures' in target
        ? /** @type {{ signatures?: import('typedoc').SignatureReflection[] }} */ (target).signatures
        : undefined;
    if (sigs?.length) {
      return sigs[0];
    }
    const aliasTarget = /** @type {import('typedoc').DeclarationReflection | undefined} */ (
      target && 'kind' in target ? target : undefined
    );
    if (aliasTarget?.kind === ReflectionKind.TypeAlias && aliasTarget.type && 'declaration' in aliasTarget.type) {
      const inner = /** @type {import('typedoc').ReflectionType} */ (aliasTarget.type).declaration;
      if (inner?.signatures?.length) {
        return inner.signatures[0];
      }
    }
    // `type X = SomeFn<Args>` — RHS is often ReferenceType (generic alias), not ReflectionType; recurse (e.g. `checkAuthorization: CheckAuthorization`).
    if (aliasTarget?.kind === ReflectionKind.TypeAlias && aliasTarget.type) {
      const fromRhs = getCallSignatureFromType(aliasTarget.type, new Set());
      if (fromRhs) {
        return fromRhs;
      }
    }
    const fromRef = getCallSignatureFromType(ref, new Set());
    if (fromRef) {
      return fromRef;
    }
  }
  return undefined;
}

/**
 * @param {import('typedoc').Type | undefined} t
 */
function unwrapOptionalType(t) {
  if (!t || typeof t !== 'object') {
    return t;
  }
  if (/** @type {{ type?: string }} */ (t).type === 'optional' && 'elementType' in t) {
    return /** @type {{ elementType: import('typedoc').Type }} */ (t).elementType;
  }
  return t;
}

/**
 * For `prop: OuterAlias` where `type OuterAlias = SomeFn<TArg>`, maps generic parameter names on `SomeFn` to the instantiated type arguments (e.g. `Params` → `CheckAuthorizationParams`).
 *
 * @param {import('typedoc').DeclarationReflection} propertyDecl
 * @returns {Map<string, import('typedoc').Type> | undefined}
 */
function getGenericInstantiationMapFromCallableProperty(propertyDecl) {
  const t = unwrapOptionalType(propertyDecl.type);
  if (!(t instanceof ReferenceType) || !t.reflection) {
    return undefined;
  }
  const alias = /** @type {import('typedoc').DeclarationReflection} */ (t.reflection);
  if (!alias.kindOf(ReflectionKind.TypeAlias) || !alias.type) {
    return undefined;
  }
  const inner = unwrapOptionalType(alias.type);
  if (!(inner instanceof ReferenceType) || !inner.typeArguments?.length || !inner.reflection) {
    return undefined;
  }
  const generic = /** @type {import('typedoc').DeclarationReflection} */ (inner.reflection);
  const tpls = generic.typeParameters;
  if (!tpls?.length) {
    return undefined;
  }
  /** @type {Map<string, import('typedoc').Type>} */
  const map = new Map();
  for (let i = 0; i < inner.typeArguments.length; i++) {
    const tp = tpls[i];
    const arg = inner.typeArguments[i];
    if (tp?.name && arg) {
      map.set(tp.name, arg);
    }
  }
  return map.size ? map : undefined;
}

/**
 * Replace references to generic type parameters with instantiated types from {@link getGenericInstantiationMapFromCallableProperty}.
 *
 * @param {import('typedoc').Type | undefined} t
 * @param {Map<string, import('typedoc').Type> | undefined} map
 * @returns {import('typedoc').Type | undefined}
 */
function substituteGenericParamRefsInType(t, map) {
  if (!t || !map?.size) {
    return t;
  }
  if (/** @type {{ type?: string }} */ (t).type === 'optional' && 'elementType' in t) {
    const el = /** @type {{ elementType: import('typedoc').Type }} */ (t).elementType;
    const next = substituteGenericParamRefsInType(el, map);
    if (next && next !== el) {
      return new OptionalType(/** @type {import('typedoc').SomeType} */ (/** @type {unknown} */ (next)));
    }
    return t;
  }
  if (t instanceof ReferenceType && map.has(t.name)) {
    return map.get(t.name) ?? t;
  }
  return t;
}

/**
 * @param {import('typedoc').SignatureReflection} sig
 * @param {Map<string, import('typedoc').Type> | undefined} instantiationMap
 */
function signatureWithInstantiation(sig, instantiationMap) {
  if (!instantiationMap?.size) {
    return sig;
  }
  const parameters = (sig.parameters ?? []).map(p => {
    const newType = substituteGenericParamRefsInType(p.type, instantiationMap);
    if (newType === p.type) {
      return p;
    }
    return Object.assign(Object.create(Object.getPrototypeOf(p)), p, { type: newType });
  });
  const newReturn = substituteGenericParamRefsInType(sig.type, instantiationMap) ?? sig.type;
  const out = Object.assign(Object.create(Object.getPrototypeOf(sig)), sig, {
    parameters,
    type: newReturn,
    typeParameters: undefined,
  });
  if (sig.project) {
    out.project = sig.project;
  }
  return out;
}

/**
 * Must stay aligned with allowlisted `propertiesTable` filtering in `custom-theme.mjs` (callable members are extracted here, not listed as properties).
 *
 * @param {import('typedoc').DeclarationReflection} decl
 * @param {import('typedoc-plugin-markdown').MarkdownThemeContext} ctx
 */
function shouldExtractCallableMember(decl, ctx) {
  if (decl.kind === ReflectionKind.Method) {
    return true;
  }
  if (
    decl.kind === ReflectionKind.Property ||
    decl.kind === ReflectionKind.Accessor ||
    decl.kind === ReflectionKind.Variable
  ) {
    return isCallableInterfaceProperty(decl, ctx.helpers);
  }
  return false;
}

/**
 * @param {string} markdown
 * @returns {string | undefined} Body under `## Properties` (no heading), or undefined
 */
function extractPropertiesSectionBody(markdown) {
  const normalized = markdown.replace(/\r\n/g, '\n');
  const m = normalized.match(/(^|\n)## Properties\n+/);
  if (!m || m.index === undefined) {
    return undefined;
  }
  const start = m.index + m[0].length;
  const rest = normalized.slice(start);
  const nextH2 = rest.search(/\n## /);
  const section = nextH2 === -1 ? rest : rest.slice(0, nextH2);
  const trimmed = section.trim();
  return trimmed.length ? trimmed : undefined;
}

/**
 * @param {string} pageUrl e.g. `shared/clerk/clerk.mdx`
 */
function extractPropertiesAndTrimSourcePage(pageUrl) {
  const sourcePath = path.join(__dirname, 'temp-docs', pageUrl);
  if (!fs.existsSync(sourcePath)) {
    console.warn(`[extract-methods] Expected TypeDoc output missing: ${sourcePath}`);
    return;
  }
  const raw = fs.readFileSync(sourcePath, 'utf-8');
  const body = extractPropertiesSectionBody(raw);
  const pageDir = path.dirname(pageUrl);
  const objectDir = path.join(__dirname, 'temp-docs', pageDir);
  fs.mkdirSync(objectDir, { recursive: true });

  if (body) {
    const propertiesDoc = [`## Properties`, '', body.trimEnd(), ''].join('\n');
    const propertiesPath = path.join(objectDir, 'properties.mdx');
    fs.writeFileSync(
      propertiesPath,
      applyCatchAllMdReplacements(applyRelativeLinkReplacements(propertiesDoc)),
      'utf-8',
    );
    console.log(`[extract-methods] Wrote ${path.relative(path.join(__dirname, '..'), propertiesPath)}`);
  }

  const stripped = stripReferenceObjectPropertiesSection(raw);
  if (stripped !== raw) {
    fs.writeFileSync(sourcePath, stripped, 'utf-8');
    console.log(`[extract-methods] Stripped Properties from ${path.relative(path.join(__dirname, '..'), sourcePath)}`);
  }
}

/**
 * @param {string} name
 */
function toKebabCase(name) {
  return name
    .replace(/([a-z\d])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

/**
 * Plain TypeScript-like type text for ```typescript``` fences (no markdown / backticks from {@link MarkdownThemeContext.partials.someType}).
 *
 * @param {import('typedoc').Type | undefined} t
 */
function typeStringForTypeScriptFence(t) {
  if (!t) {
    return 'unknown';
  }
  return removeLineBreaks(t.toString());
}

/**
 * @param {import('typedoc').SignatureReflection} sig
 * @param {string} memberName
 * @param {Map<string, import('typedoc').Type> | undefined} instantiationMap
 */
function formatTypeScriptSignature(sig, memberName, instantiationMap) {
  const hideOuterTypeParams = Boolean(instantiationMap?.size) && (sig.typeParameters?.length ?? 0) > 0;
  const typeParamStr =
    !hideOuterTypeParams && sig.typeParameters?.length ? `<${sig.typeParameters.map(tp => tp.name).join(', ')}>` : '';
  const params =
    sig.parameters?.map(p => {
      const opt = p.flags.isOptional ? '?' : '';
      const rest = p.flags.isRest ? '...' : '';
      const t = substituteGenericParamRefsInType(p.type, instantiationMap) ?? p.type;
      const typeStr = typeStringForTypeScriptFence(t);
      return `${rest}${p.name}${opt}: ${typeStr}`;
    }) ?? [];
  const retT = substituteGenericParamRefsInType(sig.type, instantiationMap) ?? sig.type;
  const ret = retT ? typeStringForTypeScriptFence(retT) : 'void';
  return `function ${memberName}${typeParamStr}(${params.join(', ')}): ${ret}`;
}

/**
 * `@returns - foo` is often stored with a leading dash, which renders as a bullet. Normalize to prose for "Returns …" lines.
 * @param {string} body
 */
function normalizeReturnsBody(body) {
  return body.replace(/^\s*[-*]\s+/, '').trim();
}

/**
 * Lowercase the first character so the line reads "Returns an …" not "Returns An …".
 * @param {string} body
 */
function lowercaseFirstCharacter(body) {
  if (!body) {
    return body;
  }
  return body.charAt(0).toLowerCase() + body.slice(1);
}

/**
 * @param {import('typedoc').CommentTag} tag
 */
function formatReturnsLineFromTag(tag) {
  const raw = Comment.combineDisplayParts(tag.content).trim();
  if (!raw) {
    return '';
  }
  const body = lowercaseFirstCharacter(normalizeReturnsBody(raw));
  return `Returns ${body}`;
}

/**
 * @param {import('typedoc').Comment | undefined} comment
 */
/**
 * `typedoc-plugin-markdown` table partials include `@example` in Description cells. For extract-methods, we want to exclude examples from the generated output.
 *
 * Uses the same `getFlattenedDeclarations` list as `propertiesTable` so nested property rows omit examples too.
 *
 * @template T
 * @param {import('typedoc').Reflection[]} roots
 * @param {import('typedoc-plugin-markdown').MarkdownThemeContext} ctx
 * @param {() => T} render
 * @returns {T}
 */
function renderMemberTableOmittingExampleBlocks(roots, ctx, render) {
  const flatten =
    typeof ctx.helpers?.getFlattenedDeclarations === 'function'
      ? ctx.helpers.getFlattenedDeclarations(
          /** @type {import('typedoc').DeclarationReflection[]} */ (/** @type {unknown} */ (roots)),
        )
      : roots;
  /** @type {Set<import('typedoc').Comment>} */
  const processedComments = new Set();
  /** @type {{ ref: import('typedoc').Reflection; orig: import('typedoc').Comment }[]} */
  const restore = [];
  for (const r of flatten) {
    const c = 'comment' in r ? r.comment : undefined;
    if (!c?.getTag('@example') || processedComments.has(c)) {
      continue;
    }
    processedComments.add(c);
    const next = c.clone();
    next.removeTags('@example');
    for (const ref of flatten) {
      if (ref.comment === c) {
        ref.comment = next;
        restore.push({ ref, orig: c });
      }
    }
  }
  try {
    return render();
  } finally {
    for (const { ref, orig } of restore) {
      ref.comment = orig;
    }
  }
}

/**
 * @param {import('typedoc').Comment | undefined} comment
 */
function commentSummaryAndBody(comment) {
  if (!comment) {
    return '';
  }
  const summary = displayPartsToString(comment.summary).trim();
  const block = comment.blockTags
    ?.filter(t => !['@param', '@typeParam', '@returns'].includes(t.tag))
    .map(t => displayPartsToString(t.content).trim())
    .filter(Boolean)
    .join('\n\n');
  const returnsLines =
    comment.blockTags
      ?.filter(t => t.tag === '@returns')
      .map(t => formatReturnsLineFromTag(t))
      .filter(Boolean) ?? [];
  return [summary, block, ...returnsLines].filter(Boolean).join('\n\n');
}

/**
 * When `@returns` exists only on the call signature (not on the declaration), append it to the prose.
 * @param {import('typedoc').Comment | undefined} declComment
 * @param {import('typedoc').Comment | undefined} sigComment
 */
function appendSignatureOnlyReturns(declComment, sigComment) {
  if (declComment?.getTag('@returns')?.content?.length) {
    return '';
  }
  const tag = sigComment?.getTag('@returns');
  if (!tag?.content?.length) {
    return '';
  }
  return formatReturnsLineFromTag(tag);
}

/**
 * Object / type-literal declaration for a parameter type (reference, inlined reflection, intersection).
 * TypeDoc applies `@param parent.prop` descriptions onto property reflections under this declaration.
 *
 * @param {import('typedoc').SomeType | undefined} t
 * @returns {import('typedoc').DeclarationReflection | undefined}
 */
function resolveDeclarationWithObjectMembers(t) {
  if (!t) {
    return undefined;
  }
  if (t.type === 'reflection') {
    const d = t.declaration;
    if (d.children?.length) {
      return d;
    }
  }
  if (t.type === 'reference') {
    const ref = /** @type {import('typedoc').ReferenceType} */ (t);
    const r = ref.reflection;
    if (r && 'type' in r) {
      const decl = /** @type {import('typedoc').DeclarationReflection} */ (r);
      if (decl.children?.length) {
        return decl;
      }
      if (decl.type) {
        return resolveDeclarationWithObjectMembers(decl.type);
      }
    }
  }
  if (t.type === 'intersection') {
    const inter = /** @type {import('typedoc').IntersectionType} */ (t);
    /** @type {Map<string, import('typedoc').DeclarationReflection>} */
    const byName = new Map();
    for (const inner of inter.types) {
      const res = resolveDeclarationWithObjectMembers(inner);
      if (res?.children?.length) {
        for (const c of res.children) {
          if (c.kindOf(ReflectionKind.Property)) {
            byName.set(c.name, c);
          }
        }
      }
    }
    if (byName.size === 0) {
      return undefined;
    }
    // Synthetic holder so nominal param sections list every `&` arm (e.g. `RedirectOptions`).
    return /** @type {import('typedoc').DeclarationReflection} */ (
      /** @type {unknown} */ ({
        children: [...byName.values()].sort((a, b) => a.name.localeCompare(b.name)),
        kind: ReflectionKind.TypeLiteral,
        name: '__intersectionMerged',
      })
    );
  }
  if (t.type === 'optional') {
    return resolveDeclarationWithObjectMembers(/** @type {import('typedoc').OptionalType} */ (t).elementType);
  }
  return undefined;
}

/**
 * @param {string} baseName
 * @param {string[]} pathSegments
 */
function formatNestedParamNameColumn(baseName, pathSegments) {
  const pathChain = pathSegments.join('?.');
  return `\`${baseName}?.${pathChain}\``;
}

/**
 * This function unwraps a TypeDoc parameter type if it is an optional type. If the provided type is of type "optional", it returns the underlying element type (the real type being wrapped). If it is not optional or is undefined, it returns the type as-is.
 *
 * @param {import('typedoc').SomeType | undefined} t
 * @returns {import('typedoc').SomeType | undefined}
 */
function unwrapOptionalParamType(t) {
  if (t?.type === 'optional') {
    return /** @type {import('typedoc').OptionalType} */ (t).elementType;
  }
  return t;
}

/**
 * When TypeDoc renders a parameter type as a markdown link to another generated `.mdx` file, that type has a dedicated page — omit nested `param?.prop` rows so readers follow the type link instead.
 * `@inline` aliases are expanded by the theme and do not link to a standalone page.
 *
 * @param {import('typedoc').SomeType | undefined} t
 * @param {import('typedoc-plugin-markdown').MarkdownThemeContext} ctx
 */
function parameterTypeLinksToStandaloneMdxPage(t, ctx) {
  const bare = unwrapOptionalParamType(t);
  if (!bare) {
    return false;
  }
  if (bare.type === 'reference') {
    const ref = /** @type {import('typedoc').ReferenceType} */ (bare);
    if (ref.reflection?.comment?.hasModifier('@inline')) {
      return false;
    }
  }
  const md = removeLineBreaksForTableCell(ctx.partials.someType(bare) ?? '') ?? '';
  return /\.mdx(?:#[^)]*)?\)/.test(md);
}

/**
 * Rows for object properties on a nominal param type (e.g. `HandleOAuthCallbackParams`), including from `@param parent.prop` on the method.
 * Lists every property on the resolved shape; uses the property comment when present, otherwise `—` (intersection aliases often omit comments on some arms in the model).
 *
 * @param {import('typedoc').ParameterReflection} param
 * @param {import('typedoc-plugin-markdown').MarkdownThemeContext} ctx
 */
function nestedParameterRowsFromDocumentedProperties(param, ctx) {
  // `parametersTable` already flattens inline `{ ... }` params (see typedoc-plugin-markdown `parseParams`).
  // Adding rows here would duplicate those (e.g. `options.skipInitialEmit` twice on `addListener`).
  if (param.type?.type === 'reflection') {
    const d = /** @type {import('typedoc').DeclarationReflection} */ (param.type.declaration);
    if (d?.kind === ReflectionKind.TypeLiteral && d.children?.length) {
      return [];
    }
  }

  if (parameterTypeLinksToStandaloneMdxPage(param.type, ctx)) {
    return [];
  }

  const holder = resolveDeclarationWithObjectMembers(param.type);
  if (!holder?.children?.length) {
    return [];
  }
  const props = holder.children.filter(c => c.kindOf(ReflectionKind.Property));
  props.sort((a, b) => a.name.localeCompare(b.name));
  /** @type {string[]} */
  const rows = [];
  for (const child of props) {
    const summary = child.comment?.summary;
    const typeCell = child.type ? removeLineBreaksForTableCell(ctx.partials.someType(child.type)) : '`unknown`';
    const nestedNameCol = formatNestedParamNameColumn(param.name, [child.name]);
    const nestedDesc = summary?.length ? displayPartsToString(summary).trim() || '—' : '—';
    rows.push(`| ${nestedNameCol} | ${typeCell} | ${nestedDesc} |`);
  }
  return rows;
}

/**
 * Merged / external references sometimes leave {@link ReferenceType.reflection} unset; resolve by name.
 *
 * @param {import('typedoc').ProjectReflection} project
 * @param {string} name
 * @returns {import('typedoc').DeclarationReflection | undefined}
 */
function lookupInterfaceOrTypeAliasByName(project, name) {
  /** @type {import('typedoc').DeclarationReflection[]} */
  const cands = [];
  for (const r of Object.values(project.reflections)) {
    if (r.name !== name) {
      continue;
    }
    if (!r.kindOf(ReflectionKind.Interface) && !r.kindOf(ReflectionKind.TypeAlias)) {
      continue;
    }
    cands.push(/** @type {import('typedoc').DeclarationReflection} */ (r));
  }
  if (cands.length === 0) {
    return undefined;
  }
  if (cands.length === 1) {
    return cands[0];
  }
  const withChildren = cands.find(c => c.children?.length);
  return withChildren ?? cands[0];
}

/**
 * Unwrap optional wrappers. When the parameter is a single named interface or type alias for an object shape, returns that name and the declaration holding object properties.
 *
 * @param {import('typedoc').SomeType | undefined} t
 * @param {import('typedoc').ProjectReflection} project
 * @returns {{ sectionTitle: string, holder: import('typedoc').DeclarationReflection, typeDecl: import('typedoc').DeclarationReflection } | undefined}
 */
function resolveNominalObjectTypeForSingleParam(t, project) {
  if (!t) {
    return undefined;
  }
  if (t.type === 'optional') {
    return resolveNominalObjectTypeForSingleParam(
      /** @type {import('typedoc').OptionalType} */ (t).elementType,
      project,
    );
  }
  if (t.type === 'reference') {
    const ref = /** @type {import('typedoc').ReferenceType} */ (t);
    let typeDecl =
      ref.reflection && 'kind' in ref.reflection
        ? /** @type {import('typedoc').DeclarationReflection} */ (ref.reflection)
        : lookupInterfaceOrTypeAliasByName(project, ref.name);
    if (!typeDecl) {
      return undefined;
    }
    if (typeDecl.kindOf(ReflectionKind.Interface)) {
      if (!typeDecl.children?.length) {
        return undefined;
      }
      return { sectionTitle: typeDecl.name, holder: typeDecl, typeDecl };
    }
    if (typeDecl.kindOf(ReflectionKind.TypeAlias)) {
      // Same as `resolveDeclarationWithObjectMembers` for a reference: members may live on the alias
      // (`typeDecl.children`) with no `typeDecl.type` (e.g. `SignOutOptions`, `JoinWaitlistParams`).
      const holder = typeDecl.children?.length
        ? typeDecl
        : typeDecl.type
          ? resolveDeclarationWithObjectMembers(typeDecl.type)
          : undefined;
      if (!holder?.children?.length) {
        return undefined;
      }
      return { sectionTitle: typeDecl.name, holder, typeDecl };
    }
  }
  return undefined;
}

/**
 * @param {import('typedoc').DeclarationReflection} typeDecl
 * @param {import('typedoc').DeclarationReflection[]} props
 */
function isNominalParamTypeDocumented(typeDecl, props) {
  if (typeDecl.comment?.summary?.length) {
    return true;
  }
  return props.some(p => p.comment?.summary?.length);
}

/**
 * Single parameter that is a named object type (interface / type alias): one section titled after the type, table lists every property (not the outer `params` row). Uses the same `propertiesTable` partial as TypeDoc.
 *
 * @param {import('typedoc').SignatureReflection} sig
 * @param {import('typedoc-plugin-markdown').MarkdownThemeContext} ctx
 * @returns {string | undefined}
 */
function trySingleNominalParameterTypeSection(sig, ctx) {
  const params = sig.parameters ?? [];
  if (params.length !== 1) {
    return undefined;
  }
  const p = params[0];
  const project = sig.project ?? ctx.page?.project;
  const nominal = resolveNominalObjectTypeForSingleParam(p.type, project);
  if (!nominal) {
    return undefined;
  }
  const props = (nominal.holder.children ?? []).filter(c => c.kindOf(ReflectionKind.Property));
  if (props.length === 0) {
    return undefined;
  }
  if (!isNominalParamTypeDocumented(nominal.typeDecl, props)) {
    return undefined;
  }
  const tableMd = renderMemberTableOmittingExampleBlocks(props, ctx, () =>
    ctx.partials.propertiesTable(props, {
      kind: nominal.typeDecl.kind,
      isEventProps: false,
    }),
  );
  if (!tableMd?.trim()) {
    return undefined;
  }
  return [markdownHeading(4, nominal.sectionTitle), '', tableMd, ''].join('\n');
}

/**
 * @param {import('typedoc').SignatureReflection} sig
 * @param {import('typedoc-plugin-markdown').MarkdownThemeContext} ctx
 * @param {Map<string, import('typedoc').Type> | undefined} instantiationMap
 */
function parametersMarkdownTable(sig, ctx, instantiationMap) {
  const sigForDisplay = signatureWithInstantiation(sig, instantiationMap);
  const params = sigForDisplay.parameters ?? [];
  if (params.length === 0) {
    return '';
  }

  const singleNominal = trySingleNominalParameterTypeSection(sigForDisplay, ctx);
  if (singleNominal) {
    return singleNominal;
  }

  let tableMd = renderMemberTableOmittingExampleBlocks(params, ctx, () => ctx.partials.parametersTable(params));
  /** @type {string[]} */
  const nested = [];
  for (const p of params) {
    nested.push(...nestedParameterRowsFromDocumentedProperties(p, ctx));
  }
  if (nested.length) {
    tableMd = appendMarkdownTableRows(tableMd, nested);
  }

  tableMd = formatMethodParametersTable(tableMd);

  return [markdownHeading(4, ReflectionKind.pluralString(ReflectionKind.Parameter)), '', tableMd, ''].join('\n');
}

/**
 * @param {import('typedoc').DeclarationReflection} decl
 * @param {import('typedoc-plugin-markdown').MarkdownThemeContext} ctx
 */
function buildMethodMdx(decl, ctx) {
  const name = decl.name;
  const sig = getPrimaryCallSignature(decl);
  if (!sig) {
    return '';
  }
  const title = `### \`${name}()\``;
  /** Prefer the declaration comment (property-style methods document `addListener` on the property, not the signature). */
  const comment = decl.comment ?? sig.comment;
  let description = commentSummaryAndBody(comment);
  const sigReturns = appendSignatureOnlyReturns(decl.comment, sig.comment);
  if (sigReturns) {
    description = [description, sigReturns].filter(Boolean).join('\n\n');
  }
  const instantiationMap = getGenericInstantiationMapFromCallableProperty(decl);
  const ts = ['```typescript', formatTypeScriptSignature(sig, name, instantiationMap), '```'].join('\n');
  const skipParametersSection =
    Boolean(decl.comment?.hasModifier('@skipParametersSection')) ||
    Boolean(sig.comment?.hasModifier('@skipParametersSection'));
  const paramsMd = skipParametersSection ? '' : parametersMarkdownTable(sig, ctx, instantiationMap);

  // Same post-process as `custom-plugin.mjs` `MarkdownPageEvent.END`: relative `.mdx` links, then catch-alls.
  // Skip the ```typescript``` fence so signatures stay plain code.
  const head = applyCatchAllMdReplacements(applyRelativeLinkReplacements([title, '', description].join('\n')));
  const paramsProcessed = paramsMd ? applyCatchAllMdReplacements(applyRelativeLinkReplacements(paramsMd)) : '';
  const chunks = [head, ts];
  if (paramsProcessed) {
    chunks.push(paramsProcessed);
  }
  return chunks.join('\n\n').trim() + '\n';
}

/**
 * @param {string} pageUrl
 * @param {import('typedoc').ProjectReflection} project
 * @param {import('typedoc').Application} app
 */
function extractMethodsForPage(pageUrl, project, app) {
  const entry = REFERENCE_OBJECT_CONFIG[/** @type {keyof typeof REFERENCE_OBJECT_CONFIG} */ (pageUrl)];
  if (!entry) {
    console.warn(`[extract-methods] No symbol mapping for ${pageUrl}, skipping`);
    return 0;
  }

  const { symbol, declarationHint } = entry;
  const decl = findInterfaceOrClass(project, symbol, declarationHint);
  if (!decl?.children) {
    console.warn(`[extract-methods] Could not find interface/class "${symbol}"`);
    return 0;
  }

  extractPropertiesAndTrimSourcePage(pageUrl);

  const ctx = createThemeContextForReferencePage(app, project, pageUrl, decl);

  const pageDir = path.dirname(pageUrl);
  const objectDir = path.join(__dirname, 'temp-docs', pageDir);
  const outDir = path.join(objectDir, 'methods');
  fs.mkdirSync(outDir, { recursive: true });

  let count = 0;
  for (const child of decl.children) {
    if (child.name.startsWith('__')) {
      continue;
    }
    if (!shouldExtractCallableMember(/** @type {import('typedoc').DeclarationReflection} */ (child), ctx)) {
      continue;
    }
    const mdx = buildMethodMdx(/** @type {import('typedoc').DeclarationReflection} */ (child), ctx);
    if (!mdx) {
      continue;
    }
    const fileName = `${toKebabCase(child.name)}.mdx`;
    const filePath = path.join(outDir, fileName);
    fs.writeFileSync(filePath, mdx, 'utf-8');
    console.log(`[extract-methods] Wrote ${path.relative(path.join(__dirname, '..'), filePath)}`);
    count++;
  }
  return count;
}

async function main() {
  const app = await Application.bootstrapWithPlugins({
    ...typedocConfig,
    // Avoid writing markdown twice; we only need reflections.
    out: path.join(__dirname, 'temp-docs-unused'),
  });

  const project = await app.convert();
  if (!project) {
    console.error('[extract-methods] TypeDoc conversion failed');
    process.exit(1);
  }

  prepareMarkdownRenderer(app, project);

  let total = 0;
  for (const pageUrl of REFERENCE_OBJECTS_LIST) {
    total += extractMethodsForPage(pageUrl, project, app);
  }
  console.log(`[extract-methods] Wrote ${total} method files total`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
