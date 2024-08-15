import { $authStore } from '../../stores/external';

export class SignedOut extends HTMLElement {
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
    this.authStoreListener = $authStore.subscribe(state => {
      if (state.userId) {
        this.setAttribute('hidden', '');
      } else {
        this.removeAttribute('hidden');
      }
    });
  }
}
