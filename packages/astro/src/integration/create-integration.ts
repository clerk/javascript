import type { ClerkOptions } from '@clerk/types';
import type { AstroIntegration } from 'astro';

import { name as packageName, version as packageVersion } from '../../package.json';
import type { AstroClerkIntegrationParams } from '../types';
import { vitePluginAstroConfig } from './vite-plugin-astro-config';

const buildEnvVarFromOption = (valueToBeStored: unknown, envName: keyof InternalEnv) => {
  return valueToBeStored ? { [`import.meta.env.${envName}`]: JSON.stringify(valueToBeStored) } : {};
};

type HotloadAstroClerkIntegrationParams = AstroClerkIntegrationParams & {
  clerkJSUrl?: string;
  clerkJSVariant?: 'headless' | '';
  clerkJSVersion?: string;
};

function createIntegration<Params extends HotloadAstroClerkIntegrationParams>() {
  return (params?: Params): AstroIntegration => {
    const { proxyUrl, isSatellite, domain, signInUrl, signUpUrl } = params || {};

    // These are not provided when the "bundled" integration is used
    const clerkJSUrl = (params as any)?.clerkJSUrl as string | undefined;
    const clerkJSVariant = (params as any)?.clerkJSVariant as string | undefined;
    const clerkJSVersion = (params as any)?.clerkJSVersion as string | undefined;

    return {
      name: '@clerk/astro/integration',
      hooks: {
        'astro:config:setup': ({ config, injectScript, updateConfig, logger, command }) => {
          if (['server', 'hybrid'].includes(config.output) && !config.adapter) {
            logger.error('Missing adapter, please update your Astro config to use one.');
          }

          if (typeof clerkJSVariant !== 'undefined' && clerkJSVariant !== 'headless' && clerkJSVariant !== '') {
            logger.error('Invalid value for clerkJSVariant. Acceptable values are `"headless"`, `""`, and `undefined`');
          }

          const internalParams: ClerkOptions = {
            ...params,
            sdkMetadata: {
              version: packageVersion,
              name: packageName,
              environment: command === 'dev' ? 'development' : 'production',
            },
          };

          const buildImportPath = `${packageName}/internal`;

          // Set params as envs so backend code has access to them
          updateConfig({
            vite: {
              plugins: [vitePluginAstroConfig(config)],
              define: {
                /**
                 * Convert the integration params to environment variable in order for it to be readable from the server
                 */
                ...buildEnvVarFromOption(signInUrl, 'PUBLIC_CLERK_SIGN_IN_URL'),
                ...buildEnvVarFromOption(signUpUrl, 'PUBLIC_CLERK_SIGN_UP_URL'),
                ...buildEnvVarFromOption(isSatellite, 'PUBLIC_CLERK_IS_SATELLITE'),
                ...buildEnvVarFromOption(proxyUrl, 'PUBLIC_CLERK_PROXY_URL'),
                ...buildEnvVarFromOption(domain, 'PUBLIC_CLERK_DOMAIN'),
                ...buildEnvVarFromOption(clerkJSUrl, 'PUBLIC_CLERK_JS_URL'),
                ...buildEnvVarFromOption(clerkJSVariant, 'PUBLIC_CLERK_JS_VARIANT'),
                ...buildEnvVarFromOption(clerkJSVersion, 'PUBLIC_CLERK_JS_VERSION'),
              },

              ssr: {
                external: ['node:async_hooks'],
              },

              // We need this for top-level await
              optimizeDeps: {
                esbuildOptions: {
                  target: 'es2022',
                },
              },
              build: {
                target: 'es2022',
              },
            },
          });

          /**
           * ------------- Script Injection --------------------------
           * Below we are injecting the same script twice. `runInjectionScript` is build in such way in order to instanciate and load Clerk only once.
           * We need both scripts in order to support applications with or without UI frameworks.
           */

          /**
           * The above script will run before client frameworks like React hydrate.
           * This makes sure that we have initialized a Clerk instance and populated stores in order to avoid hydration issues.
           */
          injectScript(
            'before-hydration',
            `
            ${command === 'dev' ? `console.log('${packageName}',"Initialize Clerk: before-hydration")` : ''}
            import { runInjectionScript } from "${buildImportPath}";
            await runInjectionScript(${JSON.stringify(internalParams)});`,
          );

          /**
           * The above script only executes if a client framework like React needs to hydrate.
           * We need to run the same script again for each page in order to initialize Clerk even if no UI framework is used in the client
           * If no UI framework is used in the client, the above script with `before-hydration` will never run
           */

          injectScript(
            'page',
            `
            ${command === 'dev' ? `console.log("${packageName}","Initialize Clerk: page")` : ''}
            import { runInjectionScript, swapDocument } from "${buildImportPath}";

            // Taken from https://github.com/withastro/astro/blob/e10b03e88c22592fbb42d7245b65c4f486ab736d/packages/astro/src/transitions/router.ts#L39.
            // Importing it directly from astro:transitions/client breaks custom client-side routing
            // even when View Transitions is disabled.
            const transitionEnabledOnThisPage = () => {
              return !!document.querySelector('[name="astro-view-transitions-enabled"]');
            }

            if (transitionEnabledOnThisPage()) {
              const { navigate, swapFunctions } = await import('astro:transitions/client');

              document.addEventListener('astro:before-swap', (e) => {
                const clerkComponents = document.querySelector('#clerk-components');
                // Keep the div element added by Clerk
                if (clerkComponents) {
                  const clonedEl = clerkComponents.cloneNode(true);
                  e.newDocument.body.appendChild(clonedEl);
                }

                e.swap = () => swapDocument(swapFunctions, e.newDocument);
              });

              document.addEventListener('astro:page-load', async (e) => {
                await runInjectionScript({
                  ...${JSON.stringify(internalParams)},
                  routerPush: navigate,
                  routerReplace: (url) => navigate(url, { history: 'replace' }),
                });
              })
            } else {
              await runInjectionScript(${JSON.stringify(internalParams)});
            }`,
          );
        },
        'astro:config:done': ({ injectTypes }) => {
          injectTypes({
            filename: 'types.d.ts',
            content: `/// <reference types="@clerk/astro/env" />`,
          });
        },
      },
    };
  };
}

export { createIntegration };
