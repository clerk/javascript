import { $authStore } from '../../stores/external';
import { BaseElement } from './base-element';

export class SignedIn extends BaseElement {
  constructor() {
    super();
  }

  onClerkLoaded() {
    $authStore.subscribe(state => {
      if (state.userId) {
        this.removeAttribute('hidden');
      } else {
        this.setAttribute('hidden', '');
      }
    });
  }
}
