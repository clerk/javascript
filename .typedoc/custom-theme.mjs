// @ts-check
import { ReflectionKind } from 'typedoc';
import { MarkdownTheme, MarkdownThemeContext } from 'typedoc-plugin-markdown';

/**
 * @param {import('typedoc-plugin-markdown').MarkdownApplication} app
 */
export function load(app) {
  app.renderer.defineTheme('clerkTheme', ClerkMarkdownTheme);
}

class ClerkMarkdownTheme extends MarkdownTheme {
  /**
   * @param {import('typedoc-plugin-markdown').MarkdownPageEvent} page
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
   * @param {import('typedoc-plugin-markdown').MarkdownPageEvent} page
   * @param {MarkdownTheme["application"]["options"]} options
   */
  constructor(theme, page, options) {
    super(theme, page, options);

    const superPartials = this.partials;

    this.partials = {
      ...superPartials,
      /**
       * Copied from default theme / source code. This hides the return type from the output
       * https://github.com/typedoc2md/typedoc-plugin-markdown/blob/179a54c502b318cd4f3951e5e8b90f7f7a4752d8/packages/typedoc-plugin-markdown/src/theme/context/partials/member.signatureReturns.ts
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

        md.push(heading(options.headingLevel, this.i18n.theme_returns()));

        if (model.comment?.blockTags.length) {
          const tags = model.comment.blockTags
            .filter(tag => tag.tag === '@returns')
            .map(tag => this.helpers.getCommentParts(tag.content));
          md.push(tags.join('\n\n'));
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
       * https://github.com/typedoc2md/typedoc-plugin-markdown/blob/179a54c502b318cd4f3951e5e8b90f7f7a4752d8/packages/typedoc-plugin-markdown/src/theme/context/partials/member.signature.ts
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
          md.push(heading(options.headingLevel, this.internationalization.kindPluralString(ReflectionKind.Parameter)));
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
       * https://github.com/typedoc2md/typedoc-plugin-markdown/blob/179a54c502b318cd4f3951e5e8b90f7f7a4752d8/packages/typedoc-plugin-markdown/src/theme/context/partials/member.memberWithGroups.ts#L58
       * @param {import('typedoc').DeclarationReflection} model
       * @param {{ headingLevel: number }} options
       */
      memberWithGroups: (model, options) => {
        const md = [];

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
          md.push(heading(options.headingLevel, this.i18n.theme_implements()));
          md.push(
            unorderedList(model.implementedTypes.map(implementedType => this.partials.someType(implementedType))),
          );
        }

        if (model.kind === ReflectionKind.Class && model.categories?.length) {
          model.groups
            ?.filter(group => group.title === this.i18n.kind_plural_constructor())
            .forEach(group => {
              md.push(heading(options.headingLevel, this.i18n.kind_plural_constructor()));
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
          md.push(heading(options.headingLevel, this.i18n.theme_indexable()));
          model.indexSignatures.forEach(indexSignature => {
            md.push(this.partials.indexSignature(indexSignature));
          });
        }

        md.push(this.partials.body(model, { headingLevel: options.headingLevel }));

        return md.join('\n\n');
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
 * @returns
 */
function unorderedList(items) {
  return items.map(item => `- ${item}`).join('\n');
}
