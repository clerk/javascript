import { NEXT_ROUTING_CHANGE_VERSION } from '~/internals/constants';

export function shouldUseVirtualRouting() {
  if (typeof window === 'undefined') {
    return false;
  }

  if (!window.next) {
    return false;
  }

  return window.next.version < NEXT_ROUTING_CHANGE_VERSION;
}
