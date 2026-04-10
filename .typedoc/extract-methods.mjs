// @ts-check
/**
 * For each entry in REFERENCE_OBJECTS_LIST, finds callable members on the mapped interface/class via TypeDoc
 * and writes one .mdx per method (kebab file name) next to the main reference page output.
 *
 * Run after `typedoc` (same cwd as repo root). Uses a second TypeDoc convert pass to read reflections.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Application, Comment, ReflectionKind } from 'typedoc';

import typedocConfig from '../typedoc.config.mjs';
import { applyCatchAllMdReplacements } from './custom-plugin.mjs';
import { REFERENCE_OBJECTS_LIST, REFERENCE_OBJECT_PAGE_SYMBOLS } from './reference-objects.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
  return undefined;
}

/**
 * @param {import('typedoc').DeclarationReflection} decl
 */
function isCallableMember(decl) {
  if (decl.kind === ReflectionKind.Method) {
    return true;
  }
  if (decl.kind === ReflectionKind.Property) {
    return !!getPrimaryCallSignature(decl);
  }
  return false;
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
 * @param {import('typedoc').SignatureReflection} sig
 * @param {string} memberName
 */
function formatTypeScriptSignature(sig, memberName) {
  const typeParams = sig.typeParameters?.map(tp => tp.name).join(', ') ?? '';
  const typeParamStr = typeParams ? `<${typeParams}>` : '';
  const params =
    sig.parameters?.map(p => {
      const opt = p.flags.isOptional ? '?' : '';
      const rest = p.flags.isRest ? '...' : '';
      const typeStr = p.type ? p.type.toString() : 'unknown';
      return `${rest}${p.name}${opt}: ${typeStr}`;
    }) ?? [];
  const ret = sig.type ? sig.type.toString() : 'void';
  return `function ${memberName}${typeParamStr}(${params.join(', ')}): ${ret}`;
}

/**
 * `@returns - foo` is often stored with a leading dash, which renders as a bullet. Normalize to prose for
 * "Returns …" lines.
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
 * @param {import('typedoc').SignatureReflection} sig
 * @param {import('typedoc').ParameterReflection} param
 * @param {import('typedoc').DeclarationReflection} decl
 */
function getParamDescription(sig, param, decl) {
  if (param.comment?.summary?.length) {
    return displayPartsToString(param.comment.summary).trim();
  }
  const tag =
    sig.comment?.getIdentifiedTag(param.name, '@param') ?? decl.comment?.getIdentifiedTag(param.name, '@param');
  if (tag?.content?.length) {
    return Comment.combineDisplayParts(tag.content).trim();
  }
  return '';
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
    for (const inner of /** @type {import('typedoc').IntersectionType} */ (t).types) {
      const res = resolveDeclarationWithObjectMembers(inner);
      if (res) {
        return res;
      }
    }
  }
  if (t.type === 'optional') {
    return resolveDeclarationWithObjectMembers(/** @type {import('typedoc').OptionalType} */ (t).elementType);
  }
  return undefined;
}

/**
 * @param {string} baseName
 * @param {string[]} pathSegments
 * @param {boolean} parentOptional
 */
function formatNestedParamNameColumn(baseName, pathSegments, parentOptional) {
  const chain = pathSegments.join('.');
  const inner = parentOptional ? `${baseName}?.${chain}` : `${baseName}.${chain}`;
  return `\`${inner}\``;
}

/**
 * Rows for object properties that have documentation (including from `@param parent.prop` on the method),
 * which TypeDoc stores on property reflections rather than leaving `@param` block tags on the signature.
 *
 * @param {import('typedoc').ParameterReflection} param
 * @returns {string[]}
 */
function nestedParameterRowsFromDocumentedProperties(param) {
  const holder = resolveDeclarationWithObjectMembers(param.type);
  if (!holder?.children?.length) {
    return [];
  }
  const props = holder.children.filter(c => c.kindOf(ReflectionKind.Property) && c.comment?.summary?.length);
  props.sort((a, b) => a.name.localeCompare(b.name));
  /** @type {string[]} */
  const rows = [];
  for (const child of props) {
    const summary = child.comment?.summary;
    if (!summary?.length) {
      continue;
    }
    const nestedTypeRaw = child.type?.toString();
    const nestedTypeStr = nestedTypeRaw ? `\`${nestedTypeRaw.replace(/\|/g, '\\|')}\`` : '`unknown`';
    const nestedNameCol = formatNestedParamNameColumn(param.name, [child.name], param.flags.isOptional);
    const nestedDesc = displayPartsToString(summary).trim() || '—';
    rows.push(`| ${nestedNameCol} | ${nestedTypeStr} | ${nestedDesc} |`);
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
 * Unwrap optional wrappers. When the parameter is a single named interface or type alias for an object
 * shape, returns that name and the declaration holding object properties.
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
 * @param {import('typedoc').DeclarationReflection} holder
 * @returns {string[]}
 */
function propertyTableRowsForDeclaration(holder) {
  const props = (holder.children ?? []).filter(c => c.kindOf(ReflectionKind.Property));
  props.sort((a, b) => a.name.localeCompare(b.name));
  /** @type {string[]} */
  const rows = [];
  for (const child of props) {
    const opt = child.flags.isOptional ? '?' : '';
    const nameCol = `\`${child.name}${opt}\``;
    const nestedTypeRaw = child.type?.toString();
    const nestedTypeStr = nestedTypeRaw ? `\`${nestedTypeRaw.replace(/\|/g, '\\|')}\`` : '`unknown`';
    const nestedDesc = child.comment?.summary?.length ? displayPartsToString(child.comment.summary).trim() : '—';
    rows.push(`| ${nameCol} | ${nestedTypeStr} | ${nestedDesc} |`);
  }
  return rows;
}

/**
 * Single parameter that is a named object type (interface / type alias): one section titled after the type,
 * table lists every property (not the outer `params` row).
 *
 * @param {import('typedoc').SignatureReflection} sig
 * @returns {string | undefined}
 */
function trySingleNominalParameterTypeSection(sig) {
  const params = sig.parameters ?? [];
  if (params.length !== 1) {
    return undefined;
  }
  const p = params[0];
  const nominal = resolveNominalObjectTypeForSingleParam(p.type, sig.project);
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
  const rows = propertyTableRowsForDeclaration(nominal.holder);
  if (rows.length === 0) {
    return undefined;
  }
  return [`#### ${nominal.sectionTitle}`, '', '| Name | Type | Description |', '| --- | --- | --- |', ...rows, ''].join(
    '\n',
  );
}

/**
 * @param {import('typedoc').SignatureReflection} sig
 * @param {import('typedoc').DeclarationReflection} decl
 */
function parametersMarkdownTable(sig, decl) {
  const params = sig.parameters ?? [];
  if (params.length === 0) {
    return '';
  }

  const singleNominal = trySingleNominalParameterTypeSection(sig);
  if (singleNominal) {
    return singleNominal;
  }

  /** @type {string[]} */
  const rows = [];
  for (const p of params) {
    const typeStr = p.type ? `\`${p.type.toString().replace(/\|/g, '\\|')}\`` : '`unknown`';
    const opt = p.flags.isOptional ? '?' : '';
    const nameCol = `\`${p.name}${opt}\``;
    const desc = getParamDescription(sig, p, decl);
    rows.push(`| ${nameCol} | ${typeStr} | ${desc || '—'} |`);
    rows.push(...nestedParameterRowsFromDocumentedProperties(p));
  }

  return ['#### Parameters', '', '| Name | Type | Description |', '| --- | --- | --- |', ...rows, ''].join('\n');
}

/**
 * @param {import('typedoc').DeclarationReflection} decl
 */
function buildMethodMdx(decl) {
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
  const ts = ['```typescript', formatTypeScriptSignature(sig, name), '```'].join('\n');
  const paramsMd = parametersMarkdownTable(sig, decl);

  // Same catch-all pass as `custom-plugin.mjs` — not run automatically because this MDX bypasses TypeDoc's renderer. Skip the ```typescript``` fence so signatures stay plain code.
  const head = applyCatchAllMdReplacements([title, '', description].join('\n'));
  const paramsProcessed = paramsMd ? applyCatchAllMdReplacements(paramsMd) : '';
  const chunks = [head, ts];
  if (paramsProcessed) {
    chunks.push(paramsProcessed);
  }
  return chunks.join('\n\n').trim() + '\n';
}

/**
 * @param {string} pageUrl
 * @param {import('typedoc').ProjectReflection} project
 */
function extractMethodsForPage(pageUrl, project) {
  const symbol = /** @type {Record<string, string>} */ (/** @type {unknown} */ (REFERENCE_OBJECT_PAGE_SYMBOLS))[
    pageUrl
  ];
  if (!symbol) {
    console.warn(`[extract-methods] No symbol mapping for ${pageUrl}, skipping`);
    return 0;
  }

  const hint = symbol === 'Clerk' ? 'types/clerk' : symbol === 'ClientResource' ? 'types/client' : undefined;
  const decl = findInterfaceOrClass(project, symbol, hint);
  if (!decl?.children) {
    console.warn(`[extract-methods] Could not find interface/class "${symbol}"`);
    return 0;
  }

  const outDir = path.join(__dirname, 'temp-docs', path.dirname(pageUrl), `${path.basename(pageUrl, '.mdx')}-methods`);
  fs.mkdirSync(outDir, { recursive: true });

  let count = 0;
  for (const child of decl.children) {
    if (child.name.startsWith('__')) {
      continue;
    }
    if (!isCallableMember(/** @type {import('typedoc').DeclarationReflection} */ (child))) {
      continue;
    }
    const mdx = buildMethodMdx(/** @type {import('typedoc').DeclarationReflection} */ (child));
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

  let total = 0;
  for (const pageUrl of REFERENCE_OBJECTS_LIST) {
    total += extractMethodsForPage(pageUrl, project);
  }
  console.log(`[extract-methods] Wrote ${total} method files total`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
