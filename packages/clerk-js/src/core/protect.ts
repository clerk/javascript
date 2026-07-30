import { inBrowser } from '@clerk/shared/browser';
import { logger } from '@clerk/shared/logger';
import type { ProtectLoader } from '@clerk/shared/types';

import type { ProtectPlaceholders, ProtectRequestParams } from './protectSession';
import { interpolatePlaceholders, ProtectSession } from './protectSession';
import type { Environment } from './resources';
export class Protect {
  #initialized: boolean = false;
  #session?: ProtectSession;

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

    // Rollout is decided before anything else, because the session is only meaningful for the
    // loaders we are actually going to apply.
    const loaders = config.loaders.filter(loader => inRollout(loader));

    // Only an instance whose loaders reference the correlation id gets a session, so an instance
    // not using it keeps today's behaviour and stores nothing in the browser.
    this.#session = ProtectSession.create(loaders, config.id || undefined);

    // A token was already acquired in this browser session — possibly in another tab — so there
    // is nothing left for the loaders to do. Reusing the shared token is the whole point:
    // acquisition happens once per browser session, not once per tab per page load.
    const alreadyAcquired = this.#session?.hasFreshToken() ?? false;

    if (!alreadyAcquired) {
      for (const loader of loaders) {
        try {
          const element = this.applyLoader(loader, this.#session?.placeholders());
          if (element && this.#session?.isTokenLoader(loader)) {
            this.#session.observeLoaderElement(element);
          }
        } catch (error) {
          logger.warnOnce(`[protect] failed to apply loader: ${error}`);
        }
      }
    }

    // Acquisition is prefetched here rather than at sign-in, so a sign-in normally finds the token
    // long since cached and acquisition stays off the latency-critical path.
    this.#session?.start();
  }

  /**
   * The Protect params to attach to a sign-in or sign-up request, or `undefined` when this instance
   * does not participate. Never rejects, and never blocks past the acquisition deadline.
   */
  getRequestParams(): Promise<ProtectRequestParams | undefined> {
    return this.#session?.getRequestParams() ?? Promise.resolve(undefined);
  }

  // apply individual loader
  applyLoader(loader: ProtectLoader, placeholders?: ProtectPlaceholders): HTMLElement | undefined {
    const type = loader.type || 'script';
    const target = loader.target || 'body';

    const element = document.createElement(type);

    if (loader.attributes) {
      for (const [key, value] of Object.entries(loader.attributes)) {
        switch (typeof value) {
          case 'string':
            element.setAttribute(key, placeholders ? interpolatePlaceholders(value, placeholders) : value);
            break;
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
        return element;
      case 'body':
        document.body.appendChild(element);
        return element;
      default:
        if (target?.startsWith('#')) {
          const targetElement = document.getElementById(target.substring(1));
          if (!targetElement) {
            logger.warnOnce(`[protect] loader target element not found: ${target}`);
            return undefined;
          }
          targetElement.appendChild(element);
          return element;
        }
        logger.warnOnce(`[protect] loader target is invalid: ${target}`);
        return undefined;
    }
  }
}

// we use rollout for percentage based rollouts (as the environment file is cached)
function inRollout(loader: ProtectLoader): boolean {
  if (loader.rollout === undefined) {
    return true;
  }

  const rollout = loader.rollout;
  if (typeof rollout !== 'number' || rollout < 0) {
    // invalid rollout percentage - do nothing
    logger.warnOnce(`[protect] loader rollout value is invalid: ${rollout}`);
    return false;
  }

  return rollout !== 0 && Math.random() <= rollout;
}
