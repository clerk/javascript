// @ts-check
import { ReflectionKind, ReflectionType, UnionType } from 'typedoc';
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

            // Find the index of the item that contains '## Returns'
            const index = splitOutput.findIndex(item => item.includes('## Returns'));

            // If the index is found, insert the stuff before it
            if (index !== -1) {
              splitOutput.splice(index, 0, stuff);
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

        md.push(this.partials.signatureParameters(model.parameters || []));

        if (model.type) {
          md.push(`: ${this.partials.someType(model.type)}`);
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

        return `This function returns a discriminated union type. There are multiple variants of this type available which you can select by clicking on one of the tabs.

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

        return `<code>${output}</code>`;
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
