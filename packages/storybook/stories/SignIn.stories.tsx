import { SignIn } from '@clerk/clerk-react';
import type { Meta, StoryObj } from '@storybook/react-vite';

// Define the story metadata
const meta: Meta<typeof SignIn> = {
  title: 'Components/SignIn',
  component: SignIn,
  parameters: {
    docs: {
      description: {
        component: 'The SignIn component renders a UI for users to sign in to your application.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof SignIn>;

// Default story
export const Default: Story = {
  args: {},
};
