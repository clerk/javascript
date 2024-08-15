import { $authStore } from '../../stores/external';
import { BaseElement } from './base-element';

export class SignedOut extends BaseElement {
  constructor() {
    super();
  }

  onClerkLoaded() {
    $authStore.subscribe(state => {
      if (state.userId) {
        this.setAttribute('hidden', '');
      } else {
        this.removeAttribute('hidden');
      }
    });
  }
}
