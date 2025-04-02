// @ts-check
import { MarkdownPageEvent } from 'typedoc-plugin-markdown';

/**
 * A list of files where we want to remove any headings
 * TODO: Move this logic to the custom-theme logic and don't change it after the fact
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
 * Ideally this is a temporary solution until every one of these files are published in production and can be linked to.
 */
const LINK_REPLACEMENTS = [
  ['clerk-paginated-response', '/docs/references/javascript/types/clerk-paginated-response'],
  ['paginated-resources', '#paginated-resources'],
  ['session-resource', '/docs/references/javascript/session'],
  ['signed-in-session-resource', '/docs/references/javascript/session'],
  ['sign-up-resource', '/docs/references/javascript/sign-up'],
  ['user-resource', '/docs/references/javascript/user'],
  ['session-status-claim', '/docs/references/javascript/types/session-status'],
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
      pattern: new RegExp(`\\((?:\\.{1,2}\\/)+[^()]*?${fileName}\\.mdx\\)`, 'g'),
      replace: `(${newPath})`,
    };
  });
}

function getUnlinkedTypesReplacements() {
  return [
    {
      pattern: /\(setActiveParams\)/g,
      replace: '([setActiveParams](/docs/references/javascript/types/set-active-params))',
    },
    {
      pattern: /`_LocalizationResource`/g,
      replace: '[Localization](/docs/customization/localization)',
    },
  ];
}

/**
 * @param {import('typedoc-plugin-markdown').MarkdownApplication} app
 */
export function load(app) {
  app.renderer.on(MarkdownPageEvent.END, output => {
    const fileName = output.url.split('/').pop();
    const linkReplacements = getRelativeLinkReplacements();

    for (const { pattern, replace } of linkReplacements) {
      if (output.contents) {
        output.contents = output.contents.replace(pattern, replace);
      }
    }

    const unlinkedTypesReplacements = getUnlinkedTypesReplacements();

    for (const { pattern, replace } of unlinkedTypesReplacements) {
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
