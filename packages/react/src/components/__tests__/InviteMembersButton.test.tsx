import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import React from 'react';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { InviteMembersButton } from '../InviteMembersButton';

const mockOpenInviteMembers = vi.fn();
const originalError = console.error;

const mockClerk = {
  openInviteMembers: mockOpenInviteMembers,
} as any;

vi.mock('../withClerk', () => {
  return {
    withClerk: (Component: any) => (props: any) => {
      return (
        <Component
          {...props}
          clerk={mockClerk}
        />
      );
    },
  };
});

describe('<InviteMembersButton/>', () => {
  beforeAll(() => {
    console.error = vi.fn();
  });

  afterAll(() => {
    console.error = originalError;
  });

  beforeEach(() => {
    mockOpenInviteMembers.mockReset();
  });

  it('calls clerk.openInviteMembers when clicked', async () => {
    render(<InviteMembersButton />);
    const btn = screen.getByText('Invite members');

    await userEvent.click(btn);
    await waitFor(() => {
      expect(mockOpenInviteMembers).toHaveBeenCalled();
    });
  });

  it('forwards appearance to clerk.openInviteMembers', async () => {
    const appearance = { elements: { rootBox: 'test' } };
    render(<InviteMembersButton appearance={appearance} />);
    const btn = screen.getByText('Invite members');

    await userEvent.click(btn);
    await waitFor(() => {
      expect(mockOpenInviteMembers).toHaveBeenCalledWith(expect.objectContaining({ appearance }));
    });
  });

  it('renders passed button and calls both click handlers', async () => {
    const handler = vi.fn();
    render(
      <InviteMembersButton>
        <button
          onClick={handler}
          type='button'
        >
          custom button
        </button>
      </InviteMembersButton>,
    );
    const btn = screen.getByText('custom button');

    await userEvent.click(btn);
    await waitFor(() => {
      expect(handler).toHaveBeenCalled();
      expect(mockOpenInviteMembers).toHaveBeenCalled();
    });
  });

  it('uses text passed as children', async () => {
    render(<InviteMembersButton>text</InviteMembersButton>);
    screen.getByText('text');
  });

  it('throws if multiple children provided', async () => {
    expect(() => {
      render(
        <InviteMembersButton>
          <button type='button'>1</button>
          <button type='button'>2</button>
        </InviteMembersButton>,
      );
    }).toThrow();
  });

  it('does not pass appearance prop to child element', () => {
    const { container } = render(
      <InviteMembersButton appearance={{ elements: { rootBox: 'test' } }}>
        <button type='button'>Invite</button>
      </InviteMembersButton>,
    );

    const button = container.querySelector('button');
    expect(button?.hasAttribute('appearance')).toBe(false);
  });
});
