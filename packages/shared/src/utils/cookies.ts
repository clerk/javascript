import Cookies from 'js-cookie';

type LocationAttributes = {
  path?: string;
  domain?: string;
};

type CookieName = string | undefined;

export function createCookieHandler(initialCookieName?: string) {
  return {
    get(cookieName: CookieName = '') {
      return Cookies.get(initialCookieName || cookieName);
    },
    /**
     * Setting a cookie will use some defaults such as path being set to "/".
     */
    set(newValue: string, options: Cookies.CookieAttributes = {}, cookieName: CookieName = '') {
      return Cookies.set(initialCookieName || cookieName, newValue, options);
    },
    /**
     * On removing a cookie, you have to pass the exact same path/domain attributes used to set it initially
     * @see https://github.com/js-cookie/js-cookie#basic-usage
     */
    remove(locationAttributes?: LocationAttributes, cookieName: CookieName = '') {
      Cookies.remove(initialCookieName || cookieName, locationAttributes);
    },
  };
}
