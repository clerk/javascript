import { errorThrower } from '../errors/errorThrower';
import { noClerkProviderError, noGuaranteedLoadedError } from '../errors/messages';

export function assertWrappedByClerkProvider(contextVal: unknown): asserts contextVal {
  if (!contextVal) {
    errorThrower.throw(noClerkProviderError);
  }
}

export function assertClerkLoadedGuarantee(guarantee: unknown, hookName: string): asserts guarantee {
  if (!guarantee) {
    errorThrower.throw(noGuaranteedLoadedError(hookName));
  }
}
