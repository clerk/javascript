import type { ErrorThrowerOptions } from '@clerk/shared/error';
import { buildErrorThrower } from '@clerk/shared/error';

const errorThrower = buildErrorThrower({ packageName: '@clerk/react' });

export { errorThrower };

/**
 * Overrides options of the internal errorThrower (eg setting packageName prefix).
 *
 * @internal
 */
export function setErrorThrowerOptions(options: ErrorThrowerOptions) {
  errorThrower.setMessages(options).setPackageName(options);
}
