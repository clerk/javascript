import type { GuardMeta } from './types';

export function stateIn(path: string) {
  return (_context: unknown, _event: unknown, meta: GuardMeta): boolean => meta.matches(path);
}

export function childHasTag(id: string, tag: string) {
  return (_context: unknown, _event: unknown, meta: GuardMeta): boolean =>
    meta.child(id)?.getSnapshot().hasTag(tag) ?? false;
}
