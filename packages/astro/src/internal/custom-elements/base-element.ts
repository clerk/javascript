import { $csrState } from '../../stores/internal';

export class BaseElement extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    $csrState.subscribe(state => {
      if (state.isLoaded) {
        this.onClerkLoaded();
      }
    });
  }

  onClerkLoaded() {
    // This will be overridden by child classes
  }
}
