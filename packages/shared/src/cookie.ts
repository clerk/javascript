import Cookies from 'js-cookie';

/**
 * Mirrors js-cookie's `CookieAttributes`. Defined locally so the published d.ts is
 * self-contained: the bundler drops the js-cookie import from the declaration output
 * and `@types/js-cookie` is only a devDependency, so consumers could never resolve
 * the original reference.
 */
export interface CookieAttributes {
  /**
   * Define when the cookie will be removed. Value can be a Number
   * which will be interpreted as days from time of creation or a
   * Date instance. If omitted, the cookie becomes a session cookie.
   */
  expires?: number | Date | undefined;

  /**
   * Define the path where the cookie is available. Defaults to '/'
   */
  path?: string | undefined;

  /**
   * Define the domain where the cookie is available. Defaults to
   * the domain of the page where the cookie was created.
   */
  domain?: string | undefined;

  /**
   * A Boolean indicating if the cookie transmission requires a
   * secure protocol (https). Defaults to false.
   */
  secure?: boolean | undefined;

  /**
   * Asserts that a cookie must not be sent with cross-origin requests,
   * providing some protection against cross-site request forgery
   * attacks (CSRF)
   */
  sameSite?: 'strict' | 'Strict' | 'lax' | 'Lax' | 'none' | 'None' | undefined;

  /**
   * A Boolean indicating whether the cookie is partitioned per top-level
   * site (CHIPS). js-cookie serializes it through the attribute passthrough;
   * declared explicitly because Clerk sets it at several call sites.
   */
  partitioned?: boolean | undefined;

  /**
   * An attribute which will be serialized, conformably to RFC 6265
   * section 5.2.
   */
  [property: string]: any;
}

/**
 * Creates helper methods for dealing with a specific cookie.
 *
 * @example
 * ```ts
 * const cookie = createCookieHandler('my_cookie')
 *
 * cookie.set('my_value');
 * cookie.get() // 'my_value';
 * cookie.remove()
 * ```
 */
export function createCookieHandler(cookieName: string) {
  return {
    get() {
      return Cookies.get(cookieName);
    },
    /**
     * Setting a cookie will use some defaults such as path being set to "/".
     */
    set(newValue: string, options: CookieAttributes = {}): void {
      Cookies.set(cookieName, newValue, options);
    },
    /**
     * On removing a cookie, you have to pass the exact same path/domain attributes used to set it initially
     * > IMPORTANT! When deleting a cookie and you're not relying on the default attributes, you must pass the exact same path, domain, secure and sameSite attributes that were used to set the cookie.
     *
     * @see https://github.com/js-cookie/js-cookie#basic-usage
     */
    remove(cookieAttributes?: CookieAttributes): void {
      Cookies.remove(cookieName, cookieAttributes);
    },
  };
}
