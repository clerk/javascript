import { buildErrorThrower, ErrorThrowerOptions } from './thrower';

describe.concurrent('ErrorThrower', () => {
  const errorThrower = buildErrorThrower({ packageName: '@clerk/test-package' });

  it('throws the correct error message and interpolates pkg and known parameters', () => {
    expect(() => errorThrower.throwInvalidPublishableKeyError({ key: 'whatever' })).toThrow(
      '@clerk/test-package: The publishableKey passed to Clerk is invalid. You can get your Publishable key at https://dashboard.clerk.dev/last-active?path=api-keys. (key=whatever)',
    );
  });

  it('throws the correct error message and interpolates pkg if no parameters are provided', () => {
    expect(() => errorThrower.throwMissingFrontendApiOrPublishableKeyError()).toThrow(
      '@clerk/test-package: Missing frontendApi or publishableKey. You can get your key at https://dashboard.clerk.dev/last-active?path=api-keys.',
    );
  });

  it('throws a custom error message and interpolates pkg and known parameters', () => {
    expect(() =>
      errorThrower
        .setPackageName({
          packageName: '@clerk/another-test-package',
        })
        .setMessages({
          customMessages: {
            InvalidPublishableKeyErrorMessage:
              'This is a custom error message for key={{key}} and an unknown {{replacement}}',
          },
        } as ErrorThrowerOptions)
        .throwInvalidPublishableKeyError({ key: 'whatever' }),
    ).toThrow('@clerk/another-test-package: This is a custom error message for key=whatever and an unknown ');
  });
});
