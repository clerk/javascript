import type { DisplayConfigResource } from '@clerk/types';
import qs from 'qs';

import { hasBannedProtocol, isValidUrl } from './url';

type PickUrlOptions = {
  validator?: (url: string) => boolean;
  formatter?: (url: string) => string;
};

type PickUrlSource = { from: object | object[]; options?: PickUrlOptions };

/**
 * This function will pick the first value that is found inside a source using a key provided.
 * There is a validator option which is used to validate that the value is acceptable. If it isn't, it will
 * look for the next available value and repeat. The formatter is used to format the keys if provided.
 * Example usage that looks through the sources for the value of any of the keys provided (with order priority)
 * `pickUrl(['afterSignInUrl', 'redirectUrl'], [optionsA, optionsB])`
 */
export const pickUrl = (key: string | string[], source: PickUrlSource | PickUrlSource[]): string => {
  const sources = Array.isArray(source) ? source : [source];

  let pickedUrl = '';
  sources.some(s => {
    const from = Array.isArray(s.from) ? s.from : [s.from];
    const { validator = () => true, formatter } = s.options || {};
    const keys = (Array.isArray(key) ? key : [key]).map(k => formatter?.(k) || k);
    keys.some(k => {
      from.some(f => {
        const url = f[k];
        if (
          typeof url === 'string' &&
          validator(url) &&
          isValidUrl(url, { includeRelativeUrls: true }) &&
          !hasBannedProtocol(url)
        ) {
          pickedUrl = url;
        }
        return pickedUrl;
      });
    });
    return pickedUrl;
  });

  return pickedUrl;
};

interface BuildAuthQueryStringArgs {
  afterSignInUrl?: string;
  afterSignUpUrl?: string;
  displayConfig: DisplayConfigResource;
}

export const buildAuthQueryString = (data: BuildAuthQueryStringArgs): string | null => {
  const parseValue = (field: keyof Omit<BuildAuthQueryStringArgs, 'displayConfig'>) => {
    const passed = data[field];
    if (!passed) {
      return undefined;
    }

    // We don't need to modify the query string at all
    // if the URL matches displayConfig
    if (passed === data.displayConfig[field]) {
      return undefined;
    }

    // Convert relative urls to absolute ones
    // Needed because auth modals the hosted pages sso-callback,
    // so an absolute redirectUrl is necessary
    if (passed.startsWith('/')) {
      return window.location.origin + passed;
    }

    return passed;
  };

  const parsedAfterSignInUrl = parseValue('afterSignInUrl');
  const parsedAfterSignUpUrl = parseValue('afterSignUpUrl');

  // Build the query string
  const query: Record<string, string> = {};
  if (parsedAfterSignInUrl && parsedAfterSignInUrl === parsedAfterSignUpUrl) {
    query.redirect_url = parsedAfterSignInUrl;
  } else {
    if (parsedAfterSignUpUrl) {
      query.after_sign_up_url = parsedAfterSignUpUrl;
    }
    if (parsedAfterSignInUrl) {
      query.after_sign_in_url = parsedAfterSignInUrl;
    }
  }
  return Object.keys(query).length === 0 ? null : qs.stringify(query);
};
