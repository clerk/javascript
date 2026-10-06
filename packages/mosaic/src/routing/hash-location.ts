import type { MosaicLocation } from './location';
import { subscribeToUrlChanges } from './url-changes';

export function createHashLocation(): MosaicLocation {
  return {
    read: () => {
      if (typeof window === 'undefined') {
        return '';
      }
      const { hash } = window.location;
      return hash.startsWith('#/') ? hash.slice(2) : '';
    },
    write: (to, { replace }) => {
      if (replace) {
        window.location.replace(`#/${to}`);
      } else {
        window.location.hash = `/${to}`;
      }
      return Promise.resolve();
    },
    subscribe: subscribeToUrlChanges,
  };
}
