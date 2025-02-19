// @ts-check
import { MarkdownTheme, MarkdownThemeContext } from 'typedoc-plugin-markdown';

/**
 * @param {import('typedoc-plugin-markdown').MarkdownApplication} app
 */
export function load(app) {
  app.renderer.defineTheme('clerkTheme', ClerkMarkdownTheme);
}

class ClerkMarkdownTheme extends MarkdownTheme {
  getRenderContext(page) {
    return new ClerkMarkdownThemeContext(this, page, this.application.options);
  }
}

class ClerkMarkdownThemeContext extends MarkdownThemeContext {
  partials = {
    ...this.partials,
    // Hide the function signature at the top of the page
    signatureTitle: () => ``,
  };
}
