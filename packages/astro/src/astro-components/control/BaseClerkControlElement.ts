import { $authStore, $isLoadedStore } from '@clerk/astro/client';

export type AuthState = ReturnType<typeof $authStore.get>;

export class BaseClerkControlElement extends HTMLElement {
  protected authStoreListener: (() => void) | null = null;
  protected isLoadedStoreListener: (() => void) | null = null;

  constructor() {
    super();
  }

  connectedCallback() {
    this.isLoadedStoreListener = $isLoadedStore.subscribe(loaded => {
      if (loaded) {
        this.toggleContentVisibility();
      }
    });
  }

  disconnectedCallback() {
    this.authStoreListener?.();
    this.isLoadedStoreListener?.();
  }

  toggleContentVisibility() {
    this.authStoreListener = $authStore.subscribe(state => {
      this.onAuthStateChange(state);
    });
  }

  // This method will be overridden by subclasses
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected onAuthStateChange(state: AuthState): void {}
}
