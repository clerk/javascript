// @ts-check
import { MarkdownRendererEvent } from 'typedoc-plugin-markdown';

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
    // Do not output README.mdx files
    output.urls = output.urls
      ?.filter(e => !e.url.endsWith('README.mdx'))
      .map(e => {
        // Convert URLs (by default camelCase) to kebab-case
        const kebabUrl = toKebabCase(e.url);

        e.url = kebabUrl;
        e.model.url = kebabUrl;

        return e;
      });
  });
}
