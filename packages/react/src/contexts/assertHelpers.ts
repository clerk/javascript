import {
  noClerkProviderError,
  noGuaranteedLoadedError,
  noGuaranteedUserError,
} from '../errors';

export function assertWrappedByClerkProvider(
  contextVal: unknown,
): asserts contextVal {
  if (!contextVal) {
    throw new Error(noClerkProviderError);
  }
}

export function assertClerkLoadedGuarantee(
  guarantee: unknown,
  hookName: string,
): asserts guarantee {
  if (!guarantee) {
    throw new Error(noGuaranteedLoadedError(hookName));
  }
}

export function assertUserGuarantee(
  guarantee: unknown,
  hookName: string,
): asserts guarantee {
  if (!guarantee) {
    throw new Error(noGuaranteedUserError(hookName));
  }
}
