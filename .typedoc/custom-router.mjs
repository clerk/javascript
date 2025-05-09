// @ts-check
import { MemberRouter } from 'typedoc-plugin-markdown';

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

        return !(isExactMatch || isMatchWithNumber);
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

    return filePath;
  }
}
