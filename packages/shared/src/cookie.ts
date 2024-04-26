import Cookies from 'js-cookie';

type LocationAttributes = {
  path?: string;
  domain?: string;
};

export function createCookieHandler(cookieName: string) {
  return {
    get() {
      return Cookies.get(cookieName);
    },
    /**
     * Setting a cookie will use some defaults such as path being set to "/".
     */
    set(newValue: string, options: Cookies.CookieAttributes = {}): void {
      Cookies.set(cookieName, newValue, options);
    },
    /**
     * On removing a cookie, you have to pass the exact same path/domain attributes used to set it initially
     * @see https://github.com/js-cookie/js-cookie#basic-usage
     */
    remove(locationAttributes?: LocationAttributes) {
      Cookies.remove(cookieName, locationAttributes);
    },
  };
}
