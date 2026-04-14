// @ts-check
import { i18n, IntersectionType, ReferenceType, ReflectionKind, ReflectionType, UnionType } from 'typedoc';
import { MarkdownTheme, MarkdownThemeContext } from 'typedoc-plugin-markdown';
import { backTicks, htmlTable, table } from '../node_modules/typedoc-plugin-markdown/dist/libs/markdown/index.js';
import { TypeDeclarationVisibility } from '../node_modules/typedoc-plugin-markdown/dist/options/maps.js';

import { REFERENCE_OBJECTS_LIST } from './reference-objects.mjs';

export { REFERENCE_OBJECTS_LIST };

/**
 * Unwrap optional TypeDoc types so referenced object shapes are still found.
 *
 * @param {import('typedoc').Type} t
 * @returns {import('typedoc').Type}
 */
/**
 * Prefer structural checks over `instanceof` so we still match when multiple TypeDoc copies are loaded
 * (otherwise `instanceof IntersectionType` is false at render time).
 *
 * @param {import('typedoc').Type | undefined} t
 * @returns {t is import('typedoc').IntersectionType}
 */
function isIntersectionTypeDoc(t) {
  const o = /** @type {{ type?: string; types?: import('typedoc').Type[] } | null} */ (t);
  return Boolean(o && typeof o === 'object' && o.type === 'intersection' && Array.isArray(o.types));
}

/**
 * @param {import('typedoc').Type | undefined} t
 * @returns {t is import('typedoc').ReferenceType}
 */
function isReferenceTypeDoc(/** @type {import('typedoc').Type | undefined} */ t) {
  return Boolean(t && typeof t === 'object' && /** @type {{ type?: string }} */ (t).type === 'reference');
}

/**
 * @param {import('typedoc').Type | undefined} t
 * @returns {t is import('typedoc').ReflectionType}
 */
function isReflectionTypeDoc(/** @type {import('typedoc').Type | undefined} */ t) {
  return Boolean(t && typeof t === 'object' && /** @type {{ type?: string }} */ (t).type === 'reflection');
}

/**
 * @param {import('typedoc').Type | undefined} t
 */
function unwrapOptionalType(t) {
  if (
    t &&
    typeof t === 'object' &&
    'type' in t &&
    /** @type {{ type: string }} */ (t).type === 'optional' &&
    'elementType' in t
  ) {
    return /** @type {{ elementType: import('typedoc').Type }} */ (t).elementType;
  }
  return t;
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
 * Collect documented property reflections from one intersection arm (object literal, type alias, interface, nested `&`).
 * E.g. `{ a: string } & { b: number }` => `[{ name: 'a', type: 'string' }, { name: 'b', type: 'number' }]`
 *
 * @param {import('typedoc').Type} t
 * @param {Set<number>} visitedReflectionIds
 * @param {import('typedoc').ProjectReflection | undefined} project
 * @returns {import('typedoc').DeclarationReflection[]}
 */
function collectPropertyReflectionsFromIntersectionArm(t, visitedReflectionIds, project) {
  const unwrapped = unwrapOptionalType(t);
  if (!unwrapped) {
    return [];
  }

  if (isReflectionTypeDoc(unwrapped)) {
    const decl = unwrapped.declaration;
    if (!decl) {
      return [];
    }
    if (decl.signatures?.length && !decl.children?.length) {
      return [];
    }
    return (decl.children ?? []).filter(c => c.kind === ReflectionKind.Property);
  }

  if (isReferenceTypeDoc(unwrapped)) {
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

  if (isIntersectionTypeDoc(unwrapped)) {
    /** @type {import('typedoc').DeclarationReflection[]} */
    const out = [];
    for (const arm of unwrapped.types) {
      out.push(...collectPropertyReflectionsFromIntersectionArm(arm, visitedReflectionIds, project));
    }
    return out;
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
 * For properties typed something like `false \| { a?: … }`, `getFlattenedDeclarations` does not walk the union, so nested keys
 * never become table rows. Collect object members from each union arm (primitives/literals yield nothing).
 * E.g. `telemetry` prop in clerk.ts
 *
 * @param {import('typedoc').Type | undefined} t
 * @param {Set<number>} visitedReflectionIds
 * @param {import('typedoc').ProjectReflection | undefined} project
 * @returns {import('typedoc').DeclarationReflection[]}
 */
function collectPropertyReflectionsFromUnionObjectArms(t, visitedReflectionIds, project) {
  const unwrapped = unwrapOptionalType(t);
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
 * Appends `parent.child` rows for union object arms (e.g. `false \| { disabled?: … }`). **Only** used when building
 * {@link clerkTypeDeclarationTable}; we intentionally do **not** hook `helpers.getFlattenedDeclarations` globally —
 * otherwise top-level `propertiesTable` output (e.g. `Clerk`) would gain synthetic rows like `client.*` for every
 * property whose type is a union such as `ClientResource \| undefined`.
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
 * Same logic as typedoc-plugin-markdown `member.typeDeclarationTable`, but **always** runs `getFlattenedDeclarations`
 * and then {@link appendUnionObjectChildPropertyRows} (union-object arm rows like `telemetry.*`). The default plugin
 * skips flattening in `compact` mode, which hides nested keys like `telemetry.disabled`.
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
  const isCompact = this.options.getValue('typeDeclarationVisibility') === TypeDeclarationVisibility.Compact;
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
      superPartials.comment(model.comment, {
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
      superPartials.comment(model.comment, {
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
 * @param {import('typedoc-plugin-markdown').MarkdownApplication} app
 */
export function load(app) {
  app.renderer.defineTheme('clerkTheme', ClerkMarkdownTheme);
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
       * @param {import('typedoc').DeclarationReflection[]} model
       * @param {Parameters<typeof superPartials.propertiesTable>[1]} [options]
       */
      propertiesTable: (model, options) => {
        if (!Array.isArray(model)) {
          return superPartials.propertiesTable(/** @type {any} */ (model), options);
        }

        // On allowlisted output pages only, drop function-valued interface/class properties from property tables (property syntax with function types). Other pages unchanged.
        const allowlisted = pageMatchesAllowlist(this.page?.url, REFERENCE_OBJECTS_LIST);
        const filtered = allowlisted ? model.filter(prop => !isCallableInterfaceProperty(prop, this.helpers)) : model;
        return superPartials.propertiesTable(filtered, options);
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
        const paramExtensionTag = model.comment?.getTag('@paramExtension');
        const delimiter = '\n\n';

        const customizedOptions = {
          ...options,
          // Hide the title by default, only show it if the `@displayFunctionSignature` tag is present
          hideTitle: !displayFunctionSignatureTag,
        };
        const customizedModel = model;
        customizedModel.typeParameters = undefined;

        let output = superPartials.signature(customizedModel, customizedOptions);

        // If there are extra tags, split the output by the delimiter and do the work
        if (displayFunctionSignatureTag || paramExtensionTag) {
          let splitOutput = output.split(delimiter);

          if (displayFunctionSignatureTag) {
            // Change position of the 0 index and 2 index of the output
            // This way the function signature is below the description
            splitOutput = swap(splitOutput, 0, 2);
          }

          if (paramExtensionTag) {
            const stuff = this.helpers.getCommentParts(paramExtensionTag.content);

            // Find the index of the item that contains '## Parameters'
            const parametersIndex = splitOutput.findIndex(item => item.includes('## Parameters'));

            if (parametersIndex !== -1) {
              // Find the immediate next heading after '## Parameters'
              const nextHeadingIndex = splitOutput.findIndex((item, index) => {
                // Skip the items before the parameters
                if (index <= parametersIndex) return false;
                // Find the next heading
                return item.startsWith('##') || item.startsWith('\n##');
              });

              // Insert the stuff before the next heading
              // (or at the end of the entire page if no heading found)
              const insertIndex = nextHeadingIndex !== -1 ? nextHeadingIndex : splitOutput.length;
              splitOutput.splice(insertIndex, 0, stuff);
            }
          }

          // Join the output again
          output = splitOutput.join(delimiter);
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

        if (!opts.nested && model.type && isIntersectionTypeDoc(model.type)) {
          const merged = mergeIntersectionPropertyReflections(
            /** @type {import('typedoc').IntersectionType} */ (model.type),
            model.project,
          );
          if (merged.length > 0) {
            const output = renderMergedIntersectionDeclaration(this, customizedModel, opts, merged, superPartials);
            return output.replace(/^## Type declaration$/gm, '');
          }
        }

        // Create a local override
        const localPartials = {
          ...this.partials,
          declarationTitle: () => '',
        };
        // Store original so that we can restore it later
        const originalPartials = this.partials;

        this.partials = localPartials;
        const output = superPartials.declaration(customizedModel, options);
        this.partials = originalPartials;

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

        const output = withCorrectWhitespaceAtStart
          // Remove any backticks
          .replace(/`/g, '')
          // Remove any `<code>` and `</code>` tags
          .replace(/<code>/g, '')
          .replace(/<\/code>/g, '');

        // Only wrap in <code> if NOT inside a function signature
        if (this._insideFunctionSignature) {
          return output;
        }

        return `<code>${output}</code>`;
      },
      /**
       * This modifies the output of union types by wrapping everything in a single `<code>foo | bar</code>` tag instead of doing `<code>foo</code>` | `<code>bar</code>`
       * @param {import('typedoc').UnionType} model
       */
      unionType: model => {
        const defaultOutput = superPartials.unionType(model);

        const output = defaultOutput
          // Escape stuff that would be turned into markdown
          .replace(/__experimental_/g, '\\_\\_experimental\\_')
          // Remove any backticks
          .replace(/`/g, '')
          // Remove any `<code>` and `</code>` tags
          .replace(/<code>/g, '')
          .replace(/<\/code>/g, '');

        // Only wrap in <code> if NOT inside a function signature
        if (this._insideFunctionSignature) {
          return output;
        }

        return `<code>${output}</code>`;
      },
      /**
       * This ensures that everything is wrapped in a single codeblock
       * @param {import('typedoc').SignatureReflection[]} model
       * @param {{ forceParameterType?: boolean; typeSeparator?: string }} [options]
       */
      functionType: (model, options) => {
        const defaultOutput = superPartials.functionType(model, options);
        const delimiter = this.options.getValue('useCodeBlocks') ? ';\n' : '; ';

        const output = defaultOutput
          .split(delimiter)
          .map(fn =>
            fn
              // Remove any backticks
              .replace(/`/g, '')
              // Remove any `<code>` and `</code>` tags
              .replace(/<code>/g, '')
              .replace(/<\/code>/g, ''),
          )
          .join(delimiter);

        // Only wrap in <code> if NOT inside a function signature
        if (this._insideFunctionSignature) {
          return output;
        }

        return `<code>${output}</code>`;
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
        const defaultOutput = superPartials.arrayType(model);

        const output = defaultOutput
          // Remove any backticks
          .replace(/`/g, '')
          // Remove any `<code>` and `</code>` tags
          .replace(/<code>/g, '')
          .replace(/<\/code>/g, '');

        // Only wrap in <code> if NOT inside a function signature
        if (this._insideFunctionSignature) {
          return output;
        }

        return `<code>${output}</code>`;
      },
      /**
       * Ensures that reflection types (like Simplify wrapped types) are wrapped in a single codeblock
       * @param {import('typedoc').ReflectionType} model
       */
      reflectionType: model => {
        const defaultOutput = superPartials.reflectionType(model);

        const output = defaultOutput
          // Remove any backticks
          .replace(/`/g, '')
          // Remove any `<code>` and `</code>` tags
          .replace(/<code>/g, '')
          .replace(/<\/code>/g, '');

        // Only wrap in <code> if NOT inside a function signature
        if (this._insideFunctionSignature) {
          return output;
        }

        return `<code>${output}</code>`;
      },
      /**
       * Hide "Extends" and "Extended by" sections
       */
      hierarchy: () => '',
      /**
       * @param {import('typedoc').DeclarationReflection} model
       */
      accessor: model => {
        // Fallback single-row rendering if used directly elsewhere
        const name = model.name;
        const typeStr = model.getSignature?.type ? this.partials.someType(model.getSignature.type) : '';
        const summary = model.getSignature?.comment?.summary ?? model.comment?.summary;
        const description = Array.isArray(summary) ? summary.reduce((acc, curr) => acc + (curr.text || ''), '') : '';
        return '| ' + '`' + escapeChars(name) + '`' + ' | ' + typeStr + ' | ' + description + ' |';
      },
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

/**
 * @param {string} str
 */
function escapeChars(str) {
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
 *
 * @param {string[]} arr
 * @param {number} i
 * @param {number} j
 * @returns
 */
function swap(arr, i, j) {
  let t = arr[i];
  arr[i] = arr[j];
  arr[j] = t;
  return arr;
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
       * For `type Fn = (a: T) => U`, TypeDoc may attach call signatures to the TypeAlias reflection.
       * `getDeclarationType` then returns `signatures[0].type` (here `U`), not the full function type, so we
       * mis-classify properties typed as that alias (e.g. `navigate: CustomNavigation`) as non-callable.
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

export { isCallableInterfaceProperty };
