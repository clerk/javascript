import type { LongRunningApplication } from '../models/longRunningApplication';
import { longRunningApplication } from '../models/longRunningApplication';
import { astro } from './astro';
import { envs, isStagingReady } from './envs';
import { expo } from './expo';
import { express } from './express';
import { fastify } from './fastify';
import { hono } from './hono';
import { next } from './next';
import { nuxt } from './nuxt';
import { react } from './react';
import { reactRouter } from './react-router';
import { tanstack } from './tanstack';
import { vue } from './vue';

/**
 * A list of long-running applications that can be used in tests.
 * These are applications that are started once and then used for all tests,
 * making the tests run faster as the app doesn't need to be started for each test.
 */
export const createLongRunningApps = () => {
  // prettier-ignore
  const allConfigs = [
    /**
     * NextJS apps - basic flows
     */
    { id: 'next.appRouter.withEmailCodes', config: next.appRouter, env: envs.withEmailCodes },
    { id: 'next.appRouter.sessionsProd1', config: next.appRouter, env: envs.sessionsProd1 },
    { id: 'next.appRouter.withEmailCodes_persist_client',config: next.appRouter,env: envs.withEmailCodes_destroy_client },
    { id: 'next.appRouter.withCustomRoles', config: next.appRouter, env: envs.withCustomRoles },
    { id: 'next.appRouter.withReverification', config: next.appRouter, env: envs.withReverification },
    { id: 'next.appRouter.withSignInOrUpFlow', config: next.appRouter, env: envs.withSignInOrUpFlow },
    { id: 'next.appRouter.withSignInOrUpEmailLinksFlow', config: next.appRouter, env: envs.withSignInOrUpEmailLinksFlow },
    { id: 'next.appRouter.withSessionTasks', config: next.appRouter, env: envs.withSessionTasks },
    { id: 'next.appRouter.withSessionTasksResetPassword', config: next.appRouter, env: envs.withSessionTasksResetPassword },
    { id: 'next.appRouter.withSessionTasksSetupMfa', config: next.appRouter, env: envs.withSessionTasksSetupMfa },
    { id: 'next.appRouter.withLegalConsent', config: next.appRouter, env: envs.withLegalConsent },
    { id: 'next.appRouter.withNeedsClientTrust', config: next.appRouter, env: envs.withNeedsClientTrust },
    { id: 'next.appRouter.withSharedUIVariant', config: next.appRouter, env: envs.withSharedUIVariant },

    /**
     * NextJS apps - bundled UI
     */
    { id: 'next.appRouterBundledUI.withEmailCodes', config: next.appRouterBundledUI, env: envs.withEmailCodes },

    /**
     * NextJS apps - cache components
     */
    { id: 'next.cacheComponents', config: next.cacheComponents, env: envs.withEmailCodes },

    /**
     * Quickstart apps
     */
    { id: 'quickstart.next.appRouter', config: next.appRouterQuickstart, env: envs.withEmailCodesQuickstart },

    /**
     * Billing apps
     */
    { id: 'withBillingJwtV2.next.appRouter', config: next.appRouter, env: envs.withBillingJwtV2 },
    { id: 'withBillingJwtV2.vue.vite', config: vue.vite, env: envs.withBillingJwtV2 },

    /**
     * Vite apps - basic flows
     */
    { id: 'react.vite.withEmailCodes', config: react.vite, env: envs.withEmailCodes },
    { id: 'react.vite.withEmailCodes_persist_client', config: react.vite, env: envs.withEmailCodes_destroy_client },
    { id: 'react.vite.withEmailLinks', config: react.vite, env: envs.withEmailLinks },
    { id: 'react.vite.withLegalConsent', config: react.vite, env: envs.withLegalConsent },
    { id: 'vue.vite', config: vue.vite, env: envs.withCustomRoles },

    /**
     * Tanstack apps - basic flows
     */
    { id: 'tanstack.react-start', config: tanstack.reactStart, env: envs.withEmailCodes },

    /**
     * Various apps - basic flows
     */
    { id: 'astro.node.withCustomRoles', config: astro.node, env: envs.withCustomRoles },
    { id: 'astro.static.withCustomRoles', config: astro.static, env: envs.withCustomRoles },
    { id: 'expo.expo-web', config: expo.expoWeb, env: envs.withEmailCodes },
    { id: 'nuxt.node', config: nuxt.node, env: envs.withCustomRoles },
    { id: 'react-router.node', config: reactRouter.reactRouterNode, env: envs.withEmailCodes },
    { id: 'express.vite.withEmailCodes', config: express.vite, env: envs.withEmailCodes },
    { id: 'express.vite.withEmailCodesProxy', config: express.vite, env: envs.withEmailCodesProxy },
    { id: 'express.vite.withCustomRoles', config: express.vite, env: envs.withCustomRoles },

    /**
     * Fastify apps
     */
    { id: 'fastify.vite.withEmailCodes', config: fastify.vite, env: envs.withEmailCodes },
    { id: 'fastify.vite.withEmailCodesProxy', config: fastify.vite, env: envs.withEmailCodesProxy },

    /**
     * Hono apps
     */
    { id: 'hono.vite.withEmailCodes', config: hono.vite, env: envs.withEmailCodes },
    { id: 'hono.vite.withEmailCodesProxy', config: hono.vite, env: envs.withEmailCodesProxy },
    { id: 'hono.vite.withCustomRoles', config: hono.vite, env: envs.withCustomRoles },
  ] as const;

  const stagingSkippedConfigs = allConfigs.filter(c => !isStagingReady(c.env));
  const stagingReadyConfigs = allConfigs.filter(c => isStagingReady(c.env));

  if (process.env.E2E_STAGING === '1' && stagingSkippedConfigs.length > 0) {
    const skippedIds = stagingSkippedConfigs.map(c => `\n  - ${c.id}`).join('');
    console.log(
      `[staging] Skipping ${stagingSkippedConfigs.length} long running app(s) without staging keys:${skippedIds}`,
    );
  }

  const apps = stagingReadyConfigs.map(longRunningApplication);

  return {
    getByPattern: (patterns: Array<string | (typeof allConfigs)[number]['id']>) => {
      const res = new Set(patterns.map(pattern => apps.filter(app => idMatchesPattern(app.id, pattern))).flat());
      if (!res.size) {
        // Check whether the pattern matches any known app (before staging filtering)
        const matchesKnownApp = patterns.some(pattern => allConfigs.some(c => idMatchesPattern(c.id, pattern)));
        if (!matchesKnownApp) {
          // Pattern doesn't match any known app — likely a typo, always throw
          const availableIds = allConfigs.map(c => `\n- ${c.id}`).join('');
          throw new Error(
            `Could not find long running app with id ${patterns}. The available ids are: ${availableIds}`,
          );
        }
        // Pattern matches a known app but it was filtered out by isStagingReady
        if (process.env.E2E_STAGING === '1') {
          const skippedIds = patterns
            .flatMap(pattern => stagingSkippedConfigs.filter(c => idMatchesPattern(c.id, pattern)))
            .map(c => c.id);
          if (skippedIds.length > 0) {
            console.log(`[staging] Skipping test suite(s) due to missing staging keys: ${skippedIds.join(', ')}`);
          }
          return [] as any as LongRunningApplication[];
        }
        const availableIds = stagingReadyConfigs.map(c => `\n- ${c.id}`).join('');
        throw new Error(`Could not find long running app with id ${patterns}. The available ids are: ${availableIds}`);
      }
      return [...res] as any as LongRunningApplication[];
    },
  };
};

// A function that accepts an array of string ids and returns the ids that match the input id
// The ids are strings and they follow the string.string.string format
// The input id can be either an excact match or a partial match using the string.* format
// Example: ['react.vite.withEmailCodes', 'react.vite.withEmailLinks', 'remix.node.withEmailCodes']
// Input: 'react.vite.*'
// Output: ['react.vite.withEmailCodes', 'react.vite.withEmailLinks']
//
// Example 2: ['react.vite.withEmailCodes', 'react.vite.withEmailLinks', 'remix.node.withEmailCodes']
// Input: '*.withEmailCodes'
// Output: ['react.vite.withEmailCodes', 'remix.node.withEmailCodes']
// Example 3: ['react.vite.withEmailCodes', 'react.vite.withEmailLinks', 'remix.node.withEmailCodes']
// Input: '*.node.withEmailCodes'
// Output: ['remix.node.withEmailCodes']
//
// idMatchesPattern('react.vite.withEmailCodes', 'react.vite.withEmailCodes') === true
// idMatchesPattern('react.vite.withEmailCodes', '*.vite.withEmailCodes') === true
// idMatchesPattern('react.vite.withEmailCodes', 'react.*.withEmailCodes') === true
// idMatchesPattern('react.vite.withEmailCodes', 'react.vite.*') === true
// idMatchesPattern('react.vite.withEmailCodes', '*.vite.withEmailCodes') === true
// idMatchesPattern('react.vite.withEmailCodes', '*.*.withEmailCodes') === true
// idMatchesPattern('react.vite.withEmailCodes', '*.*.*') === true
// idMatchesPattern('react.vite.withEmailCodes', 'react.*.*') === true
const idMatchesPattern = (id: string, pattern: string) => {
  if (!pattern.includes('*')) {
    return id === pattern;
  }
  // Convert glob pattern to regex by escaping special regex chars and replacing * with .*
  const escapedPattern = pattern
    .replace(/[.+?^${}()|[\]\\]/g, '\\$&') // Escape regex special chars except *
    .replace(/\*/g, '.*'); // Replace * with .* for regex matching
  return new RegExp(`^${escapedPattern}$`).test(id);
};
