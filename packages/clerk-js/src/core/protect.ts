import type { Environment } from './resources';

export class Protect {
  #initialized: boolean = false;

  load(env: Environment): void {
    const config = env?.protectConfig;

    if (!config?.loader) {
      // no protect config available
      return;
    } else if (this.#initialized) {
      // already initialized - do nothing
      return;
    } else if (typeof document === 'undefined') {
      // no document: not running browser?
      return;
    }

    // here rather than at end to mark as initialized even if load fails.
    this.#initialized = true;

    if (config.loader.type) {
      const element = document.createElement(config.loader.type);
      if (config.loader.attributes) {
        Object.entries(config.loader.attributes).forEach(([key, value]) => element.setAttribute(key, String(value)));
      }
      switch (config.loader.target) {
        case 'head':
          document.head.appendChild(element);
          break;
        case 'body':
          document.body.appendChild(element);
          break;
        default:
          break;
      }
    }
  }
}
