import { UserButton } from '@clerk/clerk-react';
import type { Meta, StoryObj } from '@storybook/react-vite';

// Define the story metadata
const meta: Meta<typeof UserButton> = {
  title: 'Components/UserButton',
  component: UserButton,
  parameters: {
    docs: {
      description: {
        component: 'The UserButton component renders a UI for users to sign in to your application.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof UserButton>;

// Default story
export const Default: Story = {
  args: {},
};
