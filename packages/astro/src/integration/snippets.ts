import type { ClerkOptions } from '@clerk/shared/types';

/**
 * Creates a snippet that initializes Clerk before client-side framework hydration occurs.
 *
 * This script runs before frameworks like React, Vue, or Svelte hydrate their components,
 * ensuring the Clerk instance is ready and stores are populated to prevent hydration mismatches.
 * It performs a simple, synchronous initialization without handling view transitions.
 *
 * @param command - The Astro command being run ('dev' or 'build')
 * @param packageName - The name of the Clerk package for debug logging
 * @param buildImportPath - The import path to the internal Clerk utilities
 * @param internalParams - Clerk configuration options including SDK metadata
 * @returns A script string to be injected via Astro's 'before-hydration' stage
 */
export function buildBeforeHydrationSnippet({
  command,
  packageName,
  buildImportPath,
  internalParams,
}: {
  command: string;
  packageName: string;
  buildImportPath: string;
  internalParams: ClerkOptions;
}) {
  return `
  ${command === 'dev' ? `console.log("${packageName}","Initialize Clerk: before-hydration")` : ''}
  import { runInjectionScript } from "${buildImportPath}";
  await runInjectionScript(${JSON.stringify(internalParams)});`;
}

/**
 * Creates a snippet that initializes Clerk on page load with support for Astro View Transitions.
 *
 * This script handles two scenarios:
 * 1. **With View Transitions enabled**: Listens for astro:page-load and astro:before-swap events
 *    to properly initialize Clerk and preserve its DOM elements during page transitions.
 * 2. **Without View Transitions**: Performs standard initialization on initial page load.
 *
 * This script is necessary for pages without client-side frameworks, as the before-hydration
 * script only runs when framework hydration occurs. This ensures Clerk is always initialized,
 * regardless of whether UI frameworks are present.
 *
 * @param command - The Astro command being run ('dev' or 'build')
 * @param packageName - The name of the Clerk package for debug logging
 * @param buildImportPath - The import path to the internal Clerk utilities
 * @param internalParams - Clerk configuration options including SDK metadata
 * @returns A script string to be injected via Astro's 'page' stage
 */
export function buildPageLoadSnippet({
  command,
  packageName,
  buildImportPath,
  internalParams,
}: {
  command: string;
  packageName: string;
  buildImportPath: string;
  internalParams: ClerkOptions;
}) {
  return `
  ${command === 'dev' ? `console.log("${packageName}","Initialize Clerk: page")` : ''}
  import { runInjectionScript, swapDocument } from "${buildImportPath}";

  // Taken from https://github.com/withastro/astro/blob/e10b03e88c22592fbb42d7245b65c4f486ab736d/packages/astro/src/transitions/router.ts#L39.
  // Importing it directly from astro:transitions/client breaks custom client-side routing
  // even when View Transitions is disabled.
  const transitionEnabledOnThisPage = () => {
    return !!document.querySelector('[name="astro-view-transitions-enabled"]');
  }

  if (transitionEnabledOnThisPage()) {
    // We must do the dynamic imports within the event listeners because otherwise we may race and miss initial astro:page-load
    document.addEventListener('astro:before-swap', async (e) => {
      const { swapFunctions } = await import('astro:transitions/client');

      const clerkComponents = document.querySelector('#clerk-components');
      // Keep the div element added by Clerk
      if (clerkComponents) {
        const clonedEl = clerkComponents.cloneNode(true);
        e.newDocument.body.appendChild(clonedEl);
      }

      e.swap = () => swapDocument(swapFunctions, e.newDocument);
    });

    document.addEventListener('astro:page-load', async (e) => {
      const { navigate } = await import('astro:transitions/client');

      await runInjectionScript({
        ...${JSON.stringify(internalParams)},
        routerPush: navigate,
        routerReplace: (url) => navigate(url, { history: 'replace' }),
      });
    })
  } else {
    await runInjectionScript(${JSON.stringify(internalParams)});
  }`;
}
