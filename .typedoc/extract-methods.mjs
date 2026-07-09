// @ts-check
/**
 * TypeDoc plugin that runs during the markdown render pass. For each reference-object page listed in {@link REFERENCE_OBJECT_CONFIG} (e.g. `shared/clerk/clerk.mdx`), this listener:
 *
 * - copies the body of the page's `## Properties` section (table only, no heading) into a sibling `properties.mdx`,
 * - mutates `output.contents` to drop the `## Properties` section from the main page,
 * - writes one `methods/<name>.mdx` per callable child on the reflection (and on any `extraMethodInterfaces`), alongside the main page in that resource folder.
 *
 * Must load **after** `custom-plugin.mjs` so its `MarkdownPageEvent.END` listener — which applies link replacements to `output.contents` — runs first. The Properties body we copy out is then already in its final, replaced form.
 *
 * Like `extract-returns-and-params.mjs`, parameter tables are not hand-built: they use the same `MarkdownThemeContext.partials` as TypeDoc markdown output (`parametersTable`/`propertiesTable`, which call `someType` and therefore pick up `custom-theme.mjs` union `&lt;code&gt;` behavior). The theme context comes from `theme.getRenderContext(output)` on the live page event — no second TypeDoc convert pass.
 *
 * Inline object namespaces tagged **`@extractMethods`** on the parent property are omitted from the main Properties table (see `custom-theme.mjs`). For each direct member: callables become `methods/<parent>-<child>.mdx` via `buildMethodMdx`; non-callables become a heading + property table via `buildPropertyTableDocMdx`.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  Comment,
  IntersectionType,
  OptionalType,
  ReferenceType,
  ReflectionKind,
  ReflectionType,
  UnionType,
} from 'typedoc';
import { MarkdownPageEvent } from 'typedoc-plugin-markdown';

import { applyTodoStrippingToComment } from './comment-utils.mjs';
import {
  applyCatchAllMdReplacements,
  applyRelativeLinkReplacements,
  stripReferenceObjectPropertiesSection,
} from './custom-plugin.mjs';
import { isCallableInterfaceProperty } from './custom-theme.mjs';
import { removeLineBreaks } from './markdown-helpers.mjs';
import { BACKEND_API_CONFIG, REFERENCE_OBJECT_CONFIG } from './reference-objects.mjs';

/**
 * `'reference'` (default): each `methods/<name>.mdx` opens with `### foo()` and uses an H4 `#### Parameters` heading — matches the reference-object pages that aggregate many methods.
 * `'page'`: skip the method-name title and use an H2 `## Parameters` heading — for one-method-per-docs-page surfaces, like the backend API endpoints.
 * @typedef {'reference' | 'page'} MethodFormat
 */

/** @param {string} pageUrl */
function methodFormatForPageUrl(pageUrl) {
  return pageUrl in BACKEND_API_CONFIG
    ? /** @type {MethodFormat} */ ('page')
    : /** @type {MethodFormat} */ ('reference');
}
import { toFileSlug } from './slug.mjs';
import { isInlineModifierWithoutStandalonePage } from './standalone-page-tag.mjs';
import { unwrapOptional } from './type-utils.mjs';

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
 * Heading whose visible title is a type/identifier (nominal single-parameter object sections) needs to get wrapped in backticks.
 *
 * @param {number} level
 * @param {string} text
 */
function markdownHeadingInlineCode(level, text) {
  const l = Math.min(Math.max(level, 1), 6);
  const t = text.trim();
  return `${'#'.repeat(l)} \`${t}\``;
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
 * Build the description cell for a nested `param.field` row: summary text plus a leading `**Deprecated.**` marker (with the `@deprecated` tag's body) when that tag is present. Matches what typedoc-plugin-markdown's `parseParams` emits for inline `{ … }` params — fields documented only via `@deprecated` (no summary) otherwise rendered as `—` here, hiding important guidance.
 * Returns `'—'` when both summary and `@deprecated` are empty.
 *
 * @param {import('typedoc').Comment | undefined} comment
 */
function renderNestedRowDescription(comment) {
  const summaryText = comment?.summary?.length ? displayPartsToString(comment.summary).trim() : '';
  const deprecatedTag = comment?.blockTags?.find(t => t.tag === '@deprecated');
  const deprecatedText = deprecatedTag ? displayPartsToString(deprecatedTag.content).trim() : '';
  const deprecatedMd = deprecatedTag ? `**Deprecated.**${deprecatedText ? ` ${deprecatedText}` : ''}` : '';
  const combined = [summaryText, deprecatedMd].filter(Boolean).join(' ');
  return combined || '—';
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
 * @param {import('typedoc').SignatureReflection} sig
 */
function signatureIsDeprecated(sig) {
  const c = sig.comment;
  if (!c) return false;
  if (typeof c.hasModifier === 'function' && c.hasModifier('@deprecated')) return true;
  return c.blockTags?.some(t => t.tag === '@deprecated') ?? false;
}

/**
 * typedoc maps `@param paramName description` to `parameter.comment` during conversion of the
 * signature that physically owns the JSDoc. With overloads + an implementation, the impl's `@param`
 * tags don't transfer to overload parameters — even when typedoc copies the impl's comment onto
 * each overload's `sig.comment.blockTags`. Without descriptions on `param.comment`, typedoc-plugin-markdown
 * drops the Description column from the parameters table.
 *
 * Overlay missing parameter comments from any matching `@param` block tag on the signature comment
 * so the rendered table shows the descriptions the author wrote on the implementation's JSDoc.
 *
 * @param {import('typedoc').SignatureReflection} sig
 */
function overlayParamCommentsFromSignatureBlockTags(sig) {
  const params = sig.parameters;
  if (!params?.length) return;
  const blockTags = sig.comment?.blockTags;
  if (!blockTags?.length) return;
  for (const p of params) {
    if (p.comment?.summary?.length) continue;
    const tag = blockTags.find(t => t.tag === '@param' && t.name === p.name);
    if (!tag?.content?.length) continue;
    p.comment = new Comment(tag.content);
  }
}

/**
 * @param {import('typedoc').DeclarationReflection} decl
 * @returns {import('typedoc').SignatureReflection | undefined}
 */
function getPrimaryCallSignature(decl) {
  if (decl.signatures?.length) {
    // Prefer the first non-`@deprecated` overload. typedoc treats each overload as a separate
    // signature, and selecting a deprecated one usually means rendering the form users shouldn't
    // use — and (often) one whose JSDoc isn't where the canonical `@param` descriptions live.
    const firstActive = decl.signatures.find(s => !signatureIsDeprecated(s));
    return firstActive ?? decl.signatures[0];
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
 * For `prop: OuterAlias` where `type OuterAlias = SomeFn<TArg>`, maps generic parameter names on `SomeFn` to the instantiated type arguments (e.g. `Params` → `CheckAuthorizationParams`).
 *
 * @param {import('typedoc').DeclarationReflection} propertyDecl
 * @returns {Map<string, import('typedoc').Type> | undefined}
 */
function getGenericInstantiationMapFromCallableProperty(propertyDecl) {
  const t = unwrapOptional(propertyDecl.type);
  if (!(t instanceof ReferenceType) || !t.reflection) {
    return undefined;
  }
  const alias = /** @type {import('typedoc').DeclarationReflection} */ (t.reflection);
  if (!alias.kindOf(ReflectionKind.TypeAlias) || !alias.type) {
    return undefined;
  }
  const inner = unwrapOptional(alias.type);
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
 * Resolve a property's type to its declared default when it references a `TypeParameter` reflection.
 * Used when a generic alias is inlined into an intersection (e.g. `CreateParams = { … } & MetadataParams` where the `& MetadataParams` arm gets inlined as a reflection, losing the named reference) so the property table surfaces the resolved default type instead of the open type-parameter name (e.g. `TPublic` → `OrganizationPublicMetadata`).
 *
 * @param {import('typedoc').Type | undefined} t
 * @returns {import('typedoc').Type | undefined}
 */
function substituteTypeParameterDefaultsInType(t) {
  if (!t) {
    return t;
  }
  if (/** @type {{ type?: string }} */ (t).type === 'optional' && 'elementType' in t) {
    const el = /** @type {{ elementType: import('typedoc').Type }} */ (t).elementType;
    const next = substituteTypeParameterDefaultsInType(el);
    if (next && next !== el) {
      return new OptionalType(/** @type {import('typedoc').SomeType} */ (/** @type {unknown} */ (next)));
    }
    return t;
  }
  if (t instanceof ReferenceType) {
    const tp = /** @type {{ kindOf?: (k: number) => boolean, default?: import('typedoc').Type }} */ (t.reflection);
    if (tp?.kindOf?.(ReflectionKind.TypeParameter) && tp.default) {
      return tp.default;
    }
  }
  return t;
}

/**
 * Clone each property and apply `substituteTypeParameterDefaultsInType` to its type — see comment on `substituteTypeParameterDefaultsInType` for the motivating case.
 *
 * @param {import('typedoc').DeclarationReflection[]} children
 */
function substituteTypeParameterDefaultsInChildren(children) {
  return children.map(child => {
    const next = substituteTypeParameterDefaultsInType(child.type);
    if (next === child.type) {
      return child;
    }
    return Object.assign(Object.create(Object.getPrototypeOf(child)), child, { type: next });
  });
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
 * Must stay aligned with allowlisted `propertiesTable` filtering in `custom-theme.mjs` (`isCallableInterfaceProperty` and `@extractMethods`: extracted here, not listed as properties). Nested tables pass `applyAllowlistedPropertyTableRowFilters: false`.
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
 * Object-literal (or single object arm of `T | null`) property rows for a properties table.
 *
 * @param {import('typedoc').SomeType | undefined} valueType
 * @returns {import('typedoc').DeclarationReflection[] | undefined}
 */
function resolveObjectShapeMembersForPropertyTable(valueType) {
  let t = unwrapOptional(valueType, { deep: true });
  if (t instanceof UnionType) {
    const objectArms = t.types.filter(u => u instanceof ReflectionType && (u.declaration?.children?.length ?? 0) > 0);
    if (objectArms.length !== 1) {
      return undefined;
    }
    t = /** @type {import('typedoc').ReflectionType} */ (objectArms[0]);
  }
  if (!(t instanceof ReflectionType)) {
    return undefined;
  }
  const kids = t.declaration?.children ?? [];
  return kids.filter(
    c => c.kind === ReflectionKind.Property || c.kind === ReflectionKind.Variable || c.kind === ReflectionKind.Accessor,
  );
}

/**
 * @param {string} parentName
 * @param {import('typedoc').DeclarationReflection} nestedDecl
 * @param {import('typedoc-plugin-markdown').MarkdownThemeContext} ctx
 */
function buildPropertyTableDocMdx(parentName, nestedDecl, ctx) {
  const qualifiedName = `${parentName}.${nestedDecl.name}`;
  const title = `### \`${qualifiedName}\``;
  const description = commentSummaryAndBody(nestedDecl.comment);
  const propsUnsorted = resolveObjectShapeMembersForPropertyTable(nestedDecl.type);
  if (!propsUnsorted?.length) {
    return '';
  }
  /** Match nominal param tables and merged intersection holders: stable A–Z by property name (TypeDoc inline literal `children` order is declaration order). */
  const props = [...propsUnsorted].sort((a, b) => a.name.localeCompare(b.name));
  const tableMd = renderMemberTableOmittingExampleBlocks(props, ctx, () =>
    ctx.partials.propertiesTable(
      props,
      /** @type {Parameters<import('typedoc-plugin-markdown').MarkdownThemeContext['partials']['propertiesTable']>[1]} */
      ({
        kind: ReflectionKind.Interface,
        isEventProps: false,
        applyAllowlistedPropertyTableRowFilters: false,
      }),
    ),
  );
  const chunks = [title, '', description, '', tableMd].filter(Boolean);
  const raw = chunks.join('\n\n');
  return `${applyCatchAllMdReplacements(applyRelativeLinkReplacements(raw)).trim()}\n`;
}

/**
 * Parent-level property table for an `@extractMethods` namespace.
 * Lists non-callable direct members on the namespace (e.g. `verifications.emailAddress`, `verifications.phoneNumber`).
 *
 * @param {import('typedoc').DeclarationReflection} parentDecl
 * @param {import('typedoc').DeclarationReflection[]} nonCallableMembers
 * @param {import('typedoc-plugin-markdown').MarkdownThemeContext} ctx
 */
function buildExtractMethodsNamespacePropertyTableMdx(parentDecl, nonCallableMembers, ctx) {
  if (!nonCallableMembers.length) {
    return '';
  }
  const title = `### \`${parentDecl.name}\``;
  const description = commentSummaryAndBody(parentDecl.comment);
  const props = [...nonCallableMembers].sort((a, b) => a.name.localeCompare(b.name));
  const tableMd = renderMemberTableOmittingExampleBlocks(props, ctx, () =>
    ctx.partials.propertiesTable(
      props,
      /** @type {Parameters<import('typedoc-plugin-markdown').MarkdownThemeContext['partials']['propertiesTable']>[1]} */
      ({
        kind: ReflectionKind.Interface,
        isEventProps: false,
        applyAllowlistedPropertyTableRowFilters: false,
      }),
    ),
  );
  if (!tableMd?.trim()) {
    return '';
  }
  const raw = [title, '', description, '', tableMd].filter(Boolean).join('\n\n');
  return `${applyCatchAllMdReplacements(applyRelativeLinkReplacements(raw)).trim()}\n`;
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
 * Split the `## Properties` section out of page contents, returning the body (no heading) and the page contents with the Properties section removed.
 *
 * Operates on the in-memory `output.contents` of a `MarkdownPageEvent`; the caller writes `properties.mdx` and assigns the stripped string back to `output.contents`. The page's own END pipeline (link replacements) has already run by the time we get called, so the Properties body is in its final, replaced form — no re-application needed.
 *
 * @param {string} contents
 * @returns {{ propertiesBody: string | undefined, stripped: string }}
 */
function splitPropertiesFromContents(contents) {
  if (!contents) {
    return { propertiesBody: undefined, stripped: contents };
  }
  const propertiesBody = extractPropertiesSectionBody(contents);
  const stripped = stripReferenceObjectPropertiesSection(contents);
  return { propertiesBody, stripped };
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
  // Qualified names (`emailCode.sendCode`) aren't valid in `function foo.bar()` syntax; use the bare last segment — the parent is already in the heading above.
  const displayName = memberName.includes('.') ? memberName.split('.').pop() : memberName;
  return `function ${displayName}${typeParamStr}(${params.join(', ')}): ${ret}`;
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

/** Block tags omitted from extracted method prose (see `custom-theme.mjs` `comment` partial for theme output). */
const BLOCK_TAGS_OMITTED_FROM_EXTRACTED_METHOD_PROSE = new Set(['@param', '@typeParam', '@returns', '@experimental']);

/**
 * @param {import('typedoc').Comment | undefined} comment
 */
function commentSummaryAndBody(comment) {
  if (!comment) {
    return '';
  }
  const c = applyTodoStrippingToComment(comment) ?? comment;
  const summary = displayPartsToString(c.summary).trim();
  const block = c.blockTags
    ?.filter(t => !BLOCK_TAGS_OMITTED_FROM_EXTRACTED_METHOD_PROSE.has(t.tag))
    .map(t => displayPartsToString(t.content).trim())
    .filter(Boolean)
    .join('\n\n');
  const returnsLines =
    c.blockTags
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
 * @param {import('typedoc').DeclarationReflection} prop
 */
function propertyReflectionTypeIsNever(prop) {
  const ty = unwrapOptional(prop.type, { deep: true });
  return ty?.type === 'intrinsic' && ty.name === 'never';
}

/**
 * Union discriminators often use `otherProp?: never`. Prefer the branch with a documentable type.
 *
 * @param {import('typedoc').DeclarationReflection} existing
 * @param {import('typedoc').DeclarationReflection} candidate
 */
function pickBetterUnionPropertyCandidate(existing, candidate) {
  const existingNever = propertyReflectionTypeIsNever(existing);
  const candidateNever = propertyReflectionTypeIsNever(candidate);
  if (existingNever && !candidateNever) {
    return candidate;
  }
  if (!existingNever && candidateNever) {
    return existing;
  }
  const existingDoc = existing.comment?.summary?.length ?? 0;
  const candidateDoc = candidate.comment?.summary?.length ?? 0;
  return candidateDoc > existingDoc ? candidate : existing;
}

/**
 * Collect the set of string-literal keys from a type used as the second argument to `Omit` or `Pick` — a single literal (`'organizationId'`) or a union of literals (`'a' | 'b'`). Returns `undefined` if the type isn't a literal/literal-union (e.g. a `keyof` reference we can't resolve here), in which case callers should fall through to the generic-instantiation path.
 *
 * @param {import('typedoc').Type | undefined} t
 * @returns {Set<string> | undefined}
 */
function collectLiteralStringKeys(t) {
  if (!t) {
    return undefined;
  }
  if (t.type === 'literal' && typeof (/** @type {{ value: unknown }} */ (t).value) === 'string') {
    return new Set([/** @type {{ value: string }} */ (t).value]);
  }
  if (t.type === 'union') {
    const u = /** @type {import('typedoc').UnionType} */ (t);
    /** @type {Set<string>} */
    const keys = new Set();
    for (const inner of u.types) {
      const got = collectLiteralStringKeys(inner);
      if (!got) {
        return undefined;
      }
      for (const k of got) keys.add(k);
    }
    return keys.size ? keys : undefined;
  }
  return undefined;
}

/**
 * Filter each arm to `Property` reflections and dedupe by name, returning a single sorted list
 * (or `undefined` if every arm was empty). Used for intersection / union / generic-instantiation
 * arm merges in {@link resolveDeclarationWithObjectMembers}.
 *
 * Default behavior is "later arm wins" overwrite (right for intersections + generic instantiations
 * where every arm's properties are part of the final shape). For unions, set
 * `{ skipNever: true, pickBetter: true }`: union arms often use `prop?: never` as a discriminator,
 * so we drop those and keep the documentable branch when names collide.
 *
 * @param {Array<import('typedoc').DeclarationReflection[] | undefined>} arms
 * @param {{ skipNever?: boolean, pickBetter?: boolean }} [options]
 * @returns {import('typedoc').DeclarationReflection[] | undefined}
 */
function mergePropertyArms(arms, options) {
  /** @type {Map<string, import('typedoc').DeclarationReflection>} */
  const byName = new Map();
  for (const arm of arms) {
    if (!arm?.length) {
      continue;
    }
    for (const c of arm) {
      if (!c.kindOf(ReflectionKind.Property)) {
        continue;
      }
      if (options?.skipNever && propertyReflectionTypeIsNever(c)) {
        continue;
      }
      const existing = byName.get(c.name);
      if (!existing) {
        byName.set(c.name, c);
        continue;
      }
      byName.set(c.name, options?.pickBetter ? pickBetterUnionPropertyCandidate(existing, c) : c);
    }
  }
  if (byName.size === 0) {
    return undefined;
  }
  const merged = [...byName.values()].sort((a, b) => a.name.localeCompare(b.name));
  return substituteTypeParameterDefaultsInChildren(merged);
}

/**
 * Resolve a parameter / property type to the list of `Property` reflections that should populate
 * a nested rows table. TypeDoc applies `@param parent.prop` descriptions onto these reflections.
 *
 * Cases:
 * - `reflection` (inline `{...}`): the declaration's own children.
 * - `reference` to a named interface/alias: the target's children, or — for generic instantiations
 *   like `ClerkPaginationParams<{ status?: … }>` — the base properties merged with each typeArg's.
 * - `intersection`: every `&` arm's properties combined (later arm wins on name collision).
 * - `union`: every `|` arm's properties combined, dropping `prop?: never` discriminators and
 *   preferring the branch with more documentation on collisions.
 * - `optional`: unwrap and recurse.
 *
 * Returns `undefined` when nothing resolves (so callers can `if (!children?.length)` cheaply).
 * The children list may include non-`Property` kinds for direct `reflection` / `reference` cases —
 * callers that need only `Property` should filter; merge cases (typeArgs / intersection / union)
 * pre-filter via {@link mergePropertyArms}.
 *
 * @param {import('typedoc').SomeType | undefined} t
 * @param {import('typedoc').ProjectReflection | undefined} [project] For resolving references when `ref.reflection` is missing (intersections like `Foo & WithOptionalOrgType<…>`).
 * @returns {import('typedoc').DeclarationReflection[] | undefined}
 */
function resolveDeclarationWithObjectMembers(t, project) {
  if (!t) {
    return undefined;
  }
  if (t.type === 'optional') {
    return resolveDeclarationWithObjectMembers(/** @type {import('typedoc').OptionalType} */ (t).elementType, project);
  }
  if (t.type === 'array') {
    return resolveDeclarationWithObjectMembers(/** @type {import('typedoc').ArrayType} */ (t).elementType, project);
  }
  if (t.type === 'reflection') {
    const children = t.declaration?.children;
    return children?.length ? children : undefined;
  }
  if (t.type === 'reference') {
    const ref = /** @type {import('typedoc').ReferenceType} */ (t);
    /**
     * `Omit<X, K>` / `Pick<X, K>` — TypeScript built-in utilities. They have no project reflection to look up, and falling through to the generic-instantiation path below would merge K's properties (zero, since K is a literal type) without applying the filter — Omit/Pick would silently behave like an identity. Resolve `X` to its property list, then keep/drop by the literal-string keys in `K`. Without this, `Array<Omit<X, 'k'>>` shows no nested rows because `decl` is undefined.
     */
    if ((ref.name === 'Omit' || ref.name === 'Pick') && (ref.typeArguments?.length ?? 0) === 2) {
      const baseChildren = resolveDeclarationWithObjectMembers(ref.typeArguments[0], project);
      const keys = collectLiteralStringKeys(ref.typeArguments[1]);
      if (baseChildren?.length && keys) {
        const keep = ref.name === 'Pick' ? c => keys.has(c.name) : c => !keys.has(c.name);
        return baseChildren.filter(keep);
      }
    }
    let decl =
      ref.reflection && 'kind' in ref.reflection
        ? /** @type {import('typedoc').DeclarationReflection} */ (ref.reflection)
        : undefined;
    if (!decl && project && ref.name) {
      decl = lookupInterfaceOrTypeAliasByName(project, ref.name);
    }
    if (!decl) {
      return undefined;
    }
    /**
     * Generic instantiation: TypeDoc often attaches pagination fields only to the target alias's
     * own `children` and omits `decl.type`, so returning the base early drops the type argument
     * object. Merge the base (`decl.type` if present, else `decl.children` as a fallback) with
     * each type argument's properties.
     */
    const typeArgs = ref.typeArguments ?? [];
    if (typeArgs.length > 0) {
      const baseFromType = decl.type ? resolveDeclarationWithObjectMembers(decl.type, project) : undefined;
      const base = baseFromType ?? (decl.children?.length ? decl.children : undefined);
      const argArms = typeArgs.map(ta => resolveDeclarationWithObjectMembers(ta, project));
      return mergePropertyArms([base, ...argArms]);
    }
    if (decl.children?.length) {
      return substituteTypeParameterDefaultsInChildren(decl.children);
    }
    if (decl.type) {
      return resolveDeclarationWithObjectMembers(decl.type, project);
    }
    return undefined;
  }
  if (t.type === 'intersection') {
    const inter = /** @type {import('typedoc').IntersectionType} */ (t);
    return mergePropertyArms(inter.types.map(inner => resolveDeclarationWithObjectMembers(inner, project)));
  }
  if (t.type === 'union') {
    const u = /** @type {import('typedoc').UnionType} */ (t);
    return mergePropertyArms(
      u.types.map(inner => resolveDeclarationWithObjectMembers(inner, project)),
      { skipNever: true, pickBetter: true },
    );
  }
  return undefined;
}

/**
 * Build the name cell for a nominal-nested row. Uses `?.` when the parent param is optional (so `options?.foo` mirrors how it would be accessed at runtime) and `.` when required — same rule as `clerkParametersTable.flattenParams` in `custom-theme.mjs`. Appends `?` to the child name when the child property itself is optional, matching how the inline-flatten path renders `params.field?` via the standard parametersTable.
 *
 * @param {import('typedoc').ParameterReflection} parentParam
 * @param {import('typedoc').DeclarationReflection} child
 */
function formatNestedParamNameColumn(parentParam, child) {
  const sep = parentParam.flags?.isOptional ? '?.' : '.';
  const childOptional = child.flags?.isOptional ? '?' : '';
  return `\`${parentParam.name}${sep}${child.name}${childOptional}\``;
}

/**
 * When TypeDoc renders a parameter type as a markdown link to another generated `.mdx` file, that type has a dedicated page — omit nested `param?.prop` rows so readers follow the type link instead.
 * `@inline` aliases are expanded by the theme and do not link to a standalone page unless `@standalonePage` is set (`standalone-page-tag.mjs`).
 *
 * @param {import('typedoc').SomeType | undefined} t
 * @param {import('typedoc-plugin-markdown').MarkdownThemeContext} ctx
 */
function parameterTypeLinksToStandaloneMdxPage(t, ctx) {
  const bare = unwrapOptional(t);
  if (!bare) {
    return false;
  }
  // `Array<NamedType>`: the standalone page documents the element shape, not the array signature.
  // Surface both — the Type column links to the element page, and nested `params.<field>` rows flatten the element so readers don't have to navigate just to see field names.
  if (bare.type === 'array') {
    return false;
  }
  if (bare.type === 'reference') {
    const ref = /** @type {import('typedoc').ReferenceType} */ (bare);
    if (isInlineModifierWithoutStandalonePage(ref.reflection)) {
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

  const project = /** @type {import('typedoc').ProjectReflection | undefined} */ (param.project ?? ctx.page?.project);
  const children = resolveDeclarationWithObjectMembers(param.type, project);
  if (!children?.length) {
    return [];
  }
  const props = children.filter(c => c.kindOf(ReflectionKind.Property));
  props.sort((a, b) => a.name.localeCompare(b.name));
  /** @type {string[]} */
  const rows = [];
  for (const child of props) {
    const typeCell = child.type ? removeLineBreaksForTableCell(ctx.partials.someType(child.type)) : '`unknown`';
    const nestedNameCol = formatNestedParamNameColumn(param, child);
    const nestedDescRaw = renderNestedRowDescription(child.comment);
    // Strip line breaks so multi-line `<ul>` / paragraph descriptions don't shatter the markdown
    // table row (which must be a single line). Matches the treatment already applied to typeCell.
    const nestedDesc = removeLineBreaksForTableCell(nestedDescRaw) ?? '—';
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
 * Unwrap optional wrappers. When the parameter is a single named interface or type alias for an
 * object shape, returns the section title (the type's name), the resolved property list, and the
 * source `typeDecl` for `@experimental` / `@deprecated` checks.
 *
 * @param {import('typedoc').SomeType | undefined} t
 * @param {import('typedoc').ProjectReflection} project
 * @returns {{ sectionTitle: string, children: import('typedoc').DeclarationReflection[], typeDecl: import('typedoc').DeclarationReflection } | undefined}
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
  if (t.type !== 'reference') {
    return undefined;
  }
  const ref = /** @type {import('typedoc').ReferenceType} */ (t);
  const typeDecl =
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
    return { sectionTitle: typeDecl.name, children: typeDecl.children, typeDecl };
  }
  if (typeDecl.kindOf(ReflectionKind.TypeAlias)) {
    // Prefer resolving `typeAlias.type` so intersections and generic instantiations (e.g. `ClerkPaginationParams<{ status?: … }>`) merge every `&` arm into one property list.
    // Some aliases only attach members on `typeDecl.children` with no object shape on `.type`; keep that fallback (e.g. `SignOutOptions`, `JoinWaitlistParams`).
    const fromResolvedType = typeDecl.type ? resolveDeclarationWithObjectMembers(typeDecl.type, project) : undefined;
    const children = fromResolvedType?.length ? fromResolvedType : typeDecl.children;
    if (!children?.length) {
      return undefined;
    }
    return { sectionTitle: typeDecl.name, children, typeDecl };
  }
  return undefined;
}

/**
 * Nominal param sections are skipped when there is no prose anywhere — avoids huge undocumented tables.
 * Type-only aliases often use `@experimental` / `@deprecated` on the type with an empty summary; intersection params like `GetPaymentAttemptParams` still have documented arms (`id`, pagination) and must inline.
 *
 * @param {import('typedoc').DeclarationReflection} typeDecl
 * @param {import('typedoc').DeclarationReflection[]} props
 */
function isNominalParamTypeDocumented(typeDecl, props) {
  if (typeDecl.comment?.summary?.length) {
    return true;
  }
  const blockTags = typeDecl.comment?.blockTags ?? [];
  if (blockTags.some(t => t.tag !== '@inline')) {
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
/**
 * @param {import('typedoc').SignatureReflection} sig
 * @param {import('typedoc-plugin-markdown').MarkdownThemeContext} ctx
 * @param {number} [headingLevel] Defaults to 4 (reference-object format); pass 2 for page format.
 */
function trySingleNominalParameterTypeSection(sig, ctx, headingLevel = 4) {
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
  const props = nominal.children.filter(c => c.kindOf(ReflectionKind.Property));
  if (props.length === 0) {
    return undefined;
  }
  if (!isNominalParamTypeDocumented(nominal.typeDecl, props)) {
    return undefined;
  }
  const tableMd = renderMemberTableOmittingExampleBlocks(props, ctx, () =>
    ctx.partials.propertiesTable(
      props,
      /** @type {Parameters<import('typedoc-plugin-markdown').MarkdownThemeContext['partials']['propertiesTable']>[1]} */
      ({
        kind: nominal.typeDecl.kind,
        isEventProps: false,
        applyAllowlistedPropertyTableRowFilters: false,
      }),
    ),
  );
  if (!tableMd?.trim()) {
    return undefined;
  }
  return [markdownHeadingInlineCode(headingLevel, nominal.sectionTitle), '', tableMd, ''].join('\n');
}

/**
 * @param {import('typedoc').SignatureReflection} sig
 * @param {import('typedoc-plugin-markdown').MarkdownThemeContext} ctx
 * @param {Map<string, import('typedoc').Type> | undefined} instantiationMap
 * @param {number} [headingLevel] Defaults to 4 (reference-object format); pass 2 for page format.
 */
function parametersMarkdownTable(sig, ctx, instantiationMap, headingLevel = 4) {
  const sigForDisplay = signatureWithInstantiation(sig, instantiationMap);
  const params = sigForDisplay.parameters ?? [];
  if (params.length === 0) {
    return '';
  }

  const singleNominal = trySingleNominalParameterTypeSection(sigForDisplay, ctx, headingLevel);
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
    tableMd = `${tableMd.trimEnd()}\n${nested.join('\n')}\n`;
  }

  return [markdownHeading(headingLevel, ReflectionKind.pluralString(ReflectionKind.Parameter)), '', tableMd, ''].join(
    '\n',
  );
}

/**
 * @param {import('typedoc').DeclarationReflection} decl
 * @param {import('typedoc-plugin-markdown').MarkdownThemeContext} ctx
 * @param {{ qualifiedName?: string, methodFormat?: MethodFormat }} [options] Nested namespace methods use `parent.child` for headings / signatures.
 */
function buildMethodMdx(decl, ctx, options = {}) {
  const name = options.qualifiedName ?? decl.name;
  const methodFormat = options.methodFormat ?? 'reference';
  const sig = getPrimaryCallSignature(decl);
  if (!sig) {
    return '';
  }
  // `'page'` format renders one method per docs page, so the page is anchored by a containing file/heading upstream — no in-page `### foo()` title needed. `'reference'` format aggregates many methods on one page and uses `### foo()` to disambiguate them.
  const title = methodFormat === 'page' ? '' : `### \`${name}()\``;
  const paramsHeadingLevel = methodFormat === 'page' ? 2 : 4;
  /** Prefer the declaration comment (property-style methods document `addListener` on the property, not the signature). */
  const comment = decl.comment ?? sig.comment;
  let description = commentSummaryAndBody(comment);
  const sigReturns = comment === sig.comment ? '' : appendSignatureOnlyReturns(decl.comment, sig.comment);
  if (sigReturns) {
    description = [description, sigReturns].filter(Boolean).join('\n\n');
  }
  const instantiationMap = getGenericInstantiationMapFromCallableProperty(decl);
  const ts = ['```typescript', formatTypeScriptSignature(sig, name, instantiationMap), '```'].join('\n');
  const skipParametersSection =
    Boolean(decl.comment?.hasModifier('@skipParametersSection')) ||
    Boolean(sig.comment?.hasModifier('@skipParametersSection'));
  if (!skipParametersSection) {
    overlayParamCommentsFromSignatureBlockTags(sig);
  }
  const paramsMd = skipParametersSection ? '' : parametersMarkdownTable(sig, ctx, instantiationMap, paramsHeadingLevel);

  // Same post-process as `custom-plugin.mjs` `MarkdownPageEvent.END`: relative `.mdx` links, then catch-alls.
  // Skip the ```typescript``` fence so signatures stay plain code.
  const headSource = title ? [title, '', description].join('\n') : description;
  const head = applyCatchAllMdReplacements(applyRelativeLinkReplacements(headSource));
  const paramsProcessed = paramsMd ? applyCatchAllMdReplacements(applyRelativeLinkReplacements(paramsMd)) : '';
  const chunks = head ? [head, ts] : [ts];
  if (paramsProcessed) {
    chunks.push(paramsProcessed);
  }
  return chunks.join('\n\n').trim() + '\n';
}

/**
 * @param {import('typedoc').DeclarationReflection} decl
 */
function hasExtractMethodsModifier(decl) {
  return Boolean(decl.comment?.hasModifier('@extractMethods'));
}

/**
 * @typedef {{ filePath: string, content: string }} ExtractedFile
 */

/**
 * Collect `methods/<parent>-<child>.mdx` content for each direct member of an `@extractMethods` object-like type: callables via {@link buildMethodMdx}, non-callables with a resolvable object shape via {@link buildPropertyTableDocMdx}. Plus a `<parent>.mdx` index for non-callable members.
 *
 * Supports inline object literals and named references (`interface` / object-like `type` aliases) via {@link resolveDeclarationWithObjectMembers}.
 *
 * @param {import('typedoc').DeclarationReflection} parentDecl
 * @param {import('typedoc-plugin-markdown').MarkdownThemeContext} ctx
 * @param {string} outDir
 * @returns {ExtractedFile[]}
 */
function processExtractMethodsNamespace(parentDecl, ctx, outDir) {
  const project = ctx.page?.project;
  const members = resolveDeclarationWithObjectMembers(parentDecl.type, project) ?? [];
  if (members.length === 0) {
    console.warn(
      `[extract-methods] @extractMethods on "${parentDecl.name}" requires an object-like type with members; skipping nested extraction`,
    );
    return [];
  }
  const parentName = parentDecl.name;
  /** @type {ExtractedFile[]} */
  const collected = [];
  /** @type {import('typedoc').DeclarationReflection[]} */
  const nonCallableMembers = [];
  for (const nested of members) {
    if (nested.name.startsWith('__')) {
      continue;
    }
    const nd = /** @type {import('typedoc').DeclarationReflection} */ (nested);
    const fileSlug = `${toFileSlug(parentName)}-${toFileSlug(nd.name)}`;
    const filePath = path.join(outDir, `${fileSlug}.mdx`);
    if (shouldExtractCallableMember(nd, ctx)) {
      const mdx = buildMethodMdx(nd, ctx, { qualifiedName: `${parentName}.${nd.name}` });
      if (!mdx) {
        continue;
      }
      collected.push({ filePath, content: mdx });
      continue;
    }
    nonCallableMembers.push(nd);
    const propTableMdx = buildPropertyTableDocMdx(parentName, nd, ctx);
    if (!propTableMdx) {
      continue;
    }
    collected.push({ filePath, content: propTableMdx });
  }
  if (nonCallableMembers.length) {
    const namespaceMdx = buildExtractMethodsNamespacePropertyTableMdx(parentDecl, nonCallableMembers, ctx);
    if (namespaceMdx) {
      const namespacePath = path.join(outDir, `${toFileSlug(parentName)}.mdx`);
      collected.push({ filePath: namespacePath, content: namespaceMdx });
    }
  }
  return collected;
}

/**
 * Collect (path, content) pairs for each callable/`@extractMethods` child on `decl`. Callers are responsible for writing — see {@link load} which prettifies then writes.
 *
 * @param {import('typedoc').DeclarationReflection} decl
 * @param {import('typedoc-plugin-markdown').MarkdownThemeContext} ctx
 * @param {string} outDir
 * @param {MethodFormat} [methodFormat]
 * @returns {ExtractedFile[]}
 */
function extractCallableMembersFromDeclaration(decl, ctx, outDir, methodFormat = 'reference') {
  if (!decl.children) {
    return [];
  }
  /** @type {ExtractedFile[]} */
  const collected = [];
  for (const child of decl.children) {
    if (child.name.startsWith('__')) {
      continue;
    }
    const childDecl = /** @type {import('typedoc').DeclarationReflection} */ (child);

    if (hasExtractMethodsModifier(childDecl)) {
      collected.push(...processExtractMethodsNamespace(childDecl, ctx, outDir));
      continue;
    }

    if (shouldExtractCallableMember(childDecl, ctx)) {
      const mdx = buildMethodMdx(childDecl, ctx, { methodFormat });
      if (mdx) {
        const fileName = `${toFileSlug(child.name)}.mdx`;
        const filePath = path.join(outDir, fileName);
        collected.push({ filePath, content: mdx });
      }
    }
  }
  return collected;
}

/**
 * @param {import('typedoc-plugin-markdown').MarkdownPageEvent<import('typedoc').Reflection>} output
 * @returns {string | undefined}
 */
function matchReferenceObjectPageUrl(output) {
  if (!output.url) {
    return undefined;
  }
  const normalized = output.url.replace(/\\/g, '/');
  if (normalized in REFERENCE_OBJECT_CONFIG) return normalized;
  if (normalized in BACKEND_API_CONFIG) return normalized;
  return undefined;
}

/** @param {string} pageUrl */
function configEntryForPageUrl(pageUrl) {
  return /** @type {import('./reference-objects.mjs').REFERENCE_OBJECT_CONFIG[keyof typeof REFERENCE_OBJECT_CONFIG]} */ (
    REFERENCE_OBJECT_CONFIG[/** @type {keyof typeof REFERENCE_OBJECT_CONFIG} */ (pageUrl)] ??
      BACKEND_API_CONFIG[/** @type {keyof typeof BACKEND_API_CONFIG} */ (pageUrl)]
  );
}

/**
 * Plugin entry: registers a `MarkdownPageEvent.END` listener that, for each page in {@link REFERENCE_OBJECT_CONFIG}, queues a `preWriteAsyncJob` to extract Properties + methods.
 *
 * The job runs **after** typedoc-plugin-markdown's own prettier job (also a `preWriteAsyncJob`, queued during `renderDocument`) — so by the time we read `output.contents`, the Properties table is already prettier-formatted, and our `properties.mdx` inherits that formatting. Method files are written raw (matching the pre-refactor behavior, where extract-methods.mjs also bypassed prettier for `methods/*.mdx`).
 *
 * Must be loaded **after** `custom-plugin.mjs` so its END listener (link replacements + heading filtering) runs first.
 *
 * @param {import('typedoc-plugin-markdown').MarkdownApplication} app
 */
export function load(app) {
  app.renderer.on(MarkdownPageEvent.END, output => {
    const pageUrl = matchReferenceObjectPageUrl(output);
    if (!pageUrl) {
      return;
    }
    const entry = configEntryForPageUrl(pageUrl);
    const methodFormat = methodFormatForPageUrl(pageUrl);
    const decl = /** @type {import('typedoc').DeclarationReflection | undefined} */ (output.model);
    if (!decl?.children) {
      console.warn(`[extract-methods] No children on reflection for ${pageUrl}, skipping`);
      return;
    }
    const project = output.project;
    if (!project) {
      console.warn(`[extract-methods] No project on page event for ${pageUrl}, skipping`);
      return;
    }
    const theme = /** @type {InstanceType<typeof import('typedoc-plugin-markdown').MarkdownTheme> | undefined} */ (
      app.renderer.theme
    );
    if (!theme || typeof theme.getRenderContext !== 'function') {
      console.warn(`[extract-methods] Renderer theme not ready for ${pageUrl}, skipping`);
      return;
    }
    const ctx = /** @type {import('typedoc-plugin-markdown').MarkdownThemeContext} */ (theme.getRenderContext(output));

    const objectDir = path.dirname(output.filename);
    const outDir = path.join(objectDir, 'methods');

    /** @type {ExtractedFile[]} */
    const methodFiles = extractCallableMembersFromDeclaration(decl, ctx, outDir, methodFormat);
    const extraMethodInterfaces = 'extraMethodInterfaces' in entry ? entry.extraMethodInterfaces : undefined;
    if (Array.isArray(extraMethodInterfaces)) {
      for (const extra of extraMethodInterfaces) {
        const extraDecl = findInterfaceOrClass(project, extra.symbol, extra.declarationHint);
        if (!extraDecl?.children) {
          console.warn(`[extract-methods] extraMethodInterfaces: could not find "${extra.symbol}" for ${pageUrl}`);
          continue;
        }
        methodFiles.push(...extractCallableMembersFromDeclaration(extraDecl, ctx, outDir, methodFormat));
      }
    }

    output.preWriteAsyncJobs.push(() => {
      fs.mkdirSync(objectDir, { recursive: true });

      // `output.contents` is already prettier-formatted by typedoc-plugin-markdown's earlier
      // pre-write job. Extract the Properties body from it (also formatted), write it out,
      // then strip the section so the main page no longer ships it.
      const { propertiesBody, stripped } = splitPropertiesFromContents(output.contents ?? '');
      if (propertiesBody) {
        const propertiesPath = path.join(objectDir, 'properties.mdx');
        fs.writeFileSync(propertiesPath, `${propertiesBody.trimEnd()}\n`, 'utf-8');
        console.log(`[extract-methods] Wrote ${path.relative(path.join(__dirname, '..'), propertiesPath)}`);
      }
      if (stripped && stripped !== output.contents) {
        output.contents = stripped;
      }

      if (methodFiles.length === 0) {
        return;
      }
      fs.mkdirSync(outDir, { recursive: true });
      for (const { filePath, content } of methodFiles) {
        fs.writeFileSync(filePath, content, 'utf-8');
        console.log(`[extract-methods] Wrote ${path.relative(path.join(__dirname, '..'), filePath)}`);
      }
      console.log(`[extract-methods] ${pageUrl}: wrote ${methodFiles.length} method file(s)`);
    });
  });
}
