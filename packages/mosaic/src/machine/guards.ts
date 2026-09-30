import type { GuardMeta } from './types';

export function stateIn(path: string) {
  return (_context: unknown, _event: unknown, meta: GuardMeta): boolean => meta.matches(path);
}
