import type { ErrorThrowerOptions } from '@clerk/shared/error';

import { errorThrower } from './errors/errorThrower';

/**
 * Overrides options of the internal errorThrower (eg setting packageName prefix).
 *
 * @internal
 */
export function setErrorThrowerOptions(options: ErrorThrowerOptions) {
  errorThrower.setMessages(options).setPackageName(options);
}
