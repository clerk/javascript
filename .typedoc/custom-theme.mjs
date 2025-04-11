// @ts-check
import { ReflectionType, UnionType } from 'typedoc';
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
       * This hides the "Type parameters" section and the signature title from the output
       * @param {import('typedoc').SignatureReflection} model
       * @param {{ headingLevel: number, nested?: boolean, accessor?: string, multipleSignatures?: boolean; hideTitle?: boolean }} options
       */
      signature: (model, options) => {
        const customizedOptions = {
          ...options,
          hideTitle: true,
        };
        const customizedModel = model;
        customizedModel.typeParameters = undefined;

        const output = superPartials.signature(customizedModel, customizedOptions);

        return output;
      },
      /**
       * This hides the "Type parameters" section from the output
       * @param {import('typedoc').DeclarationReflection} model
       * @param {{ headingLevel: number }} options
       */
      memberWithGroups: (model, options) => {
        const customizedModel = model;
        customizedModel.typeParameters = undefined;

        const output = superPartials.memberWithGroups(customizedModel, options);

        return output;
      },
      /**
       * This hides the "Type parameters" section and the declaration title from the output
       * @param {import('typedoc').DeclarationReflection} model
       * @param {{ headingLevel: number, nested?: boolean }} options
       */
      declaration: (model, options = { headingLevel: 2, nested: false }) => {
        // Create a local override
        const localPartials = {
          ...this.partials,
          declarationTitle: () => '',
        };
        // Store original so that we can restore it later
        const originalPartials = this.partials;

        const customizedModel = model;
        customizedModel.typeParameters = undefined;

        this.partials = localPartials;
        const output = superPartials.declaration(customizedModel, options);
        this.partials = originalPartials;

        return output;
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

        return `<code>${output}</code>`;
      },
      /**
       * This ensures that everything is wrapped in a single codeblock (not individual ones)
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

        return `<code>${output}</code>`;
      },
      /**
       * Copied from original theme.
       * Changes:
       * - Remove summaries over tables (TODO: Use elementSummaries instead)
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
        if (model.type instanceof UnionType) {
          const elementSummaries = model.type?.elementSummaries;
          model.type.types.forEach((type, i) => {
            if (type instanceof ReflectionType) {
              md.push(this.partials.typeDeclarationContainer(model, type.declaration, options));
            } else {
              md.push(`${this.partials.someType(type)}`);
            }
            if (elementSummaries?.[i]) {
              md.push(this.helpers.getCommentParts(elementSummaries[i]));
            }
          });
        }
        return md.join('\n');
      },
    };
  }
}
