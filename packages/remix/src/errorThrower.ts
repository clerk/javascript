import type { ErrorThrowerOptions } from '@clerk/shared';
import { buildErrorThrower } from '@clerk/shared';

const errorThrower = buildErrorThrower({ packageName: '@clerk/remix' });

function __internal__setErrorThrowerOptions(options: ErrorThrowerOptions) {
  errorThrower.setMessages(options).setPackageName(options);
}

export { errorThrower, __internal__setErrorThrowerOptions };
