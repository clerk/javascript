import { applyFunctionToObj, filterProps, removeUndefined } from '@clerk/shared/object';
import type { ClerkOptions, RedirectOptions } from '@clerk/shared/types';
import { camelToSnake } from '@clerk/shared/underscore';

import { assertNoLegacyProp } from './assertNoLegacyProp';
import { isAllowedRedirect, relativeToAbsoluteUrl } from './url';

type ComponentMode = 'modal' | 'mounted';

export class RedirectUrls {
  private static keys: (keyof RedirectOptions)[] = [
    'signInForceRedirectUrl',
    'signInFallbackRedirectUrl',
    'signUpForceRedirectUrl',
    'signUpFallbackRedirectUrl',
  ];

  private static preserved = ['redirectUrl'];

  private readonly options: ClerkOptions;
  private readonly fromOptions: RedirectOptions;
  private readonly fromProps: RedirectOptions;
  private readonly fromSearchParams: RedirectOptions & { redirectUrl?: string | null };
  private readonly mode?: ComponentMode;

  constructor(options: ClerkOptions, props: RedirectOptions = {}, searchParams: any = {}, mode?: ComponentMode) {
    this.options = options;
    this.fromOptions = this.#parse(options || {});
    this.fromProps = this.#parse(props || {});
    this.fromSearchParams = this.#parseSearchParams(searchParams || {});
    this.mode = mode;
  }

  getAfterSignInUrl() {
    return this.#getRedirectUrl('signIn');
  }

  getAfterSignUpUrl() {
    return this.#getRedirectUrl('signUp');
  }

  getPreservedSearchParams() {
    return this.#toSearchParams(this.#flattenPreserved());
  }

  toSearchParams() {
    return this.#toSearchParams(this.#flattenAll());
  }

  #toSearchParams(obj: Record<string, string | undefined | null>): URLSearchParams {
    const camelCased = Object.fromEntries(Object.entries(obj).map(([key, value]) => [camelToSnake(key), value]));
    return new URLSearchParams(removeUndefined(camelCased) as Record<string, string>);
  }

  #flattenPreserved() {
    return Object.fromEntries(
      Object.entries({ ...this.fromSearchParams }).filter(([key]) => RedirectUrls.preserved.includes(key)),
    );
  }

  #flattenAll() {
    const signUpForceRedirectUrl =
      this.fromSearchParams.signUpForceRedirectUrl ||
      this.fromProps.signUpForceRedirectUrl ||
      this.fromOptions.signUpForceRedirectUrl;
    const signUpFallbackRedirectUrl =
      this.fromSearchParams.signUpFallbackRedirectUrl ||
      this.fromProps.signUpFallbackRedirectUrl ||
      this.fromOptions.signUpFallbackRedirectUrl;
    const signInForceRedirectUrl =
      this.fromSearchParams.signInForceRedirectUrl ||
      this.fromProps.signInForceRedirectUrl ||
      this.fromOptions.signInForceRedirectUrl;
    const signInFallbackRedirectUrl =
      this.fromSearchParams.signInFallbackRedirectUrl ||
      this.fromProps.signInFallbackRedirectUrl ||
      this.fromOptions.signInFallbackRedirectUrl;
    const redirectUrl = this.fromSearchParams.redirectUrl;

    const res: RedirectOptions & { redirectUrl?: string | null } = {
      signUpForceRedirectUrl,
      signUpFallbackRedirectUrl,
      signInFallbackRedirectUrl,
      signInForceRedirectUrl,
      redirectUrl,
    };

    if (signUpForceRedirectUrl) {
      delete res.signUpFallbackRedirectUrl;
    }

    if (signInForceRedirectUrl) {
      delete res.signInFallbackRedirectUrl;
    }

    return res;
  }

  #getRedirectUrl(prefix: 'signIn' | 'signUp') {
    const forceKey = `${prefix}ForceRedirectUrl` as const;
    const fallbackKey = `${prefix}FallbackRedirectUrl` as const;

    let result;
    // Prioritize forceRedirectUrl
    result = this.fromSearchParams[forceKey] || this.fromProps[forceKey] || this.fromOptions[forceKey];
    // Try to get redirect_url, only allowed as a search param
    result ||= this.fromSearchParams.redirectUrl;
    // Otherwise, fallback to fallbackRedirectUrl
    result ||= this.fromSearchParams[fallbackKey] || this.fromProps[fallbackKey] || this.fromOptions[fallbackKey];

    if (!result && this.mode === 'modal') {
      return window.location.href;
    }

    return result || '/';
  }

  #parse(obj: unknown) {
    assertNoLegacyProp(obj as any);
    const res = {} as RedirectOptions;
    RedirectUrls.keys.forEach(key => {
      // @ts-expect-error
      res[key] = obj[key];
    });
    return applyFunctionToObj(this.#filterRedirects(this.#toAbsoluteUrls(filterProps(res, Boolean))), val =>
      val.toString(),
    );
  }

  #parseSearchParams(obj: any) {
    assertNoLegacyProp(obj);
    const res = {} as typeof this.fromSearchParams;
    RedirectUrls.keys.forEach(key => {
      if (obj instanceof URLSearchParams) {
        res[key] = obj.get(camelToSnake(key));
      } else {
        res[key] = obj[camelToSnake(key)];
      }
    });
    return applyFunctionToObj(this.#filterRedirects(this.#toAbsoluteUrls(filterProps(res, Boolean))), val =>
      val.toString(),
    );
  }

  #toAbsoluteUrls(obj: RedirectOptions) {
    return applyFunctionToObj(obj, (url: string) => relativeToAbsoluteUrl(url, window.location.origin));
  }

  #filterRedirects = (obj: RedirectOptions) => {
    return filterProps(obj, isAllowedRedirect(this.options?.allowedRedirectOrigins, window.location.origin));
  };
}
