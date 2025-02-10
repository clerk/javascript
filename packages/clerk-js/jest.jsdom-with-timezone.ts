import JSDOMEnvironment from 'jest-environment-jsdom';

/**
 * Timezone-aware jsdom Jest environment. Supports `@timezone` JSDoc
 * pragma within test suites to set timezone.
 *
 * You'd make another copy of this extending the Node environment,
 * if needed for Node server environment-based tests.
 */
module.exports = class TimezoneAwareJSDOMEnvironment extends JSDOMEnvironment {
  // @ts-ignore
  constructor(config, context) {
    // Allow test suites to change timezone, even if TZ is passed in a script.
    // Falls back to existing TZ environment variable or UTC if no timezone is specified.
    // IMPORTANT: This must happen before super(config) is called, otherwise
    // it doesn't work.
    process.env.TZ = context.docblockPragmas.timezone || process.env.TZ || 'UTC';

    super(config, context);
  }
};
