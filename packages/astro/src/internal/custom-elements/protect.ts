import type { CheckAuthorizationWithCustomPermissions } from '@clerk/types';

import { $authStore } from '../../stores/external';
import { $csrState } from '../../stores/internal';

export class Protect extends HTMLElement {
  private defaultSlot: HTMLDivElement | null = null;
  private fallbackSlot: HTMLDivElement | null = null;

  constructor() {
    super();
  }

  connectedCallback() {
    this.defaultSlot = this.querySelector('[data-default-slot]');
    this.fallbackSlot = this.querySelector('[data-fallback-slot]');

    $csrState.subscribe(state => {
      if (state.isLoaded) {
        this.toggleContentVisibility();
      }
    });
  }

  toggleContentVisibility() {
    $authStore.subscribe(state => {
      const has = (params: Parameters<CheckAuthorizationWithCustomPermissions>[0]) => {
        if (!params?.permission && !params?.role) {
          throw new Error(
            'Missing parameters. The prop permission or role is required to be passed. Example usage: `has({permission: "org:posts:edit"})`',
          );
        }

        if (!state.orgId || !state.userId || !state.orgRole || !state?.orgPermissions) {
          return false;
        }

        if (params.permission) {
          return state.orgPermissions.includes(params.permission);
        }

        if (params.role) {
          return state.orgRole === params.role;
        }

        return false;
      };

      const role = this.dataset.role;
      const permission = this.dataset.permission;
      const isUnauthorized =
        !state.userId ||
        ((role || permission) && !has({ role, permission } as Parameters<CheckAuthorizationWithCustomPermissions>[0]));

      if (this.defaultSlot) {
        isUnauthorized ? this.defaultSlot.setAttribute('hidden', '') : this.defaultSlot.removeAttribute('hidden');
      }

      if (this.fallbackSlot) {
        isUnauthorized ? this.fallbackSlot.removeAttribute('hidden') : this.fallbackSlot.setAttribute('hidden', '');
      }
    });
  }
}
