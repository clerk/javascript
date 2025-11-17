import { inBrowser } from '@clerk/shared/browser';
import { logger } from '@clerk/shared/logger';
import type { ProtectLoader } from '@clerk/shared/types';

import type { Environment } from './resources';
export class Protect {
  #initialized: boolean = false;

  load(env: Environment): void {
    const config = env?.protectConfig;

    if (!config?.loaders || !Array.isArray(config.loaders) || config.loaders.length === 0) {
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

    for (const loader of config.loaders) {
      try {
        this.applyLoader(loader);
      } catch (error) {
        logger.warnOnce(`[protect] failed to apply loader: ${error}`);
      }
    }
  }

  // apply individual loader
  applyLoader(loader: ProtectLoader) {
    // we use rollout for percentage based rollouts (as the environment file is cached)
    if (loader.rollout !== undefined) {
      const rollout = loader.rollout;
      if (typeof rollout !== 'number' || rollout < 0) {
        // invalid rollout percentage - do nothing
        logger.warnOnce(`[protect] loader rollout value is invalid: ${rollout}`);
        return;
      }
      if (rollout === 0 || Math.random() > rollout) {
        // not in rollout percentage - do nothing
        return;
      }
    }

    const type = loader.type || 'script';
    const target = loader.target || 'body';

    const element = document.createElement(type);

    if (loader.attributes) {
      for (const [key, value] of Object.entries(loader.attributes)) {
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
      }
    }

    if (loader.textContent && typeof loader.textContent === 'string') {
      element.textContent = loader.textContent;
    }

    switch (target) {
      case 'head':
        document.head.appendChild(element);
        break;
      case 'body':
        document.body.appendChild(element);
        break;
      default:
        if (target?.startsWith('#')) {
          const targetElement = document.getElementById(target.substring(1));
          if (!targetElement) {
            logger.warnOnce(`[protect] loader target element not found: ${target}`);
            return;
          }
          targetElement.appendChild(element);
          return;
        }
        logger.warnOnce(`[protect] loader target is invalid: ${target}`);
        break;
    }
  }
}
