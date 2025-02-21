// @ts-check
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
       * Hide the function signature at the top of the page
       */
      signatureTitle: () => ``,
      //
      /**
       * Copied from default theme / source code. This hides the return type from the output
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
    };
  }
}

/**
 * Returns a heading in markdown format
 * @param {number} level The level of the heading
 * @param {string} text The text of the heading
 */
export function heading(level, text) {
  level = level > 6 ? 6 : level;
  return `${[...Array(level)].map(() => '#').join('')} ${text}`;
}
