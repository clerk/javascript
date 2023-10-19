import type { ErrorThrowerOptions } from '@clerk/shared/error';
import { buildErrorThrower } from '@clerk/shared/error';

const errorThrower = buildErrorThrower({ packageName: '@clerk/remix' });

function __internal__setErrorThrowerOptions(options: ErrorThrowerOptions) {
  errorThrower.setMessages(options).setPackageName(options);
}

export { errorThrower, __internal__setErrorThrowerOptions };
