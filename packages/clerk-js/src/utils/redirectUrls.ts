import { applyFunctionToObj, filterProps, removeUndefined } from '@clerk/shared/object';
import { camelToSnake } from '@clerk/shared/underscore';
import type { ClerkOptions, RedirectOptions } from '@clerk/types';

import { assertNoLegacyProp, warnForNewPropShadowingLegacyProp } from './assertNoLegacyProp';
import { isAllowedRedirectOrigin, relativeToAbsoluteUrl } from './url';

export class RedirectUrls {
  private static keys: (keyof RedirectOptions)[] = [
    'signInForceRedirectUrl',
    'signInFallbackRedirectUrl',
    'signUpForceRedirectUrl',
    'signUpFallbackRedirectUrl',
    'afterSignInUrl',
    'afterSignUpUrl',
    'redirectUrl',
  ];

  private static preserved = ['redirectUrl'];

  private readonly options: ClerkOptions;
  private readonly fromOptions: RedirectOptions;
  private readonly fromProps: RedirectOptions;
  private readonly fromSearchParams: RedirectOptions & { redirectUrl?: string | null };

  constructor(options: ClerkOptions, props: RedirectOptions = {}, searchParams: any = {}) {
    this.options = options;
    this.fromOptions = this.#parse(options || {});
    this.fromProps = this.#parse(props || {});
    this.fromSearchParams = this.#parseSearchParams(searchParams || {});
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
    const afterSignInUrl =
      this.fromSearchParams.afterSignInUrl || this.fromProps.afterSignInUrl || this.fromOptions.afterSignInUrl;
    const afterSignUpUrl =
      this.fromSearchParams.afterSignUpUrl || this.fromProps.afterSignUpUrl || this.fromOptions.afterSignUpUrl;
    const redirectUrl = this.fromSearchParams.redirectUrl || this.fromProps.redirectUrl || this.fromOptions.redirectUrl;

    const res: RedirectOptions = {
      signUpForceRedirectUrl,
      signUpFallbackRedirectUrl,
      signInFallbackRedirectUrl,
      signInForceRedirectUrl,
      afterSignInUrl,
      afterSignUpUrl,
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
    let newKeyInUse: string | undefined;

    const legacyPropKey = `after${prefix[0].toUpperCase()}${prefix.slice(1)}Url` as 'afterSignInUrl' | 'afterSignUpUrl';

    let result;
    // Prioritize forceRedirectUrl
    result = this.fromSearchParams[forceKey] || this.fromProps[forceKey] || this.fromOptions[forceKey];
    if (result) {
      newKeyInUse = forceKey;
    }
    // Try to get redirect_url, only allowed as a search param
    result ||= this.fromSearchParams.redirectUrl;
    if (result) {
      newKeyInUse = 'redirectUrl';
    }
    // Otherwise, fallback to fallbackRedirectUrl
    result ||= this.fromSearchParams[fallbackKey] || this.fromProps[fallbackKey] || this.fromOptions[fallbackKey];
    if (result) {
      newKeyInUse = fallbackKey;
    }

    // TODO: v6
    // Remove the compatibility layer for afterSignInUrl and afterSignUpUrl
    const legacyValue =
      this.fromSearchParams[legacyPropKey] ||
      this.fromProps[legacyPropKey] ||
      this.fromProps.redirectUrl ||
      this.fromOptions[legacyPropKey];

    warnForNewPropShadowingLegacyProp(newKeyInUse, result, legacyPropKey, legacyValue);
    result ||= legacyValue;

    return result || '/';
  }

  #parse(obj: unknown) {
    assertNoLegacyProp(obj as any);
    const res = {} as RedirectOptions;
    RedirectUrls.keys.forEach(key => {
      // @ts-expect-error
      res[key] = obj[key];
    });
    return this.#toAbsoluteUrls(this.#filterOrigins(res));
  }

  #parseSearchParams(obj: any) {
    assertNoLegacyProp(obj);
    const res = {} as typeof this.fromSearchParams;
    RedirectUrls.keys.forEach(key => {
      res[key] = obj[camelToSnake(key)];
    });
    res['redirectUrl'] = obj.redirect_url;
    return this.#toAbsoluteUrls(this.#filterOrigins(res));
  }

  #toAbsoluteUrls(obj: RedirectOptions) {
    return applyFunctionToObj(obj, (url: string) => relativeToAbsoluteUrl(url, window.location.origin));
  }

  #filterOrigins = (obj: RedirectOptions) => {
    return filterProps(obj, isAllowedRedirectOrigin(this.options?.allowedRedirectOrigins));
  };
}
