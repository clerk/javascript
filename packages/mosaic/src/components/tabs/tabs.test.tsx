import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { Tabs } from './tabs';

describe('Mosaic Tabs', () => {
  it('renders styled parts and changes the visible panel', async () => {
    render(
      <Tabs.Root defaultValue='members'>
        <Tabs.List>
          <Tabs.Tab value='members'>Members</Tabs.Tab>
          <Tabs.Tab value='invitations'>Invitations</Tabs.Tab>
          <Tabs.Indicator data-testid='indicator' />
        </Tabs.List>
        <Tabs.Panel value='members'>Member list</Tabs.Panel>
        <Tabs.Panel value='invitations'>Invitation list</Tabs.Panel>
      </Tabs.Root>,
    );

    expect(screen.getByRole('tablist')).toHaveClass('cl-tabs-list');
    expect(screen.getByRole('tab', { name: 'Members' })).toHaveClass('cl-tabs-tab');
    expect(screen.getByTestId('indicator')).toHaveClass('cl-tabs-indicator');
    expect(screen.getByText('Member list')).toBeVisible();
    expect(screen.getByText('Invitation list')).not.toBeVisible();

    await userEvent.click(screen.getByRole('tab', { name: 'Invitations' }));

    expect(screen.getByRole('tab', { name: 'Invitations' })).toHaveAttribute('data-selected');
    expect(screen.getByText('Invitation list')).toBeVisible();
  });
});
