import { useMessages } from './context';
import type { MessageValues } from './messages';
import { fill } from './messages';

export interface LocalizableError {
  code?: string;
  paramName?: string;
  message?: string;
  /** Values for the `{placeholder}`s in whichever message the code resolves to. */
  params?: MessageValues;
}

export function useErrorText(): (error: LocalizableError) => string {
  const messages = useMessages('errors');
  const lookup = (key: string | undefined) => (key && Object.hasOwn(messages, key) ? messages[key] : undefined);
  return ({ code, paramName, message, params }) => {
    const template =
      lookup(code && paramName ? `${code}__${paramName}` : undefined) ?? lookup(code) ?? message ?? messages.generic;
    return params ? fill(template, params) : template;
  };
}
