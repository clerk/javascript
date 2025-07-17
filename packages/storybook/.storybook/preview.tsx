import type { Preview } from '@storybook/react';
import React from 'react';
import { ClerkProvider } from '@clerk/clerk-react';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    layout: 'centered',
  },
  decorators: [
    Story => (
      <ClerkProvider publishableKey='pk_test_dG91Y2hlZC1sYWR5YmlyZC0yMy5jbGVyay5hY2NvdW50cy5kZXYk'>
        <Story />
      </ClerkProvider>
    ),
  ],
};

export default preview;
