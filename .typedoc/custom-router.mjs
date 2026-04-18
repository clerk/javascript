// @ts-check
import { ReflectionKind } from 'typedoc';
import { MemberRouter } from 'typedoc-plugin-markdown';

import { REFERENCE_OBJECT_PAGE_SYMBOLS } from './reference-objects.mjs';

/** @type {Set<string>} */
const REFERENCE_OBJECT_SYMBOL_NAMES = new Set(Object.values(REFERENCE_OBJECT_PAGE_SYMBOLS));

/**
 * From a filepath divided by `/` only keep the first and last part
 * @param {string} filePath
 */
function flattenDirName(filePath) {
  const parts = filePath.split('/');
  if (parts.length > 2) {
    return `${parts[0]}/${parts[parts.length - 1]}`;
  }
  return filePath;
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
  app.renderer.defineRouter('clerk-router', ClerkRouter);
}

/**
 * Our custom router that changes the file output
 * @extends MemberRouter
 */
class ClerkRouter extends MemberRouter {
  /**
   * @param {import('typedoc').ProjectReflection} project
   */
  buildPages(project) {
    const pages = super.buildPages(project);

    const modifiedPages = pages
      /**
       * Do not output README files
       * They can be `readme.mdx` or `readme-1.mdx` & `readme-2.mdx` etc.
       */
      .filter(page => {
        const isExactMatch = page.url.toLocaleLowerCase().endsWith('readme.mdx');
        const isMatchWithNumber = page.url.toLocaleLowerCase().match(/readme-\d+\.mdx$/);

        if (isExactMatch || isMatchWithNumber) {
          return false;
        }

        /**
         * `@inline` marks types that should be expanded at use sites, not documented as their own page.
         * TypeDoc still assigns `fullUrls` for exported aliases, so we also strip links in the theme's `referenceType` partial (`custom-theme.mjs`).
         */
        const model = page.model;
        if (
          model &&
          'comment' in model &&
          /** @type {{ comment?: import('typedoc').Comment | undefined }} */ (model).comment?.hasModifier('@inline')
        ) {
          return false;
        }

        return true;
      });

    return modifiedPages;
  }

  /**
   * @param {import('typedoc').Reflection} reflection
   */
  getIdealBaseName(reflection) {
    const original = super.getIdealBaseName(reflection);
    // Convert URLs (by default camelCase) to kebab-case
    let filePath = toKebabCase(original);

    /**
     * By default, the paths are deeply nested, e.g.:
     * - clerk-react/functions/use-clerk
     * - shared/react/hooks/use-user
     *
     * This should be flattened to:
     * - clerk-react/use-clerk
     * - shared/use-user
     */
    filePath = flattenDirName(filePath);

    /**
     * Put each reference object in its own folder alongside `properties.mdx` and `methods/` from `extract-methods.mjs`.
     * E.g. `shared/clerk.mdx` -> `shared/clerk/clerk.mdx`, `shared/clerk/properties.mdx`, and `shared/clerk/methods/`.
     */
    if (
      (reflection.kind === ReflectionKind.Interface || reflection.kind === ReflectionKind.Class) &&
      REFERENCE_OBJECT_SYMBOL_NAMES.has(reflection.name)
    ) {
      const kebab = toKebabCase(reflection.name);
      const m = filePath.match(/^([^/]+)\/([^/]+)$/);
      if (m) {
        const [, pkg] = m;
        return `${pkg}/${kebab}/${kebab}`;
      }
    }

    return filePath;
  }
}
