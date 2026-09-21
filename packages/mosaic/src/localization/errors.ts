import { useMessages } from './context';

export interface LocalizableError {
  code?: string;
  paramName?: string;
  message?: string;
}

export function useErrorText(): (error: LocalizableError) => string {
  const messages = useMessages('errors');
  const lookup = (key: string | undefined) => (key && Object.hasOwn(messages, key) ? messages[key] : undefined);
  return ({ code, paramName, message }) =>
    lookup(code && paramName ? `${code}__${paramName}` : undefined) ?? lookup(code) ?? message ?? messages.generic;
}
