// @ts-check
import { MarkdownPageEvent, MarkdownRendererEvent } from 'typedoc-plugin-markdown';

/**
 * A list of files where we want to remove any headings
 */
const FILES_WITHOUT_HEADINGS = [
  'use-organization-return.mdx',
  'use-organization-params.mdx',
  'paginated-resources.mdx',
  'pages-or-infinite-options.mdx',
  'pages-or-infinite-options.mdx',
  'paginated-hook-config.mdx',
  'use-organization-list-return.mdx',
  'use-organization-list-params.mdx',
];

/**
 * An array of tuples where the first element is the file name and the second element is the new path.
 */
const LINK_REPLACEMENTS = [
  ['clerk-paginated-response', '/docs/references/javascript/types/clerk-paginated-response'],
  ['paginated-resources', '#paginated-resources'],
];

/**
 * Inside the generated MDX files are links to other generated MDX files. These relative links need to be replaced with absolute links to pages that exist on clerk.com.
 * For example, `[Foobar](../../foo/bar.mdx)` needs to be replaced with `[Foobar](/docs/foo/bar)`.
 * It also shouldn't matter how level deep the relative link is.
 *
 * This function returns an array of `{ pattern: string, replace: string }` to pass into the `typedoc-plugin-replace-text` plugin.
 */
function getRelativeLinkReplacements() {
  return LINK_REPLACEMENTS.map(([fileName, newPath]) => {
    return {
      pattern: new RegExp(`\\((?:\\.{1,2}\\/)+.*?${fileName}\\.mdx\\)`, 'g'),
      replace: `(${newPath})`,
    };
  });
}

/**
 * @param {string} str
 */
function toKebabCase(str) {
  return str.replace(/((?<=[a-z\d])[A-Z]|(?<=[A-Z\d])[A-Z](?=[a-z]))/g, '-$1').toLowerCase();
}

/**
 * @param {import('typedoc-plugin-markdown').MarkdownApplication} app
 */
export function load(app) {
  app.renderer.on(MarkdownRendererEvent.BEGIN, output => {
    // Modify the output object
    output.urls = output.urls
      // Do not output README.mdx files
      ?.filter(e => !e.url.endsWith('README.mdx'))
      .map(e => {
        // Convert URLs (by default camelCase) to kebab-case
        const kebabUrl = toKebabCase(e.url);

        e.url = kebabUrl;
        e.model.url = kebabUrl;

        /**
         * For the `@clerk/shared` package it outputs the hooks as for example: shared/react/hooks/use-clerk/functions/use-clerk.mdx.
         * It also places the interfaces as shared/react/hooks/use-organization/interfaces/use-organization-return.mdx
         * Group all those .mdx files under shared/react/hooks
         */
        if (e.url.includes('shared/react/hooks')) {
          e.url = e.url.replace(/\/[^/]+\/(functions|interfaces)\//, '/');
          e.model.url = e.url;
        }

        return e;
      });
  });

  app.renderer.on(MarkdownPageEvent.END, output => {
    const fileName = output.url.split('/').pop();
    const linkReplacements = getRelativeLinkReplacements();

    for (const { pattern, replace } of linkReplacements) {
      if (output.contents) {
        output.contents = output.contents.replace(pattern, replace);
      }
    }

    if (fileName) {
      if (FILES_WITHOUT_HEADINGS.includes(fileName)) {
        if (output.contents) {
          // Remove any headings from the file, irrespective of the level
          output.contents = output.contents.replace(/^#+\s.+/gm, '');
        }
      }
    }
  });
}
