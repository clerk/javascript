import { SignUp } from '@clerk/clerk-react';
import type { Meta, StoryObj } from '@storybook/react-vite';

// Define the story metadata
const meta: Meta<typeof SignUp> = {
  title: 'Components/SignUp',
  component: SignUp,
  parameters: {
    docs: {
      description: {
        component: 'The SignUp component renders a UI for users to sign in to your application.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof SignUp>;

// Default story
export const Default: Story = {
  args: {},
};
