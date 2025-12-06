/* eslint-disable turbo/no-undeclared-env-vars */
import * as os from 'node:os';
import * as path from 'node:path';

export const constants = {
  TMP_DIR: path.join(os.tmpdir(), '.temp_integration'),
  CERTS_DIR: path.join(process.cwd(), 'integration/certs'),
  APPS_STATE_FILE: path.join(os.tmpdir(), '.temp_integration', 'state.json'),
  /**
   * A URL to a running app that will be used to run the tests against.
   * This is usually used when running the app has been started manually,
   * outside the test runner.
   */
  E2E_APP_URL: process.env.E2E_APP_URL,
  /**
   * Used to indicate which longRunning apps to start.
   * Can also use * to start multiple apps, eg
   * E2E_APP_ID=react.vite.*
   */
  E2E_APP_ID: process.env.E2E_APP_ID,
  /**
   * Controls the URL the apps will load clerk.browser.js from.
   * This is the same as the clerkJsUrl prop.
   * If this is set, clerk-js will not be served automatically from the test runner.
   */
  E2E_APP_CLERK_JS: process.env.E2E_APP_CLERK_JS,
  /**
   * Controls the path where clerk.browser.js is located on the disk.
   */
  E2E_APP_CLERK_JS_DIR: process.env.E2E_APP_CLERK_JS_DIR,
  /**
   * Controls the URL the apps will load ui.browser.js from.
   * If this is set, clerk-ui will not be served automatically from the test runner.
   */
  E2E_APP_CLERK_UI: process.env.E2E_APP_CLERK_UI,
  /**
   * Controls the path where ui.browser.js is located on the disk.
   */
  E2E_APP_CLERK_UI_DIR: process.env.E2E_APP_CLERK_UI_DIR,
  /**
   * If E2E_CLEANUP=0 is used, the .tmp_integration directory will not be deleted.
   * This is useful for debugging locally.
   */
  E2E_CLEANUP: !(process.env.E2E_CLEANUP === '0' || process.env.E2E_CLEANUP === 'false'),
  DEBUG: process.env.DEBUG === 'true' || process.env.DEBUG === '1',
  /**
   * Used with E2E_APP_URL if the tests need to access BAPI.
   */
  E2E_APP_SK: process.env.E2E_APP_SK,
  E2E_APP_PK: process.env.E2E_APP_PK,
  E2E_CLERK_API_URL: process.env.E2E_CLERK_API_URL,
  /**
   * The version of the dependency to use, controlled programmatically.
   */
  E2E_NPM_FORCE: process.env.E2E_NPM_FORCE,
  /**
   * The version of the dependency to use, controlled programmatically.
   */
  E2E_NEXTJS_VERSION: process.env.E2E_NEXTJS_VERSION,
  /**
   * The version of the dependency to use, controlled programmatically.
   */
  E2E_REACT_VERSION: process.env.E2E_REACT_VERSION,
  /**
   * The version of the dependency to use, controlled programmatically.
   */
  E2E_REACT_DOM_VERSION: process.env.E2E_REACT_DOM_VERSION,
  /**
   * The version of the dependency to use, controlled programmatically.
   */
  E2E_VITE_VERSION: process.env.E2E_VITE_VERSION,
  /**
   * The version of the dependency to use, controlled programmatically.
   */
  E2E_CLERK_JS_VERSION: process.env.E2E_CLERK_JS_VERSION,
  /**
   * The version of the dependency to use, controlled programmatically.
   */
  E2E_CLERK_UI_VERSION: process.env.E2E_CLERK_UI_VERSION,
  /**
   * Key used to encrypt request data for Next.js dynamic keys.
   * @ref https://clerk.com/docs/references/nextjs/clerk-middleware#dynamic-keys
   */
  E2E_CLERK_ENCRYPTION_KEY: process.env.CLERK_ENCRYPTION_KEY,
  /**
   * PK and SK pairs from the env to use for integration tests.
   */
  INTEGRATION_INSTANCE_KEYS: process.env.INTEGRATION_INSTANCE_KEYS,
} as const;
