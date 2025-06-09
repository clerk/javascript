// @ts-check
import { PageKind, Reflection, ReflectionKind } from 'typedoc';
import { MemberRouter } from 'typedoc-plugin-markdown';

/**
 * @param {import('typedoc').Reflection} reflection
 */
function isMethod(reflection) {
  return reflection.kind === ReflectionKind.Method;
}

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
  directories = new Map([
    [ReflectionKind.Class, 'classes'],
    [ReflectionKind.Interface, 'interfaces'],
    [ReflectionKind.Enum, 'enumerations'],
    [ReflectionKind.Namespace, 'namespaces'],
    [ReflectionKind.TypeAlias, 'type-aliases'],
    [ReflectionKind.Function, 'functions'],
    [ReflectionKind.Variable, 'variables'],
    [ReflectionKind.Document, 'documents'],
    [ReflectionKind.Method, 'methods'], // Added to include methods in the output
  ]);

  kindsToString = new Map([
    [ReflectionKind.Module, 'Module'],
    [ReflectionKind.Namespace, 'Namespace'],
    [ReflectionKind.Document, 'Document'],
    [ReflectionKind.Class, 'Class'],
    [ReflectionKind.Interface, 'Interface'],
    [ReflectionKind.Enum, 'Enum'],
    [ReflectionKind.TypeAlias, 'TypeAlias'],
    [ReflectionKind.Function, 'Function'],
    [ReflectionKind.Variable, 'Variable'],
    [ReflectionKind.Method, 'Method'], // Added to include methods in the output
  ]);

  // @ts-ignore - test
  membersWithOwnFile = [
    'Enum',
    'Variable',
    'Function',
    'Class',
    'Interface',
    'TypeAlias',
    'Method', // Added to include methods in the output
  ];

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

    console.log(filePath);

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

  /**
   * @param {import('typedoc').RouterTarget} target
   * @return {import('typedoc').PageKind | undefined}
   */
  getPageKind(target) {
    if (!(target instanceof Reflection)) {
      return undefined;
    }

    const pageReflectionKinds =
      ReflectionKind.Class |
      ReflectionKind.Interface |
      ReflectionKind.Enum |
      ReflectionKind.Module |
      ReflectionKind.Namespace |
      ReflectionKind.TypeAlias |
      ReflectionKind.Function |
      ReflectionKind.Variable |
      /**
       * This is the addition to the original source code to output methods, too
       */
      ReflectionKind.Method;
    const documentReflectionKinds = ReflectionKind.Document;

    if (target.kindOf(pageReflectionKinds)) {
      return PageKind.Reflection;
    }

    if (target.kindOf(documentReflectionKinds)) {
      return PageKind.Document;
    }

    return undefined;
  }
}
