// @ts-check
import { MemberRouter } from 'typedoc-plugin-markdown';

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
      // Do not output README files
      .filter(page => !page.url.toLocaleLowerCase().endsWith('readme.mdx'));

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
     * For the `@clerk/shared` package it outputs the hooks as for example: shared/react/hooks/use-clerk/functions/use-clerk.mdx.
     * It also places the interfaces as shared/react/hooks/use-organization/interfaces/use-organization-return.mdx
     * Group all those .mdx files under shared/react/hooks
     */
    if (filePath.includes('shared/react/hooks')) {
      filePath = filePath.replace(/\/[^/]+\/(functions|interfaces)\//, '/');
    }

    return filePath;
  }
}
