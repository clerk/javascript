import type { ErrorThrowerOptions } from '@clerk/utils';
import { buildErrorThrower } from '@clerk/utils';

const errorThrower = buildErrorThrower({ packageName: '@clerk/remix' });

function __internal__setErrorThrowerOptions(options: ErrorThrowerOptions) {
  errorThrower.setMessages(options).setPackageName(options);
}

export { errorThrower, __internal__setErrorThrowerOptions };
