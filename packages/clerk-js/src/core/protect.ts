import { inBrowser } from '@clerk/shared/browser';

import type { Environment } from './resources';
export class Protect {
  #initialized: boolean = false;

  load(env: Environment): void {
    const config = env?.protectConfig;

    if (!config?.loader) {
      // not enabled or no protect config available
      return;
    } else if (this.#initialized) {
      // already initialized - do nothing
      return;
    } else if (!inBrowser()) {
      // no document: not running browser?
      return;
    }

    // here rather than at end to mark as initialized even if load fails.
    this.#initialized = true;

    if (config.loader.type) {
      const element = document.createElement(config.loader.type);
      if (config.loader.attributes) {
        Object.entries(config.loader.attributes).forEach(([key, value]) => {
          switch (typeof value) {
            case 'string':
            case 'number':
            case 'boolean':
              element.setAttribute(key, String(value));
              break;
            default:
              // illegal to set.
              break;
          }
        });
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
