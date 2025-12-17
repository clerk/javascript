import {
  clerkCoreErrorContextProviderNotFound,
  clerkCoreErrorNoClerkSingleton,
} from '@clerk/shared/internal/clerk-js/errors';
import type { Clerk } from '@clerk/shared/types';
import { snakeToCamel } from '@clerk/shared/underscore';

import { createDynamicParamParser } from '../utils/dynamicParamParser';

export function assertClerkSingletonExists(clerk: Clerk | undefined): asserts clerk is Clerk {
  if (!clerk) {
    clerkCoreErrorNoClerkSingleton();
  }
}

export function assertContextExists(contextVal: unknown, providerName: string): asserts contextVal {
  if (!contextVal) {
    clerkCoreErrorContextProviderNotFound(providerName);
  }
}

export function getInitialValuesFromQueryParams(queryString: string, params: string[]) {
  const props: Record<string, string> = {};
  const searchParams = new URLSearchParams(queryString);
  searchParams.forEach((value, key) => {
    if (params.includes(key) && typeof value === 'string') {
      props[snakeToCamel(key)] = value;
    }
  });

  return props;
}

export const populateParamFromObject = createDynamicParamParser({ regex: /:(\w+)/ });
