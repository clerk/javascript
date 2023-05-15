/* eslint-disable no-restricted-globals */

export class GlobalsAccessor {
  static get window() {
    if (!GlobalsAccessor.inBrowser) {
      GlobalsAccessor.#isNonBrowserError('window');
    }
    return window;
  }

  static get document() {
    if (!GlobalsAccessor.inBrowser) {
      GlobalsAccessor.#isNonBrowserError('document');
    }
    return document;
  }

  static get inBrowser() {
    return typeof document !== 'undefined' && typeof window !== 'undefined';
  }

  static #isNonBrowserError = (variable: string) => {
    const message = `Clerk is not running in a browser environment. Trying to access ${variable} will not work.`;
    console.warn(message);
    throw new Error(message);
  };
}
