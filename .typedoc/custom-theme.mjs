// @ts-check
import {
  ArrayType,
  Comment,
  i18n,
  IntersectionType,
  OptionalType,
  ReferenceType,
  ReflectionKind,
  ReflectionType,
  UnionType,
} from 'typedoc';
import { MarkdownPageEvent, MarkdownTheme, MarkdownThemeContext } from 'typedoc-plugin-markdown';

import { applyTodoStrippingToComment } from './comment-utils.mjs';
import { applyCatchAllMdReplacements, applyRelativeLinkReplacements } from './custom-plugin.mjs';
import { backTicks, escapeChars, heading, htmlTable, removeLineBreaks, table } from './markdown-helpers.mjs';
import { BACKEND_API_CONFIG, REFERENCE_OBJECT_CONFIG, REFERENCE_OBJECTS_LIST } from './reference-objects.mjs';
import { toFileSlug } from './slug.mjs';
import { isInlineModifierWithoutStandalonePage } from './standalone-page-tag.mjs';
import { unwrapOptional } from './type-utils.mjs';

/**
 * Stock `typedoc-plugin-markdown` `arrayType` only wraps `elementType.type === 'union'`.
 * For `T | T[]` where `T` is an `@inline` alias to a union, the element is still a `reference` in the model but renders as `"a" \| "b"`, producing `"a" \| "b"[]` (wrong binding). Instead, parens the array type whenever the reference inlines to a union RHS so it produces `("a" \| "b")[]`.
 * E.g. `status` in `GetUserOrganizationSuggestionsParams`.
 *
 * @param {import('typedoc').Type | undefined} elementType
 * @returns {boolean}
 */
function isArrayElementReferenceInliningToUnion(elementType) {
  if (!(elementType instanceof ReferenceType) || !elementType.reflection) {
    return false;
  }
  if (!isInlineModifierWithoutStandalonePage(elementType.reflection)) {
    return false;
  }
  const decl = /** @type {import('typedoc').DeclarationReflection} */ (elementType.reflection);
  if (!decl.kindOf?.(ReflectionKind.TypeAlias) || !decl.type) {
    return false;
  }
  return decl.type instanceof UnionType;
}

/**
 * When `ReferenceType.reflection` is unset (common for imported aliases), resolve by name in the converted project.
 *
 * @param {import('typedoc').ProjectReflection | undefined} project
 * @param {string} name
 * @returns {import('typedoc').DeclarationReflection | undefined}
 */
function findNamedTypeDeclaration(project, name) {
  if (!project?.reflections) {
    return undefined;
  }
  for (const r of Object.values(project.reflections)) {
    if (r.name !== name) {
      continue;
    }
    if (r.kind === ReflectionKind.TypeAlias || r.kind === ReflectionKind.Interface) {
      return /** @type {import('typedoc').DeclarationReflection} */ (r);
    }
  }
  return undefined;
}

/**
 * Prefer `packages/shared/src/types/strategies.ts` when multiple type aliases share the name `OAuthStrategy` (also declared in `packages/backend`).
 *
 * @param {import('typedoc').ProjectReflection | undefined} project
 * @returns {import('typedoc').DeclarationReflection | undefined}
 */
function findOAuthStrategyDeclaration(project) {
  if (!project) {
    return undefined;
  }
  const candidates = /** @type {import('typedoc').DeclarationReflection[]} */ (
    project.getReflectionsByKind(ReflectionKind.TypeAlias).filter(r => r.name === 'OAuthStrategy')
  );
  if (candidates.length <= 1) {
    return candidates[0];
  }
  const fromStrategies = candidates.find(r =>
    (r.sources?.[0]?.fileName ?? '').replace(/\\/g, '/').includes('strategies'),
  );
  return fromStrategies ?? candidates[0];
}

/**
 * TypeScript normalizes `OAuthStrategy` to a large union of `oauth_*` string literals plus `` `oauth_custom_${string}` ``. That is not a {@link ReferenceType}, so the theme prints every literal. Collapse **only** when the union clearly matches that expanded Clerk shape, then render a link to `OAuthStrategy`.
 *
 * Guards (all must pass): many `oauth_` literals, fingerprint literals present, optional `oauth_custom_` template arm, `OAuthStrategy` exists and is not `@inline`. Skips ambiguous cases so other unions are unchanged.
 *
 * @param {import('typedoc').Type | undefined} t
 * @returns {import('typedoc').Type[]}
 */
function flattenUnionTypeMembersForOAuthCollapse(t) {
  if (!t) {
    return [];
  }
  if (t instanceof UnionType) {
    /** @type {import('typedoc').Type[]} */
    const acc = [];
    for (const inner of t.types) {
      acc.push(...flattenUnionTypeMembersForOAuthCollapse(inner));
    }
    return acc;
  }
  return [t];
}

/**
 * @param {import('typedoc').Type} t
 */
function isExpandedOAuthStrategyUnionArm(t) {
  const o = /** @type {{ type?: string; value?: unknown; head?: string; tail?: unknown }} */ (t);
  if (o.type === 'literal' && typeof o.value === 'string') {
    return o.value.startsWith('oauth_');
  }
  if (o.type === 'templateLiteral' && typeof o.head === 'string') {
    return o.head === 'oauth_custom_';
  }
  return false;
}

/** Minimum distinct `oauth_*` literal arms before we treat the union as “expanded OAuthStrategy”. */
const OAUTH_STRATEGY_COLLAPSE_MIN_LITERAL_ARMS = 12;

/**
 * @param {import('typedoc').UnionType} model
 * @param {import('typedoc-plugin-markdown').MarkdownThemeContext} ctx
 * @returns {import('typedoc').UnionType | undefined}
 */
function tryCollapseExpandedOAuthStrategyUnion(model, ctx) {
  const project = ctx.page?.project;
  if (!project) {
    return undefined;
  }
  const oauthDecl = findOAuthStrategyDeclaration(project);
  if (!oauthDecl?.kindOf(ReflectionKind.TypeAlias)) {
    return undefined;
  }
  if (oauthDecl.comment?.hasModifier('@inline')) {
    return undefined;
  }

  const members = flattenUnionTypeMembersForOAuthCollapse(model);
  const oauthArms = members.filter(isExpandedOAuthStrategyUnionArm);
  if (oauthArms.length < OAUTH_STRATEGY_COLLAPSE_MIN_LITERAL_ARMS) {
    return undefined;
  }

  const literalVals = oauthArms
    .filter(u => /** @type {{ type?: string }} */ (u).type === 'literal')
    .map(u => /** @type {{ value?: unknown }} */ (/** @type {unknown} */ (u)).value)
    .filter(/** @return {v is string} */ v => typeof v === 'string');
  const literalSet = new Set(literalVals);
  if (!literalSet.has('oauth_google') || (!literalSet.has('oauth_facebook') && !literalSet.has('oauth_github'))) {
    return undefined;
  }

  const hasCustomTemplateArm = oauthArms.some(u => {
    const o = /** @type {{ type?: string; head?: string }} */ (u);
    return o.type === 'templateLiteral' && o.head === 'oauth_custom_';
  });
  /** Without the template arm, require an even larger literal set (avoids small hand-written unions). */
  if (!hasCustomTemplateArm && literalVals.length < 20) {
    return undefined;
  }

  const ref = ReferenceType.createResolvedReference('OAuthStrategy', oauthDecl, project);
  /** @type {import('typedoc').Type[]} */
  const out = [];
  let i = 0;
  while (i < members.length) {
    if (isExpandedOAuthStrategyUnionArm(members[i])) {
      out.push(ref);
      i++;
      while (i < members.length && isExpandedOAuthStrategyUnionArm(members[i])) {
        i++;
      }
    } else {
      out.push(members[i]);
      i++;
    }
  }
  return new UnionType(/** @type {import('typedoc').SomeType[]} */ (/** @type {unknown} */ (out)));
}

/**
 * Collect documented property reflections from one intersection arm (object literal, type alias, interface, nested `&`).
 * E.g. `{ a: string } & { b: number }` => `[{ name: 'a', type: 'string' }, { name: 'b', type: 'number' }]`
 *
 * @param {import('typedoc').Type} t
 * @param {Set<number>} visitedReflectionIds
 * @param {import('typedoc').ProjectReflection | undefined} project
 * @returns {import('typedoc').DeclarationReflection[]}
 */
function collectPropertyReflectionsFromIntersectionArm(t, visitedReflectionIds, project) {
  const unwrapped = unwrapOptional(t);
  if (!unwrapped) {
    return [];
  }

  if (unwrapped instanceof ReflectionType) {
    const decl = unwrapped.declaration;
    if (!decl) {
      return [];
    }
    if (decl.signatures?.length && !decl.children?.length) {
      return [];
    }
    return (decl.children ?? []).filter(c => c.kind === ReflectionKind.Property);
  }

  if (unwrapped instanceof ReferenceType) {
    let ref = unwrapped.reflection;
    if (!ref && unwrapped.name && project) {
      ref = findNamedTypeDeclaration(project, unwrapped.name);
    }
    if (!ref) {
      return [];
    }
    const declRef = /** @type {import('typedoc').DeclarationReflection | undefined} */ (
      'kind' in ref ? ref : undefined
    );
    if (!declRef) {
      return [];
    }
    const id = declRef.id;
    if (id != null) {
      if (visitedReflectionIds.has(id)) {
        return [];
      }
      visitedReflectionIds.add(id);
    }
    try {
      if (declRef.kind === ReflectionKind.TypeAlias) {
        if (declRef.children?.length) {
          return declRef.children.filter(
            /** @param {import('typedoc').DeclarationReflection} c */
            c => c.kind === ReflectionKind.Property,
          );
        }
        if (declRef.type) {
          return collectPropertyReflectionsFromIntersectionArm(declRef.type, visitedReflectionIds, project);
        }
        return [];
      }
      if (
        (declRef.kind === ReflectionKind.Interface || declRef.kind === ReflectionKind.Class) &&
        declRef.children?.length
      ) {
        return declRef.children.filter(
          /** @param {import('typedoc').DeclarationReflection} c */
          c => c.kind === ReflectionKind.Property,
        );
      }
    } finally {
      if (id != null) {
        visitedReflectionIds.delete(id);
      }
    }
    return [];
  }

  if (unwrapped instanceof IntersectionType) {
    /** @type {import('typedoc').DeclarationReflection[]} */
    const out = [];
    for (const arm of unwrapped.types) {
      out.push(...collectPropertyReflectionsFromIntersectionArm(arm, visitedReflectionIds, project));
    }
    return out;
  }

  if (unwrapped instanceof UnionType) {
    return collectPropertyReflectionsFromUnionObjectArms(unwrapped, visitedReflectionIds, project);
  }

  return [];
}

/**
 * Merge intersection arms into one property list (later duplicate names override earlier ones, then sort by name).
 * type A = type B & type C; type A's properties will be the union of B's and C's properties.
 * E.g. `ClerkOptions` in clerk.ts
 *
 * @param {import('typedoc').IntersectionType} intersection
 * @param {import('typedoc').ProjectReflection | undefined} project
 * @returns {import('typedoc').DeclarationReflection[]}
 */
function mergeIntersectionPropertyReflections(intersection, project) {
  /** @type {Map<string, import('typedoc').DeclarationReflection>} */
  const byName = new Map();
  const visited = new Set();
  for (const arm of intersection.types) {
    for (const p of collectPropertyReflectionsFromIntersectionArm(arm, visited, project)) {
      byName.set(p.name, p);
    }
  }
  return [...byName.values()].sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * For properties typed something like `false \| { a?: … }`, `getFlattenedDeclarations` does not walk the union, so nested keys never become table rows. Collect object members from each union arm (primitives/literals yield nothing).
 * E.g. `telemetry` prop in clerk.ts
 *
 * @param {import('typedoc').Type | undefined} t
 * @param {Set<number>} visitedReflectionIds
 * @param {import('typedoc').ProjectReflection | undefined} project
 * @returns {import('typedoc').DeclarationReflection[]}
 */
function collectPropertyReflectionsFromUnionObjectArms(t, visitedReflectionIds, project) {
  const unwrapped = unwrapOptional(t);
  if (!unwrapped || /** @type {{ type?: string }} */ (unwrapped).type !== 'union') {
    return [];
  }
  const union = /** @type {import('typedoc').UnionType} */ (unwrapped);
  /** @type {Map<string, import('typedoc').DeclarationReflection>} */
  const byName = new Map();
  for (const arm of union.types) {
    for (const p of collectPropertyReflectionsFromIntersectionArm(arm, visitedReflectionIds, project)) {
      byName.set(p.name, p);
    }
  }
  return [...byName.values()].sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Appends `parent.child` rows for union object arms (e.g. `false \| { disabled?: … }`). **Only** used when building {@link clerkTypeDeclarationTable}; we intentionally do **not** hook `helpers.getFlattenedDeclarations` globally — otherwise top-level `propertiesTable` output (e.g. `Clerk`) would gain synthetic rows like `client.*` for every property whose type is a union such as `ClientResource \| undefined`.
 *
 * @template {import('typedoc').DeclarationReflection} T
 * @param {T[]} base
 * @param {import('typedoc-plugin-markdown').MarkdownThemeContext['helpers']} helpers
 * @param {import('typedoc').ProjectReflection} project
 * @returns {T[]}
 */
function appendUnionObjectChildPropertyRows(base, helpers, project) {
  /** @type {T[]} */
  const out = [];
  for (const prop of base) {
    out.push(prop);
    if (prop.name.includes('.')) {
      continue;
    }
    const nested = collectPropertyReflectionsFromUnionObjectArms(helpers.getDeclarationType(prop), new Set(), project);
    for (const child of nested) {
      out.push(
        /** @type {T} */ (
          /** @type {unknown} */ ({
            ...child,
            name: `${prop.name}.${child.name}`,
            getFullName: () => prop.getFullName(),
            getFriendlyFullName: () => prop.getFriendlyFullName(),
          })
        ),
      );
    }
  }
  return out;
}

/**
 * @param {import('typedoc').ParameterReflection[]} parameters
 */
function hasDefaultValuesForParameters(parameters) {
  const defaultValues = parameters.map(
    param => param.defaultValue !== '{}' && param.defaultValue !== '...' && !!param.defaultValue,
  );
  return !defaultValues.every(value => !value);
}

/**
 * Object shape for a parameter: inline `{ … }`, optional-wrapped, or reference to a type alias / interface.
 *
 * @param {import('typedoc').Type | undefined} t
 * @returns {import('typedoc').DeclarationReflection | undefined}
 */
function getParameterObjectShapeDeclaration(t) {
  if (!t || typeof t !== 'object') {
    return undefined;
  }
  const o =
    /** @type {{ type?: string; declaration?: import('typedoc').DeclarationReflection; elementType?: import('typedoc').Type }} */ (
      /** @type {unknown} */ (t)
    );
  if (o.type === 'optional' && o.elementType) {
    return getParameterObjectShapeDeclaration(o.elementType);
  }
  if (o.type === 'reflection' && o.declaration) {
    const d = o.declaration;
    if (d.kind === ReflectionKind.TypeLiteral || d.kind === ReflectionKind.Interface) {
      return d;
    }
  }
  if (o.type === 'reference') {
    const ref = /** @type {import('typedoc').ReferenceType} */ (t);
    const sym = ref.reflection;
    if (!sym) {
      return undefined;
    }
    const target = /** @type {import('typedoc').DeclarationReflection} */ (sym);
    if (sym.kind === ReflectionKind.TypeAlias && target.type) {
      return getParameterObjectShapeDeclaration(target.type);
    }
    if (sym.kind === ReflectionKind.Interface) {
      return target;
    }
  }
  return undefined;
}

/**
 * Same as typedoc-plugin-markdown `member.parametersTable`, but avoids useless duplicate rows when a one-property object has **no** property-level JSDoc (the description lives only on `@param`). When the sole property **does** have its own documentation, we flatten so both rows appear.
 *
 * @param {import('typedoc').DeclarationReflection | undefined} decl
 */
function shouldFlattenInlineObjectParameter(decl) {
  if (!decl?.children?.length) {
    return false;
  }
  if (decl.kind !== ReflectionKind.TypeLiteral && decl.kind !== ReflectionKind.Interface) {
    return false;
  }
  if (decl.children.length > 1) {
    return true;
  }
  const only = decl.children[0];
  return Boolean(only?.comment?.hasVisibleComponent());
}

/**
 * Same as typedoc-plugin-markdown `member.parametersTable`, with `shouldFlattenInlineObjectParameter` and `getParameterObjectShapeDeclaration`.
 *
 * @this {import('typedoc-plugin-markdown').MarkdownThemeContext}
 * @param {import('typedoc').ParameterReflection[]} model
 */
function clerkParametersTable(model) {
  const tableColumnsOptions = /** @type {{ leftAlignHeaders?: boolean; hideDefaults?: boolean }} */ (
    this.options.getValue('tableColumnSettings') ?? {}
  );
  const leftAlignHeadings = tableColumnsOptions.leftAlignHeaders;
  /**
   * @param {import('typedoc').ParameterReflection} current
   * @param {import('typedoc').ParameterReflection[]} acc
   * @returns {import('typedoc').ParameterReflection[]}
   */
  const parseParams = (current, acc) => {
    const decl = getParameterObjectShapeDeclaration(current.type);
    const shouldFlatten = shouldFlattenInlineObjectParameter(decl);
    return shouldFlatten ? [...acc, current, ...flattenParams(current)] : [...acc, current];
  };
  /**
   * Joins flattened names with `?.` when the parent is optional (so `options?.foo` reflects the type at runtime) and `.` when required (`options.foo`). Same logic recurses for deeper inline shapes: separator between each level depends on **that** level's optionality.
   *
   * @param {import('typedoc').ParameterReflection} current
   * @returns {import('typedoc').ParameterReflection[]}
   */
  const flattenParams = current => {
    const decl = getParameterObjectShapeDeclaration(current.type);
    const separator = current.flags?.isOptional ? '?.' : '.';
    return (
      decl?.children?.reduce(
        /**
         * @param {import('typedoc').ParameterReflection[]} acc
         * @param {import('typedoc').DeclarationReflection} child
         * @returns {import('typedoc').ParameterReflection[]}
         */
        (acc, child) => {
          const childObj = {
            ...child,
            name: `${current.name}${separator}${child.name}`,
          };
          return parseParams(
            /** @type {import('typedoc').ParameterReflection} */ (/** @type {unknown} */ (childObj)),
            acc,
          );
        },
        /** @type {import('typedoc').ParameterReflection[]} */ ([]),
      ) ?? []
    );
  };
  const showDefaults = !tableColumnsOptions.hideDefaults && hasDefaultValuesForParameters(model);
  const parsedParams = /** @type {import('typedoc').ParameterReflection[]} */ (
    model.reduce(
      (acc, current) => parseParams(current, acc),
      /** @type {import('typedoc').ParameterReflection[]} */ ([]),
    )
  );
  const hasComments = parsedParams.some(param => Boolean(param.comment));
  const theme = /** @type {Record<string, () => string>} */ (/** @type {unknown} */ (i18n));
  const headers = [ReflectionKind.singularString(ReflectionKind.Parameter), theme.theme_type()];
  if (showDefaults) {
    headers.push(theme.theme_default_value());
  }
  if (hasComments) {
    headers.push(theme.theme_description());
  }
  const firstOptionalParamIndex = model.findIndex(parameter => parameter.flags.isOptional);
  /** @type {string[][]} */
  const rows = [];
  parsedParams.forEach((parameter, i) => {
    const row = [];
    const isOptional = parameter.flags.isOptional || (firstOptionalParamIndex !== -1 && i > firstOptionalParamIndex);
    const rest = parameter.flags?.isRest ? '...' : '';
    const optional = isOptional ? '?' : '';
    row.push(`${rest}${backTicks(`${parameter.name}${optional}`)}`);
    if (parameter.type) {
      const displayType =
        parameter.type instanceof ReflectionType
          ? this.partials.reflectionType(parameter.type, {
              forceCollapse: true,
            })
          : this.partials.someType(parameter.type);
      row.push(removeLineBreaks(displayType));
    }
    if (showDefaults) {
      row.push(backTicks(this.helpers.getParameterDefaultValue(parameter)));
    }
    if (hasComments) {
      if (parameter.comment) {
        row.push(this.partials.comment(parameter.comment, { isTableColumn: true }));
      } else {
        row.push('-');
      }
    }
    rows.push(row);
  });
  return this.options.getValue('parametersFormat') == 'table'
    ? table(headers, rows, leftAlignHeadings)
    : htmlTable(headers, rows, leftAlignHeadings);
}

/**
 * Used in `clerkTypeDeclarationTable()` to determine if the table should be displayed as an HTML table.
 *
 * @param {import('typedoc-plugin-markdown').MarkdownThemeContext} context
 * @param {import('typedoc').ReflectionKind | undefined} kind
 */
function clerkShouldDisplayHtmlTable(context, kind) {
  if (
    kind &&
    [ReflectionKind.CallSignature, ReflectionKind.Variable, ReflectionKind.TypeAlias].includes(kind) &&
    context.options.getValue('typeDeclarationFormat') == 'htmlTable'
  ) {
    return true;
  }
  if (kind === ReflectionKind.Property && context.options.getValue('propertyMembersFormat') == 'htmlTable') {
    return true;
  }
  return false;
}

/**
 * Same rules as typedoc-plugin-markdown `shouldDisplayHTMLTable` in `member.propertiesTable.js` (that helper is not exported). Drives **property-style** tables: `propertiesFormat`, `interfacePropertiesFormat`, etc.
 *
 * @param {import('typedoc-plugin-markdown').MarkdownThemeContext} context
 * @param {import('typedoc').ReflectionKind | undefined} kind
 */
function propertiesTableUsesHtmlTable(context, kind) {
  if (context.options.getValue('propertiesFormat') === 'htmlTable') {
    return true;
  }
  if (kind === ReflectionKind.Interface && context.options.getValue('interfacePropertiesFormat') === 'htmlTable') {
    return true;
  }
  if (kind === ReflectionKind.Class && context.options.getValue('classPropertiesFormat') === 'htmlTable') {
    return true;
  }
  if (kind === ReflectionKind.TypeAlias && context.options.getValue('typeAliasPropertiesFormat') === 'htmlTable') {
    return true;
  }
  return false;
}

/**
 * Renders a pipe or HTML table using {@link propertiesTableUsesHtmlTable} and `tableColumnSettings.leftAlignHeaders`, matching `member.propertiesTable` output conventions.
 *
 * @this {import('typedoc-plugin-markdown').MarkdownThemeContext}
 * @param {{
 *   headers: string[];
 *   rows: string[][];
 *   kind?: import('typedoc').ReflectionKind;
 * }} args
 */
function renderPropertiesFormatTable(args) {
  const tableColumnsOptions = /** @type {{ leftAlignHeaders?: boolean }} */ (
    this.options.getValue('tableColumnSettings') ?? {}
  );
  const leftAlignHeadings = tableColumnsOptions.leftAlignHeaders;
  const kind = args.kind ?? ReflectionKind.TypeAlias;
  const useHtml = propertiesTableUsesHtmlTable(this, kind);
  return useHtml
    ? htmlTable(args.headers, args.rows, leftAlignHeadings)
    : table(args.headers, args.rows, leftAlignHeadings);
}

/**
 * Resolve a property's type to the `@inline` class/interface declaration it ultimately points at, or `undefined` if the type isn't (or doesn't unwrap to) one. Unwraps `OptionalType`, `ArrayType`, and a union arm — covers `T | null` / `T | undefined` / `T[]`. Used to decide whether to expand nested rows for a property whose type is rendered inline as `\{ … \}`.
 *
 * Union-arm reflection: when TypeDoc has already inlined a `@inline` reference inside a union (`PublicOrganizationDataJSON | null` → `ReflectionType | null`), the arm shows up as a `ReflectionType` carrying the synthesized `TypeLiteral` declaration. Match those too so the children expand the same way a bare `ReferenceType` arm would.
 *
 * Array element: `errors: Foo[]` where `Foo` is `@inline` should expand the same as `errors: Foo` — readers want to see the element shape per row. Unwrap `ArrayType.elementType` (which, like the union arm, may have already been collapsed by TypeDoc to a `ReflectionType`) before the reference/reflection checks.
 *
 * Direct (non-array, non-union) `ReflectionType` is intentionally NOT handled here — typedoc-plugin-markdown's `getFlattenedDeclarations` already flattens that case in `propertiesTable`, and double-handling would produce duplicate child rows. The flag `viaContainer` records whether we passed through an array/union (where `getFlattenedDeclarations` does NOT walk further), so the final `ReflectionType` check only fires in that case.
 *
 * @param {import('typedoc').Type | undefined} t
 */
function getInlineClassOrInterfaceTarget(t) {
  let bare = /** @type {import('typedoc').Type | undefined} */ (unwrapOptional(t));
  let viaContainer = false;
  if (bare?.type === 'array') {
    bare = /** @type {import('typedoc').ArrayType} */ (bare).elementType;
    viaContainer = true;
  }
  if (bare && bare.type === 'union') {
    viaContainer = true;
    const u = /** @type {import('typedoc').UnionType} */ (bare);
    bare = u.types.find(arm => {
      if (arm.type === 'reference') {
        const refl = /** @type {import('typedoc').ReferenceType} */ (arm).reflection;
        if (!refl || !isInlineModifierWithoutStandalonePage(refl)) return false;
        return (
          /** @type {{ kindOf?: (k: number) => boolean }} */ (refl).kindOf?.(ReflectionKind.Class) ||
          /** @type {{ kindOf?: (k: number) => boolean }} */ (refl).kindOf?.(ReflectionKind.Interface)
        );
      }
      if (arm.type === 'reflection') {
        const d = /** @type {import('typedoc').ReflectionType} */ (arm).declaration;
        return Boolean(d?.children?.some(c => c.kindOf(ReflectionKind.Property)));
      }
      return false;
    });
  }
  if (viaContainer && bare?.type === 'reflection') {
    const d = /** @type {import('typedoc').ReflectionType} */ (bare).declaration;
    if (!d?.children?.some(c => c.kindOf(ReflectionKind.Property))) return undefined;
    return d;
  }
  if (!bare || bare.type !== 'reference') return undefined;
  const decl = /** @type {import('typedoc').ReferenceType} */ (bare).reflection;
  if (!decl) return undefined;
  if (!isInlineModifierWithoutStandalonePage(decl)) return undefined;
  const d = /** @type {import('typedoc').DeclarationReflection} */ (decl);
  if (!d.kindOf(ReflectionKind.Class) && !d.kindOf(ReflectionKind.Interface)) return undefined;
  return d;
}

/**
 * Append synthesized `parent.child` rows after each property whose type is an `@inline` class or interface (or `null | InlineClass`). Mirrors {@link appendUnionObjectChildPropertyRows} — the synthesized reflection inherits the child's `flags.isOptional` so the renderer appends `?` on its own, and uses `?.` as the separator when the parent is optional.
 *
 * @template {import('typedoc').DeclarationReflection} T
 * @param {T[]} base
 * @returns {T[]}
 */
function appendInlineObjectChildPropertyRows(base) {
  /** @type {T[]} */
  const out = [];
  for (const prop of base) {
    out.push(prop);
    if (prop.name.includes('.')) continue;
    const target = getInlineClassOrInterfaceTarget(prop.type);
    if (!target) continue;
    const children = target.children?.filter(c => c.kindOf(ReflectionKind.Property));
    if (!children?.length) continue;
    const sep = prop.flags?.isOptional ? '?.' : '.';
    for (const child of children) {
      out.push(
        /** @type {T} */ (
          /** @type {unknown} */ ({
            ...child,
            name: `${prop.name}${sep}${child.name}`,
            getFullName: () => prop.getFullName(),
            getFriendlyFullName: () => prop.getFriendlyFullName(),
          })
        ),
      );
    }
  }
  return out;
}

/**
 * Same logic as typedoc-plugin-markdown `member.typeDeclarationTable`, but **always** runs `getFlattenedDeclarations` and then {@link appendUnionObjectChildPropertyRows} (union-object arm rows like `telemetry.*`). The default plugin skips flattening in `compact` mode, which hides nested keys like `telemetry.disabled`.
 *
 * @this {import('typedoc-plugin-markdown').MarkdownThemeContext}
 * @param {import('typedoc').DeclarationReflection[]} model
 * @param {{ kind?: import('typedoc').ReflectionKind }} options
 */
function clerkTypeDeclarationTable(model, options) {
  const tableColumnsOptions = /** @type {{ leftAlignHeaders?: boolean; hideSources?: boolean }} */ (
    this.options.getValue('tableColumnSettings') ?? {}
  );
  const leftAlignHeadings = tableColumnsOptions.leftAlignHeaders;
  // typedoc-plugin-markdown's `TypeDeclarationVisibility.Compact` is just the string `'compact'`.
  const isCompact = this.options.getValue('typeDeclarationVisibility') === 'compact';
  const hasSources = !tableColumnsOptions.hideSources && !this.options.getValue('disableSources');
  const headers = [];
  const baseDeclarations = this.helpers.getFlattenedDeclarations(model, {
    includeSignatures: true,
  });
  const project = this.page?.project ?? this.page?.model?.project;
  const declarations = project
    ? appendUnionObjectChildPropertyRows(baseDeclarations, this.helpers, project)
    : baseDeclarations;
  const hasDefaultValues = declarations.some(
    declaration => Boolean(declaration.defaultValue) && declaration.defaultValue !== '...',
  );
  const hasComments = declarations.some(declaration => Boolean(declaration.comment));
  const theme = /** @type {Record<string, () => string>} */ (/** @type {unknown} */ (i18n));
  headers.push(theme.theme_name());
  headers.push(theme.theme_type());
  if (hasDefaultValues) {
    headers.push(theme.theme_default_value());
  }
  if (hasComments) {
    headers.push(theme.theme_description());
  }
  if (hasSources) {
    headers.push(theme.theme_defined_in());
  }
  /** @type {string[][]} */
  const rows = [];
  declarations.forEach(declaration => {
    const declType = /** @type {{ declaration?: import('typedoc').DeclarationReflection } | undefined} */ (
      /** @type {unknown} */ (declaration.type)
    );
    const optional = declaration.flags.isOptional ? '?' : '';
    const isSignature = declType?.declaration?.signatures?.length || declaration.signatures?.length;
    const row = [];
    const nameColumn = [];
    if (this.router.hasUrl(declaration) && this.router.getAnchor(declaration)) {
      nameColumn.push(`<a id="${this.router.getAnchor(declaration)}"></a>`);
    }
    const name = backTicks(`${declaration.name}${isSignature ? '()' : ''}${optional}`);
    nameColumn.push(name);
    row.push(nameColumn.join(' '));
    if (isCompact && declaration.type instanceof ReflectionType) {
      row.push(
        this.partials.reflectionType(declaration.type, {
          forceCollapse: isCompact,
        }),
      );
    } else {
      const type = [];
      const signatures = declaration.signatures;
      if (signatures?.length) {
        signatures.forEach(sig => {
          type.push(`${this.partials.signatureParameters(sig.parameters || [])} => `);
        });
        type.push(this.partials.someType(declaration.type));
      } else {
        type.push(this.partials.someType(declaration.type));
      }
      row.push(type.join(''));
    }
    if (hasDefaultValues) {
      row.push(
        !declaration.defaultValue || declaration.defaultValue === '...' ? '-' : backTicks(declaration.defaultValue),
      );
    }
    if (hasComments) {
      const commentsOut = [];
      if (declaration.comment) {
        commentsOut.push(
          this.partials.comment(declaration.comment, {
            isTableColumn: true,
          }),
        );
      }
      if (declType?.declaration?.signatures?.length) {
        for (const sig of declType.declaration.signatures) {
          if (sig.comment) {
            commentsOut.push(
              this.partials.comment(sig.comment, {
                isTableColumn: true,
              }),
            );
          }
        }
      }
      if (commentsOut.length) {
        row.push(commentsOut.join('\n\n'));
      } else {
        row.push('-');
      }
    }
    if (hasSources) {
      row.push(this.partials.sources(declaration, { hideLabel: true }));
    }
    rows.push(row);
  });
  return clerkShouldDisplayHtmlTable(this, options?.kind)
    ? htmlTable(headers, rows, leftAlignHeadings)
    : table(headers, rows, leftAlignHeadings);
}

/**
 * @param {import('typedoc-plugin-markdown').MarkdownThemeContext} ctx
 * @param {import('typedoc').DeclarationReflection} model
 * @param {{ nested?: boolean; headingLevel?: number }} opts
 * @param {import('typedoc').DeclarationReflection[]} mergedChildren
 * @param {import('typedoc-plugin-markdown').MarkdownThemeContext['partials']} superPartials
 */
function renderMergedIntersectionDeclaration(ctx, model, opts, mergedChildren, superPartials) {
  /** @type {string[]} */
  const md = [];
  const headingLevel = opts.headingLevel ?? 2;
  const nested = opts.nested ?? false;

  if (!nested && model.sources && !ctx.options.getValue('disableSources')) {
    md.push(superPartials.sources(model));
  }
  if (model?.documents) {
    md.push(superPartials.documents(model, { headingLevel }));
  }
  if (model.comment) {
    md.push(
      ctx.partials.comment(model.comment, {
        headingLevel,
        showSummary: true,
        showTags: false,
      }),
    );
  }

  const synthetic = /** @type {import('typedoc').DeclarationReflection} */ (
    /** @type {unknown} */ ({
      children: mergedChildren,
      parent: model,
      kind: ReflectionKind.TypeLiteral,
    })
  );
  md.push(superPartials.typeDeclaration(synthetic, { headingLevel }));

  if (model.comment) {
    md.push(
      ctx.partials.comment(model.comment, {
        headingLevel,
        showSummary: false,
        showTags: true,
        showReturns: true,
      }),
    );
  }
  md.push(superPartials.inheritance(model, { headingLevel: opts.headingLevel ?? headingLevel }));
  return md.filter(Boolean).join('\n\n');
}

/**
 * Union of literals with JSDoc on each `|` arm: **## Properties** + a table via {@link renderPropertiesFormatTable} (same formatting rules as `member.propertiesTable`).
 *
 * @this {import('typedoc-plugin-markdown').MarkdownThemeContext}
 * @param {import('typedoc').DeclarationReflection} model
 * @param {{ headingLevel?: number }} options
 */
function clerkLiteralUnionAsPropertiesTable(model, options) {
  const unionType = /** @type {import('typedoc').UnionType} */ (model.type);
  const headingLevel = options.headingLevel ?? 2;
  const ti = /** @type {{ theme_type: () => string; theme_description: () => string }} */ (
    /** @type {unknown} */ (i18n)
  );

  const headers = [ReflectionKind.singularString(ReflectionKind.Property), ti.theme_type(), ti.theme_description()];

  /** @type {string[][]} */
  const rows = [];
  unionType.types.forEach((type, i) => {
    const typeStr = removeLineBreaks(this.partials.someType(type));
    const anchorRaw = typeStr.replace(/^`|`$/g, '').replace(/"/g, '').trim();
    const anchorId = anchorRaw.toLowerCase().replace(/[^a-z0-9]/g, '') || `member-${i}`;

    const propertyCell = [`<a id="${anchorId}"></a>`, backTicks(anchorRaw || `member-${i}`)].join(' ');

    const summary = unionType.elementSummaries?.[i];
    const description = summary ? this.helpers.getCommentParts(summary) : '-';

    rows.push([propertyCell, typeStr, description]);
  });

  const tableBody = renderPropertiesFormatTable.call(this, {
    headers,
    rows,
    kind: ReflectionKind.TypeAlias,
  });

  return [heading(headingLevel, ReflectionKind.pluralString(ReflectionKind.Property)), tableBody].join('\n\n');
}

/**
 * Same as typedoc-plugin-markdown `member.declaration`, but type aliases whose value is a **union of only literals** (no `ReflectionType` members) still get a "Type declaration" section when TypeDoc populated {@link UnionType.elementSummaries} from JSDoc before each `|` arm.
 *
 * Stock `hasTypeDeclaration` required `types.some(t => t instanceof ReflectionType)`, so `SessionStatus` never reached {@link MarkdownThemeContext.partials.typeDeclarationUnionContainer} and only the summary line was emitted.
 *
 * @this {import('typedoc-plugin-markdown').MarkdownThemeContext}
 * @param {import('typedoc').DeclarationReflection} model
 * @param {{ headingLevel?: number; nested?: boolean }} [options]
 */
function clerkDeclaration(model, options = { headingLevel: 2, nested: false }) {
  const md = [];
  const opts = {
    nested: false,
    ...options,
  };
  const headingLevel = opts.headingLevel ?? 2;
  const optionsWithHeading = { ...options, headingLevel };

  if (!opts.nested && model.sources && !this.options.getValue('disableSources')) {
    md.push(this.partials.sources(model));
  }
  if (model?.documents) {
    md.push(this.partials.documents(model, { headingLevel }));
  }
  /** @type {import('typedoc').DeclarationReflection | undefined} */
  let typeDeclaration =
    model.type && 'declaration' in model.type
      ? /** @type {{ declaration?: import('typedoc').DeclarationReflection }} */ (model.type).declaration
      : undefined;
  if (model.type instanceof ArrayType && model.type?.elementType instanceof ReflectionType) {
    typeDeclaration = model.type?.elementType?.declaration;
  }
  const hasTypeDeclaration =
    Boolean(typeDeclaration) ||
    (model.type instanceof UnionType &&
      (model.type.types.some(type => type instanceof ReflectionType) || Boolean(model.type.elementSummaries?.length)));
  if (model.comment) {
    md.push(
      this.partials.comment(model.comment, {
        headingLevel,
        showSummary: true,
        showTags: false,
      }),
    );
  }
  if (model.type instanceof IntersectionType) {
    model.type?.types?.forEach(intersectionType => {
      if (
        intersectionType instanceof ReflectionType &&
        !intersectionType.declaration.signatures &&
        intersectionType.declaration.children
      ) {
        md.push(heading(headingLevel, i18n.theme_type_declaration()));
        md.push(
          this.partials.typeDeclaration(intersectionType.declaration, {
            headingLevel,
          }),
        );
      }
    });
  }
  if (model.typeParameters) {
    md.push(heading(headingLevel, ReflectionKind.pluralString(ReflectionKind.TypeParameter)));
    if (this.helpers.useTableFormat('parameters')) {
      md.push(this.partials.typeParametersTable(model.typeParameters));
    } else {
      md.push(
        this.partials.typeParametersList(model.typeParameters, {
          headingLevel,
        }),
      );
    }
  }
  if (hasTypeDeclaration) {
    if (model.type instanceof UnionType) {
      if (this.helpers.hasUsefulTypeDetails(model.type)) {
        md.push(heading(headingLevel, i18n.theme_type_declaration()));
        md.push(this.partials.typeDeclarationUnionContainer(model, optionsWithHeading));
      }
    } else if (typeDeclaration) {
      const useHeading =
        typeDeclaration.children?.length &&
        (model.kind !== ReflectionKind.Property || this.helpers.useTableFormat('properties'));
      if (useHeading) {
        md.push(heading(headingLevel, i18n.theme_type_declaration()));
      }
      md.push(this.partials.typeDeclarationContainer(model, typeDeclaration, optionsWithHeading));
    }
  }
  if (model.comment) {
    md.push(
      this.partials.comment(model.comment, {
        headingLevel,
        showSummary: false,
        showTags: true,
        showReturns: true,
      }),
    );
  }
  md.push(this.partials.inheritance(model, { headingLevel }));
  return md.join('\n\n');
}

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
 * @param {import('typedoc').DeclarationReflection} decl
 */
function hasExtractMethodsModifier(decl) {
  return Boolean(decl.comment?.hasModifier('@extractMethods'));
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
 * Wrap the name portion of bare method headings on a parent page in backticks:
 * `^## methodName()` → `` ^## `methodName()` ``. Applies to H2–H4 headings whose full text is an identifier followed by `()` with no other content — matches typedoc's natural rendering of callable signature titles on aggregator pages (e.g. `agent-task-api.mdx`). Idempotent: headings that already contain a backtick are left alone.
 *
 * @param {string} contents
 * @returns {string}
 */
function addBackticksToBareMethodHeadings(contents) {
  if (!contents) return contents;
  return contents.replace(/^(#{2,4}) ([A-Za-z_$][A-Za-z0-9_$]*)\(\)\s*$/gm, '$1 `$2()`');
}

/**
 * Replace each method's natural `### Parameters` (or `## Parameters` on single-callable pages) section with the canonical `parametersMarkdownTable` output for the same signature at the same heading level. Routes every parameters table through the same code path:
 *
 * - single nominal param (e.g. `create(params: CreateAgentTaskParams)`): section becomes
 *   `` `TypeName` `` (backticked) + the propertiesTable-based expanded rows.
 * - multi-arg or non-nominal (e.g. `revoke(agentTaskId: string)`): section stays `Parameters`
 *   + parametersTable output.
 *
 * Handles two page shapes:
 * 1. **Aggregator pages** (backend API parents, namespaces like `api-keys-namespace.mdx`): each method is a `## `methodName()` ` section with `### Parameters` inside. Iterates `decl.children`.
 * 2. **Single-callable pages** (`server-get-token.mdx`, React hooks): no method heading, `## Parameters` at top-level. Uses `decl`'s own signature.
 *
 * Runs uniformly across all pages. `extract-returns-and-params.mjs` is responsible for renaming `` ## `TypeName` `` back to `## Parameters` on the react-package pages it post-processes (so the sibling `-params.mdx` extraction still finds the section) — this keeps theme output uniform and pushes downstream-consumer knowledge into the downstream tool.
 *
 * Applies link replacements manually because this listener runs after `custom-plugin.mjs`'s pass.
 *
 * @param {string} contents
 * @param {import('typedoc').DeclarationReflection | import('typedoc').Reflection} decl
 * @param {import('typedoc-plugin-markdown').MarkdownThemeContext} ctx
 * @returns {string}
 */
function swapParentPageParametersSections(contents, decl, ctx) {
  if (!contents) return contents;
  let result = contents;

  /** @param {import('typedoc').SignatureReflection} sig @param {number} level */
  const renderParams = (sig, level) => {
    const skip =
      Boolean(/** @type {any} */ (sig).comment?.hasModifier?.('@skipParametersSection')) ||
      Boolean(/** @type {any} */ (sig).parent?.comment?.hasModifier?.('@skipParametersSection'));
    if (skip) return undefined;
    overlayParamCommentsFromSignatureBlockTags(sig);
    const parent = /** @type {import('typedoc').DeclarationReflection} */ (sig.parent);
    const instantiationMap = parent ? getGenericInstantiationMapFromCallableProperty(parent) : undefined;
    const md = parametersMarkdownTable(sig, ctx, instantiationMap, level);
    if (!md) return undefined;
    return applyCatchAllMdReplacements(applyRelativeLinkReplacements(md));
  };

  const declWithChildren = /** @type {import('typedoc').DeclarationReflection} */ (decl);
  const callableChildren = (declWithChildren.children ?? []).filter(
    /** @param {import('typedoc').DeclarationReflection} c */ c => {
      if (c.name.startsWith('__')) return false;
      return shouldExtractCallableMember(c, ctx);
    },
  );

  if (callableChildren.length > 0) {
    // Aggregator page: iterate `## `methodName()` ` blocks, swap the nested params section.
    for (const child of callableChildren) {
      const sig = getPrimaryCallSignature(/** @type {import('typedoc').DeclarationReflection} */ (child));
      if (!sig) continue;
      const heading = `## \`${child.name}()\``;
      const startIdx = result.indexOf(heading);
      if (startIdx === -1) continue;
      const rest = result.slice(startIdx);
      const paramsMatch = rest.match(/\n(##+) Parameters\n[\s\S]*?(?=\n(?:##+ |---)|$)/);
      if (!paramsMatch || paramsMatch.index === undefined) continue;
      const level = paramsMatch[1].length;
      const newParamsMd = renderParams(sig, level);
      if (!newParamsMd) continue;
      const absStart = startIdx + paramsMatch.index;
      const absEnd = absStart + paramsMatch[0].length;
      result = `${result.slice(0, absStart)}\n${newParamsMd.trimEnd()}\n${result.slice(absEnd)}`;
    }
    return result;
  }

  // Single-callable page: `decl` is (or wraps) the signature. Find the top-level Parameters section.
  /** @type {import('typedoc').SignatureReflection | undefined} */
  const sig =
    /** @type {any} */ (decl).signatures?.[0] ??
    /** @type {any} */ (decl.kind && getPrimaryCallSignature(declWithChildren)) ??
    undefined;
  if (!sig) return result;
  const paramsMatch = result.match(/(^|\n)(##+) Parameters\n[\s\S]*?(?=\n(?:##+ |---)|$)/);
  if (!paramsMatch || paramsMatch.index === undefined) return result;
  const level = paramsMatch[2].length;
  const newParamsMd = renderParams(sig, level);
  if (!newParamsMd) return result;
  const leadingNl = paramsMatch[1];
  const absStart = paramsMatch.index + leadingNl.length;
  const absEnd = paramsMatch.index + paramsMatch[0].length;
  result = `${result.slice(0, absStart)}${newParamsMd.trimEnd()}\n${result.slice(absEnd)}`;
  return result;
}

/**
 * Check whether the page contents already include a `## methodName()` H2 heading (either bare or backticked) for the given method name. Used to avoid duplicating a synthesized aggregator section on pages where typedoc-plugin-markdown already emits per-method headings naturally (backend class-based API pages).
 *
 * @param {string} contents
 * @param {string} name
 * @returns {boolean}
 */
function contentsHaveMethodHeading(contents, name) {
  if (!contents) return false;
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`(^|\\n)## \`?${escaped}\`?\\(\\)\`?[ \\t]*(\\n|$)`);
  return re.test(contents);
}

/**
 * Render the canonical H2 property-table section for a parent page. Shape:
 *
 *     ## `name`
 *     <description>
 *     <property table>
 *
 * `namespacePropertyTable` entries list the non-callable members of an `@extractMethods` namespace (e.g. `## `verifications`` lists `emailAddress`, `phoneNumber`, ...). `memberPropertyTable` entries expand one non-callable member's object shape (e.g. `## `emailLink.verification``).
 *
 * Sub-doc equivalents produced by the marker-block path use H3 (`### `name``); text-slice demotes the H2 back to H3 on reshape, so the sub-doc is byte-identical to the marker-block output.
 *
 * @param {Extract<AggregatorMethodEntry, { kind: 'namespacePropertyTable' | 'memberPropertyTable' }>} entry
 * @param {import('typedoc-plugin-markdown').MarkdownThemeContext} ctx
 * @returns {string}
 */
function renderAggregatorPropertyTableSection(entry, ctx) {
  const displayName = entry.kind === 'namespacePropertyTable' ? entry.decl.name : entry.qualifiedName;
  const description = commentSummaryAndBody(entry.decl.comment);
  /** @type {import('typedoc').DeclarationReflection[]} */
  let propsUnsorted;
  if (entry.kind === 'namespacePropertyTable') {
    propsUnsorted = entry.nonCallableMembers;
  } else {
    propsUnsorted = resolveObjectShapeMembersForPropertyTable(entry.decl.type) ?? [];
  }
  if (!propsUnsorted.length) return '';
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
  if (!tableMd?.trim()) return '';
  const title = `## \`${displayName}\``;
  const raw = [title, '', description, '', tableMd].filter(Boolean).join('\n\n');
  return `${applyCatchAllMdReplacements(applyRelativeLinkReplacements(raw)).trim()}\n`;
}

/**
 * Render one method's canonical "aggregator" H2 section for a parent page — the shape every parent page uses so `extract-methods.mjs` can slice it and reshape into the per-method extracted file with pure text ops (no reflection access needed downstream):
 *
 *     ## `name()`
 *     <description>          (summary + non-@returns block tags)
 *     ```typescript
 *     function name(...): ReturnType
 *     ```
 *     ### `TypeName`         (nominal single-arg) OR ### Parameters
 *     <canonical parametersMarkdownTable output>
 *     ### Returns
 *     `Type` — <returns text> (from ctx.partials.signatureReturns)
 *
 * Used to synthesize sections for callable members typedoc doesn't render as separate H2s — function-typed properties on interfaces (`end: () => Promise<X>`) and members declared on `extraMethodInterfaces`. Sections synthesized here are indistinguishable from natural sections on the same page after all reshapers have run.
 *
 * Applies link replacements manually because this listener runs after `custom-plugin.mjs`'s pass.
 * For property-table entries, delegates to {@link renderAggregatorPropertyTableSection}.
 *
 * @param {AggregatorMethodEntry} entry
 * @param {import('typedoc-plugin-markdown').MarkdownThemeContext} ctx
 * @returns {string}
 */
function renderAggregatorMethodSection(entry, ctx) {
  if (entry.kind === 'namespacePropertyTable' || entry.kind === 'memberPropertyTable') {
    return renderAggregatorPropertyTableSection(entry, ctx);
  }
  const { decl, qualifiedName } = entry;
  const sig = getPrimaryCallSignature(decl);
  if (!sig) return '';
  const displayName = qualifiedName ?? decl.name;
  const title = `## \`${displayName}()\``;
  const comment = decl.comment ?? sig.comment;
  const c = comment ? (applyTodoStrippingToComment(comment) ?? comment) : undefined;
  const summary = c ? displayPartsToString(c.summary).trim() : '';
  const block =
    c?.blockTags
      ?.filter(t => !BLOCK_TAGS_OMITTED_FROM_EXTRACTED_METHOD_PROSE.has(t.tag))
      .map(t => displayPartsToString(t.content).trim())
      .filter(Boolean)
      .join('\n\n') ?? '';
  const description = [summary, block].filter(Boolean).join('\n\n');
  const instantiationMap = getGenericInstantiationMapFromCallableProperty(decl);
  const signatureBlock = ['```typescript', formatTypeScriptSignature(sig, displayName, instantiationMap), '```'].join(
    '\n',
  );
  const skipParametersSection =
    Boolean(decl.comment?.hasModifier('@skipParametersSection')) ||
    Boolean(sig.comment?.hasModifier('@skipParametersSection'));
  let paramsMd = '';
  if (!skipParametersSection) {
    overlayParamCommentsFromSignatureBlockTags(sig);
    paramsMd = parametersMarkdownTable(sig, ctx, instantiationMap, 3);
  }
  // Function-typed properties (`create: (params) => Promise<X>`) carry `@returns` on the property
  // comment, not on the signature comment. `signatureReturns` reads sig.comment.@returns; overlay
  // the decl comment's @returns onto sig so the rendered `### Returns` section carries the
  // description text.
  const declReturnsTag = decl.comment?.getTag('@returns');
  const sigReturnsTag = sig.comment?.getTag('@returns');
  if (declReturnsTag?.content?.length && !sigReturnsTag?.content?.length) {
    if (!sig.comment) sig.comment = new Comment();
    sig.comment.blockTags = [...(sig.comment.blockTags ?? []), declReturnsTag];
  }
  const returnsMd = ctx.partials.signatureReturns(sig, { headingLevel: 3 });
  // Apply link replacements to the prose chunks only. The typescript signature block must stay
  // raw — `applyRelativeLinkReplacements` is line-based and would rewrite bare type identifiers
  // inside the fenced code block into `[Type](...)` markdown link syntax, breaking downstream
  // slicing.
  const proseChunks = [title, description, paramsMd.trimEnd(), returnsMd]
    .filter(s => s && s.length > 0)
    .map(s => applyCatchAllMdReplacements(applyRelativeLinkReplacements(s)));
  const chunks = [proseChunks[0], proseChunks[1], signatureBlock, ...proseChunks.slice(2)].filter(
    s => s && s.length > 0,
  );
  return chunks.join('\n\n');
}

/**
 * Delete a `## methodName()` H2 section (heading through the next `## ` or end-of-file) from the page contents. Used when a natural typedoc-emitted section needs to be replaced by a synthesized one — e.g. overloaded backend-class methods where typedoc emits `### Call Signature` sub-headings per overload, but the aggregator synthesizes a single section for the primary signature only (via `getPrimaryCallSignature`).
 *
 * @param {string} contents
 * @param {string} name
 * @returns {string}
 */
function removeMethodH2Section(contents, name) {
  if (!contents) return contents;
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const headingRe = new RegExp(`(^|\\n)## \`?${escaped}\`?\\(\\)\`?[ \\t]*\\n`, '');
  const m = contents.match(headingRe);
  if (!m || m.index === undefined) return contents;
  const startIdx = m.index + (m[1] === '\n' ? 1 : 0);
  const afterHeading = m.index + m[0].length;
  const rest = contents.slice(afterHeading);
  const nextH2 = rest.search(/\n## /);
  const endIdx = nextH2 === -1 ? contents.length : afterHeading + nextH2 + 1;
  // Also trim the trailing `***` typedoc separator that natural sections use between overloads.
  let sliceEnd = endIdx;
  const trailingSep = contents.slice(sliceEnd).match(/^\*+\s*\n+/);
  if (trailingSep) sliceEnd += trailingSep[0].length;
  return contents.slice(0, startIdx) + contents.slice(sliceEnd);
}

/**
 * Insert a `` ```typescript ... ``` `` signature code block into each natural (typedoc-emitted) `## methodName()` H2 section on the parent page. Positioned after the section's description prose and before the first `### ` subheading — matching the position `renderAggregatorMethodSection` uses for synthesized sections. This is what makes the parent's H2 sections a self-contained source for `extract-methods.mjs`: the extracted file's signature can be sliced out of the parent verbatim rather than regenerated downstream.
 *
 * Idempotent-ish: relies on `contentsHaveMethodHeading` matching the (possibly-backticked) title, and looks for the absence of a fenced ```typescript block already inside the section.
 *
 * @param {string} contents
 * @param {import('typedoc').DeclarationReflection[]} callableDecls - direct callable members that may have natural sections. Callers pass the same list they enumerate for synthesis-vs-natural decisions.
 * @returns {string}
 */
function insertSignatureBlocksIntoNaturalMethodSections(contents, callableDecls) {
  if (!contents) return contents;
  let result = contents;
  for (const decl of callableDecls) {
    const sig = getPrimaryCallSignature(decl);
    if (!sig) continue;
    const escaped = decl.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const headingRe = new RegExp(`(^|\\n)## \`?${escaped}\`?\\(\\)\`?[ \\t]*\\n`);
    const headingMatch = result.match(headingRe);
    if (!headingMatch || headingMatch.index === undefined) continue;
    const sectionStart = headingMatch.index + headingMatch[0].length;
    const rest = result.slice(sectionStart);
    const nextH2 = rest.search(/\n## /);
    const sectionEnd = nextH2 === -1 ? result.length : sectionStart + nextH2;
    const section = result.slice(sectionStart, sectionEnd);
    if (/```typescript\n/.test(section)) continue;
    const firstSubheading = section.search(/\n### /);
    const descriptionEnd = firstSubheading === -1 ? section.length : firstSubheading;
    const description = section.slice(0, descriptionEnd);
    const remainder = section.slice(descriptionEnd);
    const instantiationMap = getGenericInstantiationMapFromCallableProperty(decl);
    const signatureBlock = ['```typescript', formatTypeScriptSignature(sig, decl.name, instantiationMap), '```'].join(
      '\n',
    );
    const before = result.slice(0, sectionStart);
    const rebuilt = `${description.trimEnd()}\n\n${signatureBlock}\n${remainder.startsWith('\n') ? remainder : `\n${remainder}`}`;
    result = `${before}${rebuilt}${result.slice(sectionEnd)}`;
  }
  return result;
}

/**
 * @typedef {(
 *   | { kind?: 'method', decl: import('typedoc').DeclarationReflection, qualifiedName?: string }
 *   | { kind: 'namespacePropertyTable', decl: import('typedoc').DeclarationReflection, nonCallableMembers: import('typedoc').DeclarationReflection[] }
 *   | { kind: 'memberPropertyTable', decl: import('typedoc').DeclarationReflection, qualifiedName: string }
 * )} AggregatorMethodEntry
 */

/**
 * Enumerate per-H2-section entries for the given parent page. Three shapes:
 *   - `method`: direct callable children, callables from `extraMethodInterfaces`, and callables
 *     inside `@extractMethods` namespaces (qualified names like `emailCode.sendCode`).
 *   - `namespacePropertyTable`: an `@extractMethods` namespace with at least one non-callable
 *     object-like member. Rendered as a `## `namespace`` H2 listing those non-callable members.
 *   - `memberPropertyTable`: a non-callable, object-like member inside an `@extractMethods`
 *     namespace. Rendered as a `## `namespace.member`` H2 expanding that member's object shape.
 *
 * @param {import('typedoc').DeclarationReflection} decl
 * @param {import('typedoc').ProjectReflection | undefined} project
 * @param {ReturnType<typeof configEntryForPageUrl>} entry
 * @param {import('typedoc-plugin-markdown').MarkdownThemeContext} ctx
 * @returns {AggregatorMethodEntry[]}
 */
function enumerateAggregatorMethodDecls(decl, project, entry, ctx) {
  /** @type {AggregatorMethodEntry[]} */
  const out = [];
  /** @param {import('typedoc').DeclarationReflection} d */
  const pushCallables = d => {
    for (const child of d.children ?? []) {
      if (child.name.startsWith('__')) continue;
      const cd = /** @type {import('typedoc').DeclarationReflection} */ (child);
      if (hasExtractMethodsModifier(cd)) {
        // `@extractMethods` namespace: enumerate its object-like members. Callables produce
        // qualified-name method entries (`emailCode.sendCode`). Non-callable members with a
        // resolvable object shape produce `memberPropertyTable` entries; if any such members
        // exist, a `namespacePropertyTable` entry is also emitted for the namespace itself.
        const members = resolveDeclarationWithObjectMembers(cd.type, project) ?? [];
        /** @type {import('typedoc').DeclarationReflection[]} */
        const nonCallableMembers = [];
        for (const nested of members) {
          if (nested.name.startsWith('__')) continue;
          const nd = /** @type {import('typedoc').DeclarationReflection} */ (nested);
          if (shouldExtractCallableMember(nd, ctx)) {
            out.push({ kind: 'method', decl: nd, qualifiedName: `${cd.name}.${nd.name}` });
            continue;
          }
          nonCallableMembers.push(nd);
          if (resolveObjectShapeMembersForPropertyTable(nd.type)?.length) {
            out.push({ kind: 'memberPropertyTable', decl: nd, qualifiedName: `${cd.name}.${nd.name}` });
          }
        }
        if (nonCallableMembers.length) {
          out.push({ kind: 'namespacePropertyTable', decl: cd, nonCallableMembers });
        }
        continue;
      }
      if (shouldExtractCallableMember(cd, ctx)) out.push({ kind: 'method', decl: cd });
    }
  };
  pushCallables(decl);
  const extraMethodInterfaces = entry && 'extraMethodInterfaces' in entry ? entry.extraMethodInterfaces : undefined;
  if (Array.isArray(extraMethodInterfaces) && project) {
    for (const extra of extraMethodInterfaces) {
      const extraDecl = findInterfaceOrClass(project, extra.symbol, extra.declarationHint);
      if (!extraDecl) {
        console.warn(`[custom-theme] extraMethodInterfaces: could not find "${extra.symbol}"`);
        continue;
      }
      pushCallables(extraDecl);
    }
  }
  return out;
}

/**
 * Wrap the `## Properties` section body in the page contents with HTML-comment markers so the slicer can extract it after prettier runs.
 * Idempotent: no-op if markers already exist.
 *
 * @param {string} contents
 * @returns {string}
 */
function wrapPropertiesSectionWithMarkers(contents) {
  if (!contents) return contents;
  if (contents.includes('<!-- clerk:properties-start -->')) return contents;
  const normalized = contents.replace(/\r\n/g, '\n');
  // Match `## Properties` whether it's at start-of-file or after a newline. The slicer's strip
  // regex (in `extract-methods.mjs`) intentionally requires a leading `\n` so pages where
  // `## Properties` is the very first line (e.g. `billing-namespace.mdx`) do NOT have the section
  // stripped from the parent page — matching the pre-refactor `stripReferenceObjectPropertiesSection`
  // behavior. Wrapping still happens (so `properties.mdx` gets written), which also matches
  // pre-refactor (`extractPropertiesSectionBody` used the same `(^|\n)` prefix).
  const m = normalized.match(/(^|\n)## Properties\n+/);
  if (!m || m.index === undefined) return contents;
  const headingEnd = m.index + m[0].length;
  const rest = normalized.slice(headingEnd);
  const nextH2 = rest.search(/\n## /);
  const bodyEnd = nextH2 === -1 ? normalized.length : headingEnd + nextH2;
  const before = normalized.slice(0, headingEnd);
  const body = normalized.slice(headingEnd, bodyEnd);
  const after = normalized.slice(bodyEnd);
  return `${before}<!-- clerk:properties-start -->\n${body.trimEnd()}\n<!-- clerk:properties-end -->\n${after}`;
}

/**
 * Strip inline-code markers (backticks, `<code>` tags) from a type-rendering partial's output and rewrap the whole span in a single `<code>…</code>`. When rendering inside a function signature (`signatureTitle`), the outer code block wraps the whole span so return the stripped text unwrapped.
 *
 * @param {string} output
 * @param {boolean} insideFunctionSignature
 */
function wrapInlineTypeAsCode(output, insideFunctionSignature) {
  const stripped = output
    .replace(/`/g, '')
    .replace(/<code>/g, '')
    .replace(/<\/code>/g, '');
  return insideFunctionSignature ? stripped : `<code>${stripped}</code>`;
}

/**
 * @param {import('typedoc-plugin-markdown').MarkdownApplication} app
 */
export function load(app) {
  app.renderer.defineTheme('clerkTheme', ClerkMarkdownTheme);

  // Negative priority ensures this fires AFTER `custom-plugin.mjs`'s `MarkdownPageEvent.END`
  // listener (which applies `applyRelativeLinkReplacements` + `applyCatchAllMdReplacements` at the
  // default priority of 0). If we emitted first, custom-plugin's second pass would re-apply link
  // replacements to synthesized aggregator sections we already processed — mangling the
  // ```typescript``` signature fences (custom-plugin's replacements are line-based and do not
  // skip fenced code blocks). `extract-methods.mjs`'s slicer registers at an even lower priority
  // so it fires after this emit.
  app.renderer.on(
    MarkdownPageEvent.END,
    output => {
      const decl = /** @type {import('typedoc').DeclarationReflection | undefined} */ (output.model);
      if (!decl) return;
      const theme = /** @type {InstanceType<typeof MarkdownTheme> | undefined} */ (app.renderer.theme);
      if (!theme || typeof theme.getRenderContext !== 'function') return;
      const ctx = /** @type {import('typedoc-plugin-markdown').MarkdownThemeContext} */ (
        theme.getRenderContext(output)
      );

      output.contents = addBackticksToBareMethodHeadings(output.contents ?? '');
      output.contents = swapParentPageParametersSections(output.contents ?? '', decl, ctx);

      const pageUrl = matchReferenceObjectPageUrl(output);
      // Reference-object / backend-api specific work:
      // 1. Synthesize per-H2 aggregator sections for callable and property-table members that
      //    typedoc-plugin-markdown doesn't render on its own (function-typed interface properties,
      //    `extraMethodInterfaces`, `@extractMethods` namespace members).
      // 2. Wrap the `## Properties` section for post-prettier extraction into `properties.mdx`.
      //    `extract-methods.mjs` slices the resulting parent page into `methods/*.mdx` sub-docs.
      if (pageUrl) {
        const entry = configEntryForPageUrl(pageUrl);
        const methodFormat = methodFormatForPageUrl(pageUrl);
        const project = output.project;
        if (decl.children && project) {
          const allEntries = enumerateAggregatorMethodDecls(decl, project, entry, ctx);
          // Property-table entries are always synthesized (typedoc emits nothing for them);
          // handle them alongside `missing` methods below. Only the method entries participate
          // in the natural-heading dance.
          const methodEntries = allEntries.filter(e => !e.kind || e.kind === 'method');
          const propertyTableEntries = allEntries.filter(
            e => e.kind === 'namespacePropertyTable' || e.kind === 'memberPropertyTable',
          );
          // Overloaded methods on backend classes render natively as `### Call Signature`
          // sub-sections per overload. To keep the parent-page shape uniform across single and
          // multi-overload methods (so `extract-methods.mjs` can slice with one code path), remove
          // the overloaded natural section and treat the method as missing — it'll be re-synthesized
          // below using `getPrimaryCallSignature`.
          for (const e of methodEntries) {
            const nm = e.qualifiedName ?? e.decl.name;
            if ((e.decl.signatures?.length ?? 0) > 1 && contentsHaveMethodHeading(output.contents ?? '', nm)) {
              output.contents = removeMethodH2Section(output.contents ?? '', nm);
            }
          }
          const naturalCallables = methodEntries.filter(e =>
            contentsHaveMethodHeading(output.contents ?? '', e.qualifiedName ?? e.decl.name),
          );
          const missing = [
            ...methodEntries.filter(
              e => !contentsHaveMethodHeading(output.contents ?? '', e.qualifiedName ?? e.decl.name),
            ),
            ...propertyTableEntries,
          ];
          // Backend class pages: typedoc-plugin-markdown already emits `## methodName()` H2s.
          // Inject a `` ```typescript ``` `` signature block after each natural section's
          // description so the parent's section is self-contained (matches shape of synthesized
          // sections below). Only applies to unqualified members — qualified-name entries from
          // `@extractMethods` namespaces are never natural on the parent page.
          const naturalUnqualified = naturalCallables.filter(e => !e.qualifiedName).map(e => e.decl);
          if (naturalUnqualified.length) {
            output.contents = insertSignatureBlocksIntoNaturalMethodSections(output.contents ?? '', naturalUnqualified);
          }
          if (missing.length) {
            const sections = missing.map(e => renderAggregatorMethodSection(e, ctx)).filter(Boolean);
            if (sections.length) {
              // Insert synthesized sections BEFORE `## Properties` so extract-methods' strip
              // (which drops `## Properties` and everything after during the transitional refactor)
              // preserves them. Falls back to appending at end when the page has no properties
              // section (backend class pages have methods only).
              const block = sections.join('\n\n');
              const currentContents = output.contents ?? '';
              const propsIdx = currentContents.search(/(^|\n)## Properties\n/);
              if (propsIdx === -1) {
                output.contents = `${currentContents.trimEnd()}\n\n${block}\n`;
              } else {
                const before = currentContents.slice(0, propsIdx);
                const after = currentContents.slice(propsIdx);
                output.contents = `${before.trimEnd()}\n\n${block}\n\n${after.replace(/^\n+/, '')}`;
              }
            }
          }
        }
        output.contents = wrapPropertiesSectionWithMarkers(output.contents ?? '');
      }

      // `@noHeading` on the source declaration: strip the leading H1/H2/H3 heading (typically
      // typedoc-plugin-markdown's `## Properties` group heading) so the emitted `.mdx` starts
      // straight at the property table. Used by types that clerk-docs embeds via `<Typedoc />`
      // inside pages that already provide their own heading structure.
      // `@noHeading` on the source declaration: strip the first heading (any level H1-H6) in the
      // emitted page (typically typedoc-plugin-markdown's `## Properties` group heading, sometimes
      // preceded by descriptive prose from the type's summary). Used by types that clerk-docs
      // embeds via `<Typedoc />` inside pages that already provide their own heading structure.
      if (decl.comment?.hasModifier('@noHeading') && output.contents) {
        output.contents = output.contents.replace(/^#{1,6} .+\n+/m, '');
      }
    },
    -100,
  );
}

class ClerkMarkdownTheme extends MarkdownTheme {
  /**
   * @param {import('typedoc-plugin-markdown').MarkdownPageEvent<import('typedoc').Reflection>} page
   */
  getRenderContext(page) {
    return new ClerkMarkdownThemeContext(this, page, this.application.options);
  }
}

/**
 * This map stores the comment for the first item in a union type.
 * It'll be used to add that comment to the other items of the union type.
 * This way the comment only has to be added once.
 * @type {Map<string, import('typedoc').Comment>}
 *
 * The key is a concenation of the model's type name and the union type's declaration name.
 * The value is the comment
 */
const unionCommentMap = new Map();

/**
 * Only for the specified pages do we remove function-valued members from property tables in the "Properties" section.
 * (Created for the extract-methods script as these methods will be extracted to separate files.)
 *
 * @param {string | undefined} pageUrl - The URL of the page to check.
 * @param {readonly string[]} allowlist - The list of pages to check.
 */
function pageMatchesAllowlist(pageUrl, allowlist) {
  if (!pageUrl) {
    return false;
  }
  const normalized = pageUrl.replace(/\\/g, '/').replace(/^\.\//, '');
  return allowlist.some(entry => {
    const e = entry.replace(/\\/g, '/').replace(/^\/+/, '');
    return normalized === e || normalized.endsWith(`/${e}`) || normalized.endsWith(e);
  });
}

/**
 * Our custom Clerk theme
 * @extends MarkdownThemeContext
 */
class ClerkMarkdownThemeContext extends MarkdownThemeContext {
  /**
   * @param {MarkdownTheme} theme
   * @param {import('typedoc-plugin-markdown').MarkdownPageEvent<import('typedoc').Reflection>} page
   * @param {MarkdownTheme["application"]["options"]} options
   */
  constructor(theme, page, options) {
    super(theme, page, options);

    const superPartials = this.partials;

    this._insideFunctionSignature = false;

    this.partials = {
      ...superPartials,
      /**
       * Run the OAuth-strategy collapse before delegating to the stock partial when the model is a union.
       *
       * @param {import('typedoc').SomeType | undefined} model
       * @param {Parameters<typeof superPartials.someType>[1]} [options]
       */
      someType: (model, options) => {
        if (model instanceof UnionType) {
          const collapsed = tryCollapseExpandedOAuthStrategyUnion(model, this);
          return superPartials.someType.call(this, collapsed ?? model, options);
        }
        return superPartials.someType.call(this, model, options);
      },
      /**
       * Stock `comments.comment` prints every {@link Comment.modifierTags} as **`TitleCase`** before the summary (it does not consult `notRenderedTags`; that option only filters block tags). `@inline` / `@inlineType` are router/type hints; `@experimental` is SDK-only guidance; `@noHeading` opts the page into the leading-heading strip below — none of these must appear in property tables or prose.
       *
       * @param {import('typedoc').Comment} model
       * @param {Parameters<typeof superPartials.comment>[1]} [options]
       */
      comment: (model, options) => {
        if (!model) {
          return superPartials.comment.call(this, model, options);
        }
        const modelToRender = applyTodoStrippingToComment(model) ?? model;
        const hidden = new Set(['@inline', '@inlineType', '@experimental', '@standalonePage', '@noHeading']);
        const modTags = Array.from(modelToRender.modifierTags ?? []);
        if (modTags.some(/** @param {string} t */ t => hidden.has(t))) {
          const clone = Object.assign(Object.create(Object.getPrototypeOf(modelToRender)), modelToRender, {
            modifierTags: new Set(modTags.filter(/** @param {string} t */ t => !hidden.has(t))),
          });
          return superPartials.comment.call(this, clone, options);
        }
        return superPartials.comment.call(this, modelToRender, options);
      },
      /**
       * Remove the blockquote signature line.
       *
       * @returns {string}
       */
      declarationTitle: () => '',
      /**
       * TypeDoc's default links every {@link ReferenceType} to a URL. Types marked `@inline` are expanded at use sites and (via the router) have no standalone page — linking produces broken relative `.mdx` paths in extracted method docs. Render the **aliased type** (RHS) so literals and unions show as `'phone_code'`, not `PhoneCodeStrategy`, unless `@standalonePage` is set (`standalone-page-tag.mjs`).
       *
       * @param {import('typedoc').ReferenceType} model
       */
      referenceType: model => {
        if (isInlineModifierWithoutStandalonePage(model.reflection)) {
          const decl = /** @type {import('typedoc').DeclarationReflection} */ (model.reflection);
          // Generic instantiation, e.g. `Fn<Args>` — let `someType` apply type arguments.
          if (model.typeArguments?.length) {
            return removeLineBreaks(this.partials.someType(model));
          }
          if (decl.kindOf(ReflectionKind.TypeAlias) && decl.type) {
            return removeLineBreaks(this.partials.someType(decl.type));
          }
          // Class or interface: there's no RHS to render, but the declaration's children describe the instance shape. Inline as a type-literal `\{ key: type; … \}` so use sites surface the same fields readers would see on the standalone page. Curly braces are escaped because MDX otherwise parses the literal as a JSX expression (and the object-literal bodies we emit aren't valid JS expressions).
          if ((decl.kindOf(ReflectionKind.Class) || decl.kindOf(ReflectionKind.Interface)) && decl.children?.length) {
            const props = decl.children.filter(c => c.kindOf(ReflectionKind.Property));
            if (props.length) {
              const fields = props
                .map(p => {
                  const sep = p.flags?.isOptional ? '?:' : ':';
                  const typeMd = p.type ? this.partials.someType(p.type) : '`unknown`';
                  return `${p.name}${sep} ${typeMd};`;
                })
                .join(' ');
              return removeLineBreaks(`\\{ ${fields} \\}`);
            }
          }
          return backTicks(decl.name);
        }
        return superPartials.referenceType.call(this, model);
      },
      /**
       * On allowlisted reference-object pages, drop function-valued members and `@extractMethods` namespace parents from property tables (they are documented under `methods/`).
       * `extract-methods.mjs` reuses this partial for nominal param tables and nested `@extractMethods` docs on the same URL; pass `applyAllowlistedPropertyTableRowFilters: false` so rows are not stripped.
       *
       * @param {import('typedoc').DeclarationReflection[]} model
       * @param {Parameters<typeof superPartials.propertiesTable>[1] & { applyAllowlistedPropertyTableRowFilters?: boolean }} [options]
       */
      propertiesTable: (model, options) => {
        if (!Array.isArray(model)) {
          return superPartials.propertiesTable(/** @type {any} */ (model), options);
        }

        const allowlisted = pageMatchesAllowlist(this.page?.url, REFERENCE_OBJECTS_LIST);
        const applyAllowlistFilters = allowlisted && options?.applyAllowlistedPropertyTableRowFilters !== false;
        const filtered = applyAllowlistFilters
          ? model.filter(
              prop => !isCallableInterfaceProperty(prop, this.helpers) && !prop.comment?.hasModifier('@extractMethods'),
            )
          : model;
        const expanded = appendInlineObjectChildPropertyRows(filtered);
        return superPartials.propertiesTable(expanded, options);
      },
      /**
       * Parameter tables: same as the stock partial except single-property inline object params are not expanded to nested rows.
       *
       * @param {import('typedoc').ParameterReflection[]} model
       */
      parametersTable: model => {
        return clerkParametersTable.call(this, model);
      },
      /**
       * In `compact` mode the default plugin skips `getFlattenedDeclarations`, so union object members never get rows.
       * Delegate to {@link clerkTypeDeclarationTable} which always flattens and applies {@link appendUnionObjectChildPropertyRows}.
       *
       * @param {import('typedoc').DeclarationReflection[]} model
       * @param {{ kind?: import('typedoc').ReflectionKind }} options
       */
      typeDeclarationTable: (model, options) => {
        return clerkTypeDeclarationTable.call(this, model, options);
      },
      /**
       * This hides the "Type parameters" section and the signature title from the output (by default). Shows the signature title if the `@displayFunctionSignature` tag is present.
       * @param {import('typedoc').SignatureReflection} model
       * @param {{ headingLevel: number, nested?: boolean, accessor?: string, multipleSignatures?: boolean; hideTitle?: boolean }} options
       */
      signature: (model, options) => {
        const displayFunctionSignatureTag = model.comment?.getTag('@displayFunctionSignature');
        const delimiter = '\n\n';

        const customizedOptions = {
          ...options,
          // Hide the title by default, only show it if the `@displayFunctionSignature` tag is present
          hideTitle: !displayFunctionSignatureTag,
        };
        const customizedModel = model;
        customizedModel.typeParameters = undefined;

        const output = superPartials.signature(customizedModel, customizedOptions);

        if (displayFunctionSignatureTag) {
          // Swap indexes 0 and 2 so the function signature renders below the description.
          const parts = output.split(delimiter);
          [parts[0], parts[2]] = [parts[2], parts[0]];
          return parts.join(delimiter);
        }

        return output;
      },
      /**
       * If `signature` has @displayFunctionSignature tag, the function will run `signatureTitle`. We want to use a completely custom code block here.
       * @param {import('typedoc').SignatureReflection} model
       * @param {{ accessor?: string; includeType?: boolean }} [options]
       * https://github.com/typedoc2md/typedoc-plugin-markdown/blob/c83cff97b72ab25b224463ceec118c34e940cb8a/packages/typedoc-plugin-markdown/src/theme/context/partials/member.signatureTitle.ts
       */
      signatureTitle: (model, options) => {
        /**
         * @type {string[]}
         */
        const md = [];

        const keyword = this.helpers.getKeyword(model.parent.kind);

        if (this.helpers.isGroupKind(model.parent) && keyword) {
          md.push(keyword + ' ');
        }

        if (options?.accessor) {
          md.push(options?.accessor + ' ');
        }

        if (model.parent) {
          const flagsString = this.helpers.getReflectionFlags(model.parent?.flags);
          if (flagsString.length) {
            md.push(this.helpers.getReflectionFlags(model.parent.flags) + ' ');
          }
        }

        if (!['__call', '__type'].includes(model.name)) {
          /**
           * @type {string[]}
           */
          const name = [];
          if (model.kind === ReflectionKind.ConstructorSignature) {
            name.push('new');
          }
          name.push(escapeChars(model.name));
          md.push(name.join(' '));
        }

        if (model.typeParameters) {
          md.push(
            `${this.helpers.getAngleBracket('<')}${model.typeParameters
              .map(typeParameter => typeParameter.name)
              .join(', ')}${this.helpers.getAngleBracket('>')}`,
          );
        }

        const prevInsideParams = this._insideFunctionSignature;
        this._insideFunctionSignature = true;
        md.push(this.partials.signatureParameters(model.parameters || []));
        this._insideFunctionSignature = prevInsideParams;

        if (model.type) {
          const prevInsideType = this._insideFunctionSignature;
          this._insideFunctionSignature = true;
          const typeOutput = this.partials.someType(model.type);
          this._insideFunctionSignature = prevInsideType;
          md.push(`: ${typeOutput}`);
        }

        const result = md.join('');
        return codeBlock(result);
      },
      /**
       * This condenses the output if only a "simple" return type + `@returns` is given.
       * @param {import('typedoc').SignatureReflection} model
       * @param {{ headingLevel: number }} options
       */
      signatureReturns: (model, options) => {
        // Check if @hideReturns tag is present - if so, hide the Returns section (e.g. `## Returns`)
        const hideReturnsTag = model.comment?.getTag('@hideReturns');
        if (hideReturnsTag) {
          return '';
        }

        const defaultOutput = superPartials.signatureReturns(model, options);
        const hasReturnsTag = model.comment?.getTag('@returns');

        /**
         * @type {any}
         */
        const type = model.type;
        /**
         * @type {import('typedoc').DeclarationReflection}
         */
        const typeDeclaration = type?.declaration;

        /**
         * Early return for non "simple" cases
         */
        if (!typeDeclaration?.signatures) {
          if (model.type && this.helpers.hasUsefulTypeDetails(model.type)) {
            return defaultOutput;
          }
        }
        if (!hasReturnsTag) {
          return defaultOutput;
        }

        /**
         * Now the default output would be in this format:
         *
         * `Type`
         *
         * Contents of `@returns` tag
         *
         * It should be condensed to:
         *
         * `Type` — Contents of `@returns` tag
         */

        const o = defaultOutput.split('\n\n');

        /**
         * At this stage the output can be:
         * - ['## Returns', '`Type`', 'Contents of `@returns` tag']
         * - ['## Returns', '`Type`', '']
         *
         * We want to condense the first case by combining the second and third item with ` — `
         */
        if (o.length === 3 && o[2] !== '') {
          return `${o[0]}\n\n${o[1]} — ${o[2]}`;
        }

        return defaultOutput;
      },
      /**
       * This hides the "Type parameters" section from the output
       * @param {import('typedoc').DeclarationReflection} model
       * @param {{ headingLevel: number }} options
       */
      memberWithGroups: (model, options) => {
        const customizedModel = model;
        customizedModel.typeParameters = undefined;

        const originalGroups = customizedModel.groups;

        // When an interface extends another interface, typedoc will generate a "Methods" group
        // We want to hide this group from being rendered
        const groupsWithoutMethods = originalGroups?.filter(g => g.title !== 'Methods');

        // Extract the Accessors group (if any) and prevent default rendering for it
        const accessorsGroup = groupsWithoutMethods?.find(g => g.title === 'Accessors');
        const groupsWithoutAccessors = groupsWithoutMethods?.filter(g => g.title !== 'Accessors');

        customizedModel.groups = groupsWithoutAccessors;
        const nonAccessorOutput = superPartials.memberWithGroups(customizedModel, options);

        customizedModel.groups = originalGroups;

        /** @type {string[]} */
        const md = [nonAccessorOutput];

        if (accessorsGroup && accessorsGroup.children && accessorsGroup.children.length > 0) {
          md.push('\n\n## Accessors\n');
          // Table header
          // This needs to be 'Property' instead of 'Accessor' so that clerk.com renders it correctly
          md.push('| Property | Type | Description |');
          md.push('| --- | --- | --- |');

          for (const child of accessorsGroup.children) {
            /** @type {import('typedoc').DeclarationReflection} */
            // @ts-ignore - child is a DeclarationReflection for accessor members
            const decl = child;
            // Name and anchor id
            const name = decl.name;
            const id = name.toLowerCase().replace(/[^a-z0-9]/g, '');

            // Resolve the accessor type from the getter signature
            /** @type {any} */
            const getterSig = /** @type {any} */ (decl).getSignature;
            /** @type {any} */
            const setterSig = /** @type {any} */ (decl).setSignature;
            let typeStr = '';
            if (getterSig?.type) {
              typeStr = this.partials.someType(getterSig.type);
            } else if (setterSig?.parameters?.[0]?.type) {
              typeStr = this.partials.someType(setterSig.parameters[0].type);
            } else if (decl.type) {
              typeStr = this.partials.someType(decl.type);
            }

            // Prefer comment on the getter signature; fallback to declaration comment
            const summary = getterSig?.comment?.summary ?? decl.comment?.summary ?? setterSig?.comment?.summary;
            const description = Array.isArray(summary)
              ? summary.reduce((acc, curr) => acc + (curr.text || ''), '')
              : '';

            md.push(`| <a id="${id}"></a> \`${escapeChars(name)}\` | ${typeStr} | ${description} |`);
          }
        }

        return md.join('\n');
      },
      /**
       * Suppress default per-accessor member rendering; table is rendered in memberWithGroups instead.
       * @param {import('typedoc').DeclarationReflection} model
       * @param {{ headingLevel: number, nested?: boolean }} options
       */
      member: (model, options) => {
        if (model.kind === ReflectionKind.Accessor) {
          return '';
        }
        return superPartials.member(model, options);
      },
      /**
       * This hides the "Type parameters" section, the declaration title, and the "Type declaration" heading from the output
       * @param {import('typedoc').DeclarationReflection} model
       * @param {{ headingLevel: number, nested?: boolean }} options
       */
      declaration: (model, options = { headingLevel: 2, nested: false }) => {
        const opts = { nested: false, ...options };
        const customizedModel = model;
        customizedModel.typeParameters = undefined;

        if (!opts.nested && model.type instanceof IntersectionType) {
          const merged = mergeIntersectionPropertyReflections(model.type, model.project);
          if (merged.length > 0) {
            const output = renderMergedIntersectionDeclaration(this, customizedModel, opts, merged, superPartials);
            return output.replace(/^## Type declaration$/gm, '');
          }
        }

        const output = clerkDeclaration.call(this, customizedModel, options);

        // Remove the "Type declaration" heading from the output
        // This heading is generated by the original declaration partial
        const filteredOutput = output.replace(/^## Type declaration$/gm, '');

        return filteredOutput;
      },
      /**
       * This ensures that everything is wrapped in a single codeblock
       * @param {import('typedoc').DeclarationReflection} model
       * @param {{ forceCollapse?: boolean }} [options]
       */
      declarationType: (model, options) => {
        const defaultOutput = superPartials.declarationType(model, options);

        // Ensure that the output starts with `\{ `. Some strings will do, some will have e.g. `\{<code>` or `\{[]`
        const withCorrectWhitespaceAtStart = defaultOutput.startsWith('\\{ ')
          ? defaultOutput
          : defaultOutput.startsWith('\\{')
            ? defaultOutput.replace('\\{', '\\{ ')
            : defaultOutput;

        return wrapInlineTypeAsCode(withCorrectWhitespaceAtStart, this._insideFunctionSignature);
      },
      /**
       * This modifies the output of union types by wrapping everything in a single `<code>foo | bar</code>` tag instead of doing `<code>foo</code>` | `<code>bar</code>`
       * @param {import('typedoc').UnionType} model
       */
      unionType: model => {
        const collapsed = tryCollapseExpandedOAuthStrategyUnion(model, this);
        // Escape `__experimental_` before wrap-as-code so the double-underscore isn't parsed as markdown bold.
        const escaped = superPartials
          .unionType(collapsed ?? model)
          .replace(/__experimental_/g, '\\_\\_experimental\\_');
        return wrapInlineTypeAsCode(escaped, this._insideFunctionSignature);
      },
      /**
       * This ensures that everything is wrapped in a single codeblock
       * @param {import('typedoc').SignatureReflection[]} model
       * @param {{ forceParameterType?: boolean; typeSeparator?: string }} [options]
       */
      functionType: (model, options) => {
        return wrapInlineTypeAsCode(superPartials.functionType(model, options), this._insideFunctionSignature);
      },
      /**
       * Copied from original theme.
       * Changes:
       * - Remove summaries over tables and instead use `@unionReturnHeadings` to add headings
       * - Only use one newline between items
       * https://github.com/typedoc2md/typedoc-plugin-markdown/blob/7032ebd3679aead224cf23bffd0f3fb98443d16e/packages/typedoc-plugin-markdown/src/theme/context/partials/member.typeDeclarationUnionContainer.ts
       * @param {import('typedoc').DeclarationReflection} model
       * @param {{ headingLevel: number }} options
       */
      typeDeclarationUnionContainer: (model, options) => {
        const optionsWithHeading = { ...options, headingLevel: options?.headingLevel ?? 2 };

        if (model.type instanceof UnionType) {
          const ut = model.type;
          const unionReturnHeadings = model.comment?.getTag('@unionReturnHeadings');
          if (
            !ut.types.some(arm => arm instanceof ReflectionType) &&
            ut.elementSummaries?.length &&
            !unionReturnHeadings
          ) {
            return clerkLiteralUnionAsPropertiesTable.call(this, model, optionsWithHeading);
          }
        }

        /**
         * @type {string[]}
         */
        const md = [];
        /**
         * @type {string[]}
         */
        const headings = [];
        /**
         * Search for the `@unionReturnHeadings` tag in the comment of the model
         */
        const unionReturnHeadings = model.comment?.getTag('@unionReturnHeadings');

        if (model.type instanceof UnionType) {
          const elementSummaries = model.type?.elementSummaries;
          model.type.types.forEach((type, i) => {
            if (type instanceof ReflectionType) {
              if (unionReturnHeadings && unionReturnHeadings.content.length > 0) {
                const content = this.helpers.getCommentParts(unionReturnHeadings.content);
                const unionHeadings = JSON.parse(content);

                /**
                 * While iterating over the union types, the headings are pulled from `@unionReturnHeadings` and added to the array
                 */
                headings.push(unionHeadings[i]);

                /**
                 * The `model.type.types` is the array of the individual items of the union type.
                 * We're documenting our code by only adding the comment to the first item of the union type.
                 *
                 * In this block, we're doing the following:
                 * 1. Generate an ID for the item in the unionCommentMap
                 * 2. Check if the union type has a comment (truthy for the first item)
                 * 3. Add the comment to the map
                 * 4. If the union doesn't have a comment for the given ID, add the comment from the map to the item
                 */
                if (type.declaration.children) {
                  for (const decl of type.declaration.children) {
                    const id = `${model.name}-${decl.name}`;

                    if (decl.comment && !unionCommentMap.has(id)) {
                      unionCommentMap.set(id, decl.comment);
                    } else if (!decl.comment && unionCommentMap.has(id)) {
                      decl.comment = unionCommentMap.get(id);
                    }
                  }
                }
              }

              md.push(this.partials.typeDeclarationContainer(model, type.declaration, options));
            } else {
              md.push(`${this.partials.someType(type)}`);
            }
            if (elementSummaries?.[i]) {
              md.push(this.helpers.getCommentParts(elementSummaries[i]));
            }
          });
        }

        if (!unionReturnHeadings) {
          return md.join('\n');
        }

        const items = headings.map(i => `'${i}'`).join(', ');
        const tabs = md.map(i => `<Tab>${i}</Tab>`).join('\n');

        return `There are multiple variants of this type available which you can select by clicking on one of the tabs.

<Tabs items={[${items}]}>
${tabs}
</Tabs>`;
      },
      /**
       * This ensures that everything is wrapped in a single codeblock
       * @param {import('typedoc').ArrayType} model
       */
      arrayType: model => {
        const el = model.elementType;
        const theType = this.partials.someType(el);
        const needsParens = el.type === 'union' || isArrayElementReferenceInliningToUnion(el);
        const defaultOutput = needsParens ? `(${theType})[]` : `${theType}[]`;
        return wrapInlineTypeAsCode(defaultOutput, this._insideFunctionSignature);
      },
      /**
       * Ensures that reflection types (like Simplify wrapped types) are wrapped in a single codeblock
       * @param {import('typedoc').ReflectionType} model
       */
      reflectionType: model => {
        return wrapInlineTypeAsCode(superPartials.reflectionType(model), this._insideFunctionSignature);
      },
      /**
       * Hide "Extends" and "Extended by" sections
       */
      hierarchy: () => '',
    };
  }
}

/**
 * @param {string} str - The string to unescape
 */
function unEscapeChars(str) {
  return str
    .replace(/(`[^`]*?)\\*([^`]*?`)/g, (_match, p1, p2) => `${p1}${p2.replace(/\*/g, '\\*')}`)
    .replace(/\\\\/g, '\\')
    .replace(/(?<!\\)\*/g, '')
    .replace(/\\</g, '<')
    .replace(/\\>/g, '>')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\\_/g, '_')
    .replace(/\\{/g, '{')
    .replace(/\\}/g, '}')
    .replace(/``.*?``|(?<!\\)`/g, match => (match.startsWith('``') ? match : ''))
    .replace(/`` /g, '')
    .replace(/ ``/g, '')
    .replace(/\\`/g, '`')
    .replace(/\\\*/g, '*')
    .replace(/\\\|/g, '|')
    .replace(/\\\]/g, ']')
    .replace(/\\\[/g, '[')
    .replace(/\[([^[\]]*)\]\((.*?)\)/gm, '$1');
}

/**
 * @param {string} content
 */
function codeBlock(content) {
  /**
   * @param {string} content
   */
  const trimLastLine = content => {
    const lines = content.split('\n');
    return lines.map((line, index) => (index === lines.length - 1 ? line.trim() : line)).join('\n');
  };
  const trimmedContent =
    content.endsWith('}') || content.endsWith('};') || content.endsWith('>') || content.endsWith('>;')
      ? trimLastLine(content)
      : content;
  return '```ts\n' + unEscapeChars(trimmedContent) + '\n```';
}

// ---------------------------------------------------------------------------
// Extracted-methods helpers (moved from extract-methods.mjs).
// ---------------------------------------------------------------------------

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
 * typedoc maps `@param paramName description` to `parameter.comment` during conversion of the signature that physically owns the JSDoc. With overloads + an implementation, the impl's `@param` tags don't transfer to overload parameters — even when typedoc copies the impl's comment onto each overload's `sig.comment.blockTags`. Without descriptions on `param.comment`, typedoc-plugin-markdown drops the Description column from the parameters table.
 *
 * Overlay missing parameter comments from any matching `@param` block tag on the signature comment so the rendered table shows the descriptions the author wrote on the implementation's JSDoc.
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
 * Resolve a parameter / property type to the list of `Property` reflections that should populate a nested rows table. TypeDoc applies `@param parent.prop` descriptions onto these reflections.
 *
 * Cases:
 * - `reflection` (inline `{...}`): the declaration's own children.
 * - `reference` to a named interface/alias: the target's children, or — for generic instantiations like `ClerkPaginationParams<{ status?: … }>` — the base properties merged with each typeArg's.
 * - `intersection`: every `&` arm's properties combined (later arm wins on name collision).
 * - `union`: every `|` arm's properties combined, dropping `prop?: never` discriminators and preferring the branch with more documentation on collisions.
 * - `optional`: unwrap and recurse.
 *
 * Returns `undefined` when nothing resolves (so callers can `if (!children?.length)` cheaply).
 * The children list may include non-`Property` kinds for direct `reflection` / `reference` cases — callers that need only `Property` should filter; merge cases (typeArgs / intersection / union) pre-filter via {@link mergePropertyArms}.
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
 * Unwrap optional wrappers. When the parameter is a single named interface or type alias for an  object shape, returns the section title (the type's name), the resolved property list, and the source `typeDecl` for `@experimental` / `@deprecated` checks.
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
    // Nested rows are always 3-column (`| name | type | description |`). If the base table came
    // back 2-column (no direct param has a comment, so `clerkParametersTable` omits the Description
    // column), pad the base to 3 columns so the appended rows don't malform the table.
    if (!parameterTableHasDescriptionColumn(tableMd)) {
      tableMd = padParameterTableWithEmptyDescriptionColumn(tableMd);
    }
    tableMd = `${tableMd.trimEnd()}\n${nested.join('\n')}\n`;
  }

  return [markdownHeading(headingLevel, ReflectionKind.pluralString(ReflectionKind.Parameter)), '', tableMd, ''].join(
    '\n',
  );
}

/**
 * Detects whether a markdown parameter table (pipe-format) already has a `Description` column.
 * HTML tables render on a single line — treat those as "already correct" (they carry their own column structure via `<th>` cells and aren't concatenated with pipe-row nested output).
 *
 * @param {string} tableMd
 */
function parameterTableHasDescriptionColumn(tableMd) {
  if (!tableMd) return true;
  const firstLine = tableMd.split('\n', 1)[0].trim();
  if (!firstLine.startsWith('|')) return true;
  return /\|\s*Description\s*\|/.test(firstLine);
}

/**
 * Append an empty Description column to a 2-column pipe-format parameter table so that appending 3-column nested-row output doesn't malform it. Header gets ` Description |`, divider gets ` ------ |`, data rows get ` - |`.
 *
 * @param {string} tableMd
 */
function padParameterTableWithEmptyDescriptionColumn(tableMd) {
  const lines = tableMd.split('\n');
  let sawDivider = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.startsWith('|') || !line.endsWith('|')) continue;
    if (i === 0) {
      lines[i] = line.replace(/\|\s*$/, ' Description |');
    } else if (!sawDivider && /^\|[\s\-|:]+\|$/.test(line)) {
      lines[i] = line.replace(/\|\s*$/, ' ------ |');
      sawDivider = true;
    } else {
      lines[i] = line.replace(/\|\s*$/, ' - |');
    }
  }
  return lines.join('\n');
}

/**
 * @param {import('typedoc').DeclarationReflection} prop
 * @param {import('typedoc-plugin-markdown').MarkdownThemeContext['helpers']} helpers
 */
function isCallableInterfaceProperty(prop, helpers) {
  // Use the declared value type for properties. `getDeclarationType` mirrors accessor/parameter behavior and can return the wrong node when TypeDoc attaches signatures to the property (same class of bug as TypeAlias + `decl.type`).
  const t =
    (prop.kind === ReflectionKind.Property || prop.kind === ReflectionKind.Variable) && prop.type
      ? prop.type
      : helpers.getDeclarationType(prop);
  return isCallablePropertyValueType(t, helpers, new Set());
}

/**
 * True when the property's value type is callable (function type, union/intersection of callables, or reference to a type alias of a function type). Object types with properties (e.g. namespaces) stay false.
 * E.g. `navigate: CustomNavigation` in clerk.ts
 *
 * @param {import('typedoc').Type | undefined} t
 * @param {import('typedoc-plugin-markdown').MarkdownThemeContext['helpers']} helpers
 * @param {Set<number>} seenReflectionIds
 * @returns {boolean}
 */
function isCallablePropertyValueType(t, helpers, seenReflectionIds) {
  if (!t) {
    return false;
  }
  if (t.type === 'optional' && 'elementType' in t) {
    return isCallablePropertyValueType(
      /** @type {{ elementType: import('typedoc').Type }} */ (t).elementType,
      helpers,
      seenReflectionIds,
    );
  }
  if (t instanceof UnionType) {
    const nonNullish = t.types.filter(
      u => !(u.type === 'intrinsic' && ['undefined', 'null'].includes(/** @type {{ name: string }} */ (u).name)),
    );
    if (nonNullish.length === 0) {
      return false;
    }
    return nonNullish.every(u => isCallablePropertyValueType(u, helpers, seenReflectionIds));
  }
  if (t instanceof IntersectionType) {
    return t.types.some(u => isCallablePropertyValueType(u, helpers, seenReflectionIds));
  }
  if (t instanceof ReflectionType) {
    const decl = t.declaration;
    const callSigs = decl.signatures?.length ?? 0;
    const hasProps = (decl.children?.length ?? 0) > 0;
    const hasIndex = (decl.indexSignatures?.length ?? 0) > 0;
    return callSigs > 0 && !hasProps && !hasIndex;
  }
  if (t instanceof ReferenceType) {
    /**
     * Unresolved reference (`reflection` missing): TypeDoc did not link the symbol (not in entry graph, external, filtered, etc.). We cannot tell a function alias from an interface, so we only treat a few **name** patterns as callable (`*Function`, `*Listener`). For anything else, ensure the type is part of the documented program so `reflection` resolves and the structural checks above apply — do not add one-off type names here.
     * E.g. `CustomNavigation`, `RouterFn`, etc.
     */
    if (!t.reflection && typeof t.name === 'string' && /(?:Function|Listener)$/.test(t.name)) {
      return true;
    }
    const ref = t.reflection;
    if (!ref) {
      return false;
    }
    const refId = ref.id;
    if (refId != null && seenReflectionIds.has(refId)) {
      return false;
    }
    if (refId != null) {
      seenReflectionIds.add(refId);
    }
    try {
      const decl = /** @type {import('typedoc').DeclarationReflection} */ (ref);
      /**
       * For `type Fn = (a: T) => U`, TypeDoc may attach call signatures to the TypeAlias reflection. `getDeclarationType` then returns `signatures[0].type` (here `U`), not the full function type, so we mis-classify properties typed as that alias (e.g. `navigate: CustomNavigation`) as non-callable.
       * Prefer `decl.type` (the full RHS) for type aliases.
       */
      const typeToCheck =
        decl.kind === ReflectionKind.TypeAlias && decl.type
          ? decl.type
          : (helpers.getDeclarationType(decl) ?? decl.type);
      if (typeToCheck) {
        return isCallablePropertyValueType(typeToCheck, helpers, seenReflectionIds);
      }
    } finally {
      if (refId != null) {
        seenReflectionIds.delete(refId);
      }
    }
    return false;
  }
  return false;
}
