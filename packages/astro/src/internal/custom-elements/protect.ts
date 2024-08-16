import type { CheckAuthorization } from '@clerk/types';

import { $authStore, $sessionStore } from '../../stores/external';

export class Protect extends HTMLElement {
  private defaultSlot: HTMLDivElement | null = null;
  private fallbackSlot: HTMLDivElement | null = null;
  private authStoreListener: (() => void) | null = null;

  constructor() {
    super();
  }

  connectedCallback() {
    this.toggleContentVisibility();
  }

  disconnectedCallback() {
    this.authStoreListener?.();
  }

  toggleContentVisibility() {
    this.defaultSlot = this.querySelector('[data-clerk-control-slot-default]');
    this.fallbackSlot = this.querySelector('[data-clerk-control-slot-fallback]');

    this.authStoreListener = $authStore.subscribe(state => {
      const has = $sessionStore.get()?.checkAuthorization;

      const role = this.dataset.role;
      const permission = this.dataset.permission;
      const isUnauthorized =
        !state.userId || ((role || permission) && !has?.({ role, permission } as Parameters<CheckAuthorization>[0]));

      if (this.defaultSlot) {
        isUnauthorized ? this.defaultSlot.setAttribute('hidden', '') : this.defaultSlot.removeAttribute('hidden');
      }

      if (this.fallbackSlot) {
        isUnauthorized ? this.fallbackSlot.removeAttribute('hidden') : this.fallbackSlot.setAttribute('hidden', '');
      }
    });
  }
}
