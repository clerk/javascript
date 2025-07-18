import { UserProfile } from '@clerk/clerk-react';
import type { Meta, StoryObj } from '@storybook/react-vite';

// Define the story metadata
const meta: Meta<typeof UserProfile> = {
  title: 'Components/UserProfile',
  component: UserProfile,
  parameters: {
    docs: {
      description: {
        component: 'The UserProfile component renders a UI for users to sign in to your application.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof UserProfile>;

// Default story
export const Default: Story = {
  args: {},
};
