import type { ClerkOptions } from '@clerk/types';
import type { AstroIntegration } from 'astro';

import { name as packageName, version as packageVersion } from '../../package.json';
import type { AstroClerkIntegrationParams } from '../types';

const buildEnvVarFromOption = (valueToBeStored: unknown, envName: keyof InternalEnv) => {
  return valueToBeStored ? { [`import.meta.env.${envName}`]: JSON.stringify(valueToBeStored) } : {};
};

type HotloadAstroClerkIntegrationParams = AstroClerkIntegrationParams & {
  clerkJSUrl?: string;
  clerkJSVariant?: 'headless' | '';
  clerkJSVersion?: string;
};

function createIntegration<P extends { mode: 'hotload' | 'bundled' }>({ mode }: P) {
  return (
    params?: P['mode'] extends 'hotload' ? HotloadAstroClerkIntegrationParams : AstroClerkIntegrationParams,
  ): AstroIntegration => {
    const { proxyUrl, isSatellite, domain, signInUrl, signUpUrl } = params || {};

    // These are not provided when the "bundled" integration is used
    const clerkJSUrl = (params as any)?.clerkJSUrl as string | undefined;
    const clerkJSVariant = (params as any)?.clerkJSVariant as string | undefined;
    const clerkJSVersion = (params as any)?.clerkJSVersion as string | undefined;

    const internalParams: ClerkOptions = {
      ...params,
      sdkMetadata: {
        version: packageVersion,
        name: packageName,
        // environment: import.meta.env.MODE,
      },
    };

    return {
      name: '@clerk/astro/integration',
      hooks: {
        'astro:config:setup': ({ config, injectScript, updateConfig, logger, command }) => {
          if (config.output === 'static') {
            logger.error(`${packageName} requires SSR to be turned on. Please update output to "server"`);
          }

          if (!config.adapter) {
            logger.error('Missing adapter, please update your Astro config to use one.');
          }

          if (typeof clerkJSVariant !== 'undefined' && clerkJSVariant !== 'headless' && clerkJSVariant !== '') {
            logger.error('Invalid value for clerkJSVariant. Acceptable values are `"headless"`, `""`, and `undefined`');
          }

          const defaultBundledImportPath = `${packageName}/internal/bundled`;

          const buildImportPath =
            mode === 'bundled' ? defaultBundledImportPath : defaultBundledImportPath.replace('/bundled', '');

          // Set params as envs do backend code has access to them
          updateConfig({
            vite: {
              define: {
                /**
                 * Convert the integration params to environment variable in order for be readable from the server
                 */
                ...buildEnvVarFromOption(signInUrl, 'PUBLIC_CLERK_SIGN_IN_URL'),
                ...buildEnvVarFromOption(signUpUrl, 'PUBLIC_CLERK_SIGN_UP_URL'),
                ...buildEnvVarFromOption(isSatellite, 'PUBLIC_CLERK_IS_SATELLITE'),
                ...buildEnvVarFromOption(proxyUrl, 'PUBLIC_CLERK_PROXY_URL'),
                ...buildEnvVarFromOption(domain, 'PUBLIC_CLERK_DOMAIN'),
                ...buildEnvVarFromOption(domain, 'PUBLIC_CLERK_DOMAIN'),
                ...buildEnvVarFromOption(domain, 'PUBLIC_CLERK_DOMAIN'),
                ...buildEnvVarFromOption(clerkJSUrl, 'PUBLIC_CLERK_JS_URL'),
                ...buildEnvVarFromOption(clerkJSVariant, 'PUBLIC_CLERK_JS_VARIANT'),
                ...buildEnvVarFromOption(clerkJSVersion, 'PUBLIC_CLERK_JS_VERSION'),
                __HOTLOAD__: mode === 'hotload',
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
            import { runInjectionScript } from "${buildImportPath}";
            await runInjectionScript(${JSON.stringify(internalParams)});`,
          );
        },
      },
    };
  };
}

export { createIntegration };
