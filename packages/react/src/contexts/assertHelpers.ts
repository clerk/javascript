import { errorThrower } from '../errors/errorThrower';
import { noClerkProviderError } from '../errors/messages';

export function assertWrappedByClerkProvider(contextVal: unknown): asserts contextVal {
  if (!contextVal) {
    errorThrower.throw(noClerkProviderError);
  }
}
