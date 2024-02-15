import { NEXT_ROUTING_CHANGE_VERSION } from '~/internals/constants';

export function shouldUseVirutalRouting() {
  return typeof window !== 'undefined' && window.next && window.next.version < NEXT_ROUTING_CHANGE_VERSION;
}
