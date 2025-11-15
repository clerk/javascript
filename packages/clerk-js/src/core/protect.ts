import { inBrowser } from '@clerk/shared/browser';
import { logger } from '@clerk/shared/logger';

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

    // we use rollout for percentage based rollouts (as the environment file is cached)
    if (config.rollout) {
      if (typeof config.rollout !== 'number' || config.rollout < 0 || config.rollout > 1) {
        // invalid rollout percentage - do nothing
        logger.warnOnce(`[protect] loader rollout value is invalid: ${config.rollout}`);
        return;
      }
      if (Math.random() > config.rollout) {
        // not in rollout percentage - do nothing
        return;
      }
    }

    if (!config.loader.type) {
      logger.warnOnce(`[protect] loader type is missing`);
      return;
    }

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
            logger.warnOnce(`[protect] loader attribute is invalid type: ${key}=${value}`);
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
        logger.warnOnce(`[protect] loader target is invalid: ${config.loader.target}`);
        break;
    }
  }
}
