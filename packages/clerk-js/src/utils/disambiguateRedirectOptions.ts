type Flow = 'signin' | 'signup';

interface RedirectOptions {
  forceRedirectUrl?: string | null;
  fallbackRedirectUrl?: string | null;
}

type PrefixedRedirectOptions<F extends Flow> = {
  [K in keyof RedirectOptions as `${F extends 'signin' ? 'signIn' : 'signUp'}${Capitalize<K>}`]: RedirectOptions[K];
};

type DisambiguatedRedirectOptions<T extends RedirectOptions, F extends Flow> = {
  [K in keyof T as K extends 'forceRedirectUrl' | 'fallbackRedirectUrl' ? never : K]: T[K];
} & PrefixedRedirectOptions<F>;

/**
 * Ensures redirect props have the appropriate prefix depending on the flow they were originally provided to. Used when passing props from sign up -> sign in, or vice versa, when rendering modals.
 */
export function disambiguateRedirectOptions<T extends RedirectOptions, F extends Flow>(
  props: T | null,
  flow: F,
): DisambiguatedRedirectOptions<T, F> {
  if (!props) {
    return {} as DisambiguatedRedirectOptions<T, F>;
  }

  const prefix = flow === 'signin' ? 'signIn' : 'signUp';

  const prefixedOptions = {
    [`${prefix}ForceRedirectUrl`]: props.forceRedirectUrl,
    [`${prefix}FallbackRedirectUrl`]: props.fallbackRedirectUrl,
  } as PrefixedRedirectOptions<F>;

  const result = {
    ...props,
    ...prefixedOptions,
  };

  delete result.forceRedirectUrl;
  delete result.fallbackRedirectUrl;

  return result;
}
