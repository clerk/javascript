import { render } from '@testing-library/vue';
import { vi } from 'vitest';
import { defineComponent } from 'vue';

import { clerkPlugin } from '../../plugin';
import { useClerkContext } from '../useClerkContext';

describe('useClerkContext', () => {
  it('should throw an error if the Clerk plugin is not installed', () => {
    // Hide missing injection key warning
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const Component = defineComponent(() => {
      useClerkContext('useAuth');
      return () => null;
    });

    expect(() => render(Component)).toThrow(
      '@clerk/vue: useAuth can only be used when the Vue plugin is installed. Learn more: https://clerk.com/docs/reference/vue/clerk-plugin',
    );

    consoleSpy.mockRestore();
  });

  it('should return the context if the Clerk plugin is installed', () => {
    const Component = defineComponent(() => {
      useClerkContext('useAuth');
      return () => null;
    });

    expect(() =>
      render(Component, {
        global: {
          plugins: [
            [
              clerkPlugin,
              {
                publishableKey: 'pk_xxx',
              },
            ],
          ],
        },
      }),
    ).not.toThrow();
  });
});
