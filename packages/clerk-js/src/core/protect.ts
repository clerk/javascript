import { inBrowser } from '@clerk/shared/browser';
import { logger } from '@clerk/shared/logger';
import type { ProtectLoader, ProtectState } from '@clerk/shared/types';

import type { Environment } from './resources';
export class Protect {
  #initialized: boolean = false;
  #protectState?: ProtectState;

  async load(env: Environment): Promise<void> {
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

    // validate only one bootstrap loader
    const bootstrapLoaders = config.loaders.filter(loader => loader.bootstrap === true);
    if (bootstrapLoaders.length > 1) {
      logger.warnOnce('[protect] multiple bootstrap loaders detected, only one is allowed');
      return;
    }

    // here rather than at end to mark as initialized even if load fails.
    this.#initialized = true;

    for (const loader of config.loaders) {
      try {
        await this.applyLoader(loader);
      } catch (error) {
        logger.warnOnce(`[protect] failed to apply loader: ${error}`);
      }
    }

    // wait for protectState to be set if timeout is configured
    const timeout = config.protectStateTimeout ?? 0;
    if (timeout > 0) {
      await this.waitForProtectState(timeout);
    }
  }

  getId(): string | undefined {
    return this.#protectState?.id;
  }

  // wait for bootstrap loader to resolve protect state promise, with timeout
  private async waitForProtectState(timeout: number): Promise<void> {
    if (!window.__internal_protectState) {
      throw new Error('[protect] protectState promise not created by loaded script');
    }

    try {
      const state = await Promise.race([
        window.__internal_protectState,
        new Promise<never>((_, reject) =>
          setTimeout(
            () => reject(new Error(`[protect] protectState promise not resolved within ${timeout}ms timeout`)),
            timeout,
          ),
        ),
      ]);
      this.#protectState = state;
    } catch (error) {
      throw error instanceof Error ? error : new Error(`[protect] protectState promise failed: ${error}`);
    }
  }

  // apply individual loader
  async applyLoader(loader: ProtectLoader): Promise<void> {
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

    // for external script marked as bootstrap, create promise that waits for it to load
    let loadPromise: Promise<void> | null = null;
    if (loader.bootstrap === true && loader.attributes?.src && !loader.textContent) {
      loadPromise = new Promise<void>((resolve, reject) => {
        element.onload = () => resolve();
        element.onerror = () =>
          reject(new Error(`[protect] failed to load bootstrap script: ${loader.attributes?.src}`));
      });
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
        } else {
          logger.warnOnce(`[protect] loader target is invalid: ${target}`);
        }
        break;
    }

    if (loadPromise) {
      await loadPromise;
    }
  }
}
