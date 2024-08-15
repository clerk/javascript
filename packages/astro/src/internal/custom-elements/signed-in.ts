import { $authStore } from '../../stores/external';
import { $csrState } from '../../stores/internal';

export class SignedIn extends HTMLElement {
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
        this.removeAttribute('hidden');
      } else {
        this.setAttribute('hidden', '');
      }
    });
  }
}
