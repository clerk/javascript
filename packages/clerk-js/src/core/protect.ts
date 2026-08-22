import { inBrowser } from '@clerk/shared/browser';
import { logger } from '@clerk/shared/logger';
import type { ProtectLoader } from '@clerk/shared/types';

import type { ApplyLoader, ProtectPlaceholders, ProtectRequestParams } from './protectSession';
import { interpolatePlaceholders, ProtectSession } from './protectSession';
import type { Environment } from './resources';
export class Protect {
  #initialized: boolean = false;
  #session?: ProtectSession;
  #challengeLoadTimeoutMs?: number;

  /**
   * The verification-module LOAD timeout asked for by the loader this browser was assigned, or
   * undefined when none asked for one — in which case the caller falls back to the instance-wide
   * value and then to the SDK default.
   *
   * Resolved from the APPLIED loaders rather than from the config, because rollout is decided by
   * a random draw per page load: a loader being ramped can carry its own value without changing
   * anything for browsers still on the loader it replaces, and which one a browser got cannot be
   * recomputed afterwards.
   */
  get challengeLoadTimeoutMs(): number | undefined {
    return this.#challengeLoadTimeoutMs;
  }

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

    // The config is server-controlled and cached, so nothing it can contain may take `Clerk.load()`
    // down with it.
    try {
      this.#apply(config.loaders, config.tokens_invalid_before);
    } catch (error) {
      logger.warnOnce(`[protect] failed to load: ${error}`);
    }
  }

  #apply(configured: ProtectLoader[], tokensInvalidBefore?: number): void {
    // Rollout is decided before anything else, because the session is only meaningful for the
    // loaders we are actually going to apply.
    const loaders = configured.filter(loader => isLoader(loader) && inRollout(loader));

    // Read off the applied set, before any of them run: this only describes config, so a loader
    // that later fails to be placed has still spoken for the browser it was assigned to. First
    // one that asks for it wins.
    this.#challengeLoadTimeoutMs = loaders.find(
      loader => typeof loader.challenge_load_timeout_ms === 'number' && loader.challenge_load_timeout_ms > 0,
    )?.challenge_load_timeout_ms;

    // Only an instance whose loaders reference the correlation id gets a session, so an instance
    // not using it is unaffected and stores nothing in the browser.
    const applyLoader: ApplyLoader = (loader, placeholders) => this.applyLoader(loader, placeholders);
    this.#session = ProtectSession.create(loaders, applyLoader, tokensInvalidBefore);

    for (const loader of loaders) {
      // The session injects this one itself, under the acquisition lock, so exactly one tab per
      // browser session runs it. Every other loader runs on every page load regardless.
      if (this.#session?.isTokenLoader(loader)) {
        continue;
      }
      try {
        this.applyLoader(loader, this.#session?.placeholders());
      } catch (error) {
        logger.warnOnce(`[protect] failed to apply loader: ${error}`);
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
    try {
      return (this.#session?.getRequestParams() ?? Promise.resolve(undefined)).catch(() => undefined);
    } catch {
      return Promise.resolve(undefined);
    }
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

    if (loader.text_content && typeof loader.text_content === 'string') {
      element.textContent = placeholders
        ? interpolatePlaceholders(loader.text_content, placeholders)
        : loader.text_content;
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

// A malformed entry is dropped on its own, the way a failed injection always has been — it must
// not cost the instance its other loaders.
function isLoader(loader: unknown): loader is ProtectLoader {
  if (!loader || typeof loader !== 'object') {
    logger.warnOnce(`[protect] loader entry is not an object: ${loader}`);
    return false;
  }
  return true;
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
