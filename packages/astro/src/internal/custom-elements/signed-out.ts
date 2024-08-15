import { $authStore } from '../../stores/external';
import { $csrState } from '../../stores/internal';

export class SignedOut extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    $csrState.subscribe(state => {
      if (state.isLoaded) {
        this.toggleContentVisibility();
      }
    });
  }

  toggleContentVisibility() {
    $authStore.subscribe(state => {
      if (state.userId) {
        this.setAttribute('hidden', '');
      } else {
        this.removeAttribute('hidden');
      }
    });
  }
}
