import { $csrState } from '../../stores/internal';

export class BaseElement extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    $csrState.subscribe(state => {
      if (state.isLoaded) {
        this.onLoaded();
      }
    });
  }

  onLoaded() {
    console.log('BaseElement.onLoaded()');
  }
}
