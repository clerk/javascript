import { buildErrorReporter } from './reporter';

describe.concurrent('errorReporter', () => {
  const errorReporter = buildErrorReporter({ pkg: '@clerk/test-package' });

  it('throws the correct error message and interpolates pkg and known parameters', () => {
    expect(() => errorReporter.throwInvalidPublishableKeyError({ key: 'whatever' })).toThrow(
      '@clerk/test-package: The publishable key passed to Clerk is invalid. You can get your publishable key at https://dashboard.clerk.dev/last-active?path=api-keys. (key=whatever)',
    );
  });

  it('throws a custom error message and interpolates pkg and known parameters', () => {
    expect(() =>
      errorReporter
        .setMessages({
          InvalidPublishableKeyErrorMessage:
            'This is a custom error message for key={{key}} and {{unknown_replacement}}',
        })
        .throwInvalidPublishableKeyError({ key: 'whatever' }),
    ).toThrow('@clerk/test-package: This is a custom error message for key=whatever and');
  });
});
