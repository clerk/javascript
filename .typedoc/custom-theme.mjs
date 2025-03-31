// @ts-check
import { ArrayType, i18n, IntersectionType, ReflectionKind, ReflectionType, UnionType } from 'typedoc';
import { MarkdownTheme, MarkdownThemeContext } from 'typedoc-plugin-markdown';

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

    this.partials = {
      ...superPartials,
      /**
       * Copied from default theme / source code. This hides the return type heading over the table from the output
       * https://github.com/typedoc2md/typedoc-plugin-markdown/blob/5d7c3c7fb816b6b009f3425cf284c95400f53929/packages/typedoc-plugin-markdown/src/theme/context/partials/member.signatureReturns.ts
       * @param {import('typedoc').SignatureReflection} model
       * @param {{ headingLevel: number }} options
       */
      signatureReturns: (model, options) => {
        const md = [];

        /**
         * @type any
         */
        const modelType = model.type;
        /**
         * @type {import('typedoc').DeclarationReflection}
         */
        const typeDeclaration = modelType?.declaration;

        md.push(heading(options.headingLevel, i18n.theme_returns()));

        const returnsTag = model.comment?.getTag('@returns');

        if (returnsTag) {
          md.push(this.helpers.getCommentParts(returnsTag.content));
        }

        if (typeDeclaration?.signatures) {
          typeDeclaration.signatures.forEach(signature => {
            md.push(
              this.partials.signature(signature, {
                headingLevel: options.headingLevel + 1,
                nested: true,
              }),
            );
          });
        }

        if (typeDeclaration?.children) {
          md.push(
            this.partials.typeDeclaration(typeDeclaration, {
              headingLevel: options.headingLevel,
            }),
          );
        }

        return md.join('\n\n');
      },
      /**
       * Copied from default theme / source code. This hides the "Type parameters" section and the signature title from the output
       * https://github.com/typedoc2md/typedoc-plugin-markdown/blob/5d7c3c7fb816b6b009f3425cf284c95400f53929/packages/typedoc-plugin-markdown/src/theme/context/partials/member.signature.ts
       * @param {import('typedoc').SignatureReflection} model
       * @param {{ headingLevel: number, nested?: boolean, accessor?: string, multipleSignatures?: boolean }} options
       */
      signature: (model, options) => {
        const md = [];

        if (!options.nested && model.sources && !this.options.getValue('disableSources')) {
          md.push(this.partials.sources(model));
        }

        let modelComments = options.multipleSignatures ? model.comment : model.comment || model.parent?.comment;

        if (modelComments && model.parent?.comment?.summary && !options.multipleSignatures) {
          modelComments = Object.assign(modelComments, {
            summary: model.parent.comment.summary,
          });
        }

        if (modelComments && model.parent?.comment?.blockTags) {
          modelComments.blockTags = [...(model.parent?.comment?.blockTags || []), ...(model.comment?.blockTags || [])];
        }

        if (modelComments) {
          md.push(
            this.partials.comment(modelComments, {
              headingLevel: options.headingLevel,
              showTags: false,
              showSummary: true,
            }),
          );
        }

        if (!options.multipleSignatures && model.parent?.documents) {
          md.push(
            this.partials.documents(model?.parent, {
              headingLevel: options.headingLevel,
            }),
          );
        }

        if (model.parameters?.length) {
          md.push(heading(options.headingLevel, ReflectionKind.pluralString(ReflectionKind.Parameter)));
          if (this.helpers.useTableFormat('parameters')) {
            md.push(this.partials.parametersTable(model.parameters));
          } else {
            md.push(
              this.partials.parametersList(model.parameters, {
                headingLevel: options.headingLevel,
              }),
            );
          }
        }

        if (model.type) {
          md.push(
            this.partials.signatureReturns(model, {
              headingLevel: options.headingLevel,
            }),
          );
        }

        if (modelComments) {
          md.push(
            this.partials.comment(modelComments, {
              headingLevel: options.headingLevel,
              showTags: true,
              showSummary: false,
            }),
          );
        }

        md.push(this.partials.inheritance(model, { headingLevel: options.headingLevel }));

        return md.join('\n\n');
      },
      /**
       * Copied from default theme / source code. This hides the "Type parameters" section from the output
       * https://github.com/typedoc2md/typedoc-plugin-markdown/blob/5d7c3c7fb816b6b009f3425cf284c95400f53929/packages/typedoc-plugin-markdown/src/theme/context/partials/member.memberWithGroups.ts
       * @param {import('typedoc').DeclarationReflection} model
       * @param {{ headingLevel: number }} options
       */
      memberWithGroups: (model, options) => {
        const md = [];

        if (model.kind === ReflectionKind.TypeAlias) {
          md.push(this.partials.declarationTitle(model));
        }

        if (
          ![ReflectionKind.Module, ReflectionKind.Namespace].includes(model.kind) &&
          model.sources &&
          !this.options.getValue('disableSources')
        ) {
          md.push(this.partials.sources(model));
        }

        if (model.comment) {
          md.push(
            this.partials.comment(model.comment, {
              headingLevel: options.headingLevel,
            }),
          );
        }

        if (model.typeHierarchy?.next) {
          md.push(
            this.partials.hierarchy(model.typeHierarchy, {
              headingLevel: options.headingLevel,
            }),
          );
        }

        if (model.implementedTypes?.length) {
          md.push(heading(options.headingLevel, i18n.theme_implements()));
          md.push(
            unorderedList(model.implementedTypes.map(implementedType => this.partials.someType(implementedType))),
          );
        }

        if (model.kind === ReflectionKind.Class && model.categories?.length) {
          model.groups
            ?.filter(group => group.title === i18n.kind_plural_constructor())
            .forEach(group => {
              md.push(heading(options.headingLevel, i18n.kind_plural_constructor()));
              group.children.forEach(child => {
                md.push(
                  this.partials.constructor(/** @type {import('typedoc').DeclarationReflection} */ (child), {
                    headingLevel: options.headingLevel + 1,
                  }),
                );
              });
            });
        }

        if ('signatures' in model && model.signatures?.length) {
          model.signatures.forEach(signature => {
            md.push(
              this.partials.signature(signature, {
                headingLevel: options.headingLevel,
              }),
            );
          });
        }

        if (model.indexSignatures?.length) {
          md.push(heading(options.headingLevel, i18n.theme_indexable()));
          model.indexSignatures.forEach(indexSignature => {
            md.push(this.partials.indexSignature(indexSignature));
          });
        }

        md.push(this.partials.body(model, { headingLevel: options.headingLevel }));

        return md.join('\n\n');
      },
      /**
       * Copied from default theme / source code. This hides the "Type parameters" section and the declaration title from the output
       * https://github.com/typedoc2md/typedoc-plugin-markdown/blob/5d7c3c7fb816b6b009f3425cf284c95400f53929/packages/typedoc-plugin-markdown/src/theme/context/partials/member.declaration.ts
       * @param {import('typedoc').DeclarationReflection} model
       * @param {{ headingLevel: number, nested?: boolean }} options
       */
      declaration: (model, options = { headingLevel: 2, nested: false }) => {
        const md = [];

        const opts = {
          nested: false,
          ...options,
        };

        if (!opts.nested && model.sources && !this.options.getValue('disableSources')) {
          md.push(this.partials.sources(model));
        }

        if (model?.documents) {
          md.push(
            this.partials.documents(model, {
              headingLevel: options.headingLevel,
            }),
          );
        }

        /**
         * @type any
         */
        const modelType = model.type;
        /**
         * @type {import('typedoc').DeclarationReflection}
         */
        let typeDeclaration = modelType?.declaration;

        if (model.type instanceof ArrayType && model.type?.elementType instanceof ReflectionType) {
          typeDeclaration = model.type?.elementType?.declaration;
        }

        const hasTypeDeclaration =
          Boolean(typeDeclaration) ||
          (model.type instanceof UnionType && model.type?.types.some(type => type instanceof ReflectionType));

        if (model.comment) {
          md.push(
            this.partials.comment(model.comment, {
              headingLevel: opts.headingLevel,
              showSummary: true,
              showTags: false,
            }),
          );
        }

        if (model.type instanceof IntersectionType) {
          model.type?.types?.forEach(intersectionType => {
            if (intersectionType instanceof ReflectionType && !intersectionType.declaration.signatures) {
              if (intersectionType.declaration.children) {
                md.push(heading(opts.headingLevel, i18n.theme_type_declaration()));

                md.push(
                  this.partials.typeDeclaration(intersectionType.declaration, {
                    headingLevel: opts.headingLevel,
                  }),
                );
              }
            }
          });
        }

        if (hasTypeDeclaration) {
          if (model.type instanceof UnionType) {
            if (this.helpers.hasUsefulTypeDetails(model.type)) {
              md.push(heading(opts.headingLevel, i18n.theme_type_declaration()));

              model.type.types.forEach(type => {
                if (type instanceof ReflectionType) {
                  md.push(this.partials.someType(type, { forceCollapse: true }));
                  md.push(this.partials.typeDeclarationContainer(model, type.declaration, options));
                } else {
                  md.push(`${this.partials.someType(type)}`);
                }
              });
            }
          } else {
            const useHeading =
              typeDeclaration?.children?.length &&
              (model.kind !== ReflectionKind.Property || this.helpers.useTableFormat('properties'));
            if (useHeading) {
              md.push(heading(opts.headingLevel, i18n.theme_type_declaration()));
            }
            md.push(this.partials.typeDeclarationContainer(model, typeDeclaration, options));
          }
        }
        if (model.comment) {
          md.push(
            this.partials.comment(model.comment, {
              headingLevel: opts.headingLevel,
              showSummary: false,
              showTags: true,
              showReturns: true,
            }),
          );
        }

        md.push(this.partials.inheritance(model, { headingLevel: opts.headingLevel }));

        return md.join('\n\n');
      },
      /**
       * Copied from default theme / source code. This modifies the output of union types by wrapping everything in a single `<code>foo | bar</code>` tag instead of doing `<code>foo</code>` | `<code>bar</code>`
       * https://github.com/typedoc2md/typedoc-plugin-markdown/blob/5d7c3c7fb816b6b009f3425cf284c95400f53929/packages/typedoc-plugin-markdown/src/theme/context/partials/type.union.ts
       * @param {import('typedoc').UnionType} model
       */
      unionType: model => {
        const useCodeBlocks = this.options.getValue('useCodeBlocks');
        const typesOut = model.types.map(unionType => {
          // So, .someType adds the backticks to the string and we don't want to deal with modifying that partial. So just remove any backticks in the next step again :shrug:
          const defaultResult = this.partials.someType(unionType, { forceCollapse: true });

          // Remove any backticks
          return defaultResult.replace(/`/g, '');
        });

        const shouldFormat = useCodeBlocks && (typesOut?.join('').length > 70 || typesOut?.join('').includes('\n'));

        const md = typesOut.join(shouldFormat ? `\n  \\| ` : ` \\| `);
        const result = shouldFormat ? `\n  \\| ` + md : md;

        return `<code>${result}</code>`;
      },
      /**
       * Copied from default theme / source code. This ensures that everything is wrapped in a single codeblock (not individual ones). If there are function overloads they will be split by a `; `.
       * https://github.com/typedoc2md/typedoc-plugin-markdown/blob/6cde68da7bdc048aa81f0fb2467034ae675c7e60/packages/typedoc-plugin-markdown/src/theme/context/partials/type.reflection.function.ts
       * @param {import('typedoc').SignatureReflection[]} model
       * @param {{ forceParameterType: boolean }} [options]
       */
      functionType: (model, options) => {
        const functions = model.map(fn => {
          const typeParams = fn.typeParameters
            ? `${this.helpers.getAngleBracket('<')}${fn.typeParameters
                .map(typeParameter => typeParameter.name)
                .join(', ')}${this.helpers.getAngleBracket('>')}`
            : '';
          const showParameterType = options?.forceParameterType || this.options.getValue('expandParameters');

          const params = fn.parameters
            ? fn.parameters.map(param => {
                const paramType = this.partials.someType(/** @type {import('typedoc').SomeType} */ param.type);
                const paramItem = [
                  `${param.flags?.isRest ? '...' : ''}${param.name}${param.flags?.isOptional ? '?' : ''}`,
                ];
                if (showParameterType) {
                  paramItem.push(paramType);
                }
                return paramItem.join(': ');
              })
            : [];
          const returns = this.partials.someType(/** @type {import('typedoc').SomeType} */ fn.type);
          return typeParams + `(${params.join(', ')}) => ${returns}`;
        });

        const cleanOutput = functions
          .map(fn => {
            return (
              fn
                // Remove any backticks
                .replace(/`/g, '')
                // Remove any `<code>` and `</code>` tags
                .replace(/<code>/g, '')
                .replace(/<\/code>/g, '')
            );
          })
          .join('; ');

        return `<code>${cleanOutput}</code>`;
      },
    };
  }
}

/**
 * Returns a heading in markdown format
 * @param {number} level The level of the heading
 * @param {string} text The text of the heading
 */
function heading(level, text) {
  level = level > 6 ? 6 : level;
  return `${[...Array(level)].map(() => '#').join('')} ${text}`;
}

/**
 * Create an unordered list from an array of items
 * @param {string[]} items
 */
function unorderedList(items) {
  return items.map(item => `- ${item}`).join('\n');
}
