import { applyFunctionToObj, filterProps, removeUndefined } from '@clerk/shared/object';
import { camelToSnake } from '@clerk/shared/underscore';
import type { ClerkOptions, RedirectOptions } from '@clerk/types';
import type { ParsedQs } from 'qs';

import { assertNoLegacyProp } from './assertNoLegacyProp';
import { buildURL, isAllowedRedirectOrigin, relativeToAbsoluteUrl } from './url';

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

  toSearchParams() {
    return this.#toSearchParams(this.#flattenPreservedProps());
  }

  appendPreservedPropsToUrl(url: string, _otherParams: ParsedQs = {}) {
    const params = new URLSearchParams();
    const otherParams = Object.entries(_otherParams);
    const redirectParams = [...this.#toSearchParams(this.#flattenPreservedProps()).entries()];
    // merge with existing search params, if any
    // redirect params should always win
    [otherParams, redirectParams].flat().forEach(([key, value]) => {
      typeof value === 'string' && params.set(key, value);
    });

    // TODO: A potential future improvement here is to remove the origin from the params we append
    // if `url` and the param share the same origin
    return buildURL({ base: url, hashSearch: params.toString() }, { stringify: true });
  }

  #toSearchParams(obj: Record<string, string | undefined | null>): URLSearchParams {
    const camelCased = Object.fromEntries(Object.entries(obj).map(([key, value]) => [camelToSnake(key), value]));
    return new URLSearchParams(removeUndefined(camelCased) as Record<string, string>);
  }

  #flattenPreservedProps() {
    return Object.fromEntries(
      Object.entries({ ...this.fromSearchParams }).filter(([key]) => RedirectUrls.preserved.includes(key)),
    );
  }

  #getRedirectUrl(prefix: 'signIn' | 'signUp') {
    const forceKey = `${prefix}ForceRedirectUrl` as const;
    const fallbackKey = `${prefix}FallbackRedirectUrl` as const;

    const legacyPropKey = `after${prefix[0].toUpperCase()}${prefix.slice(1)}Url` as 'afterSignInUrl' | 'afterSignUpUrl';

    let result;
    // Prioritize forceRedirectUrl
    result = this.fromSearchParams[forceKey] || this.fromProps[forceKey] || this.fromOptions[forceKey];
    // Try to get redirect_url, only allowed as a search param
    result ||= this.fromSearchParams.redirectUrl;
    // Otherwise, fallback to fallbackRedirectUrl
    result ||= this.fromSearchParams[fallbackKey] || this.fromProps[fallbackKey] || this.fromOptions[fallbackKey];

    // TODO: v6
    // Remove the compatibility layer for afterSignInUrl and afterSignUpUrl
    result ||=
      this.fromSearchParams[legacyPropKey] ||
      this.fromSearchParams.redirectUrl ||
      this.fromProps[legacyPropKey] ||
      this.fromProps.redirectUrl ||
      this.fromOptions[legacyPropKey];

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
