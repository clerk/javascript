import { cleanup, render, screen } from '@testing-library/react';
import * as React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import { MosaicProvider } from '../../mosaic-provider';
import { Panel } from '../panel';
import { Profile } from './index';

afterEach(() => cleanup());

function Controlled({ width }: { width: number }) {
  const [value, setValue] = React.useState('account');
  return (
    <div style={{ width }}>
      <Profile.Root
        value={value}
        onValueChange={setValue}
      >
        <Profile.Title>User profile</Profile.Title>
        <Profile.Nav>
          <Profile.NavItem value='account'>Account</Profile.NavItem>
          <Profile.NavItem value='security'>Security</Profile.NavItem>
        </Profile.Nav>
        <Profile.Content>
          <Profile.ContentPanel value='account'>
            <Panel.Root>
              <Panel.Title>Account</Panel.Title>
            </Panel.Root>
          </Profile.ContentPanel>
          <Profile.ContentPanel value='security'>
            <Panel.Root>
              <Panel.Title>Security</Panel.Title>
            </Panel.Root>
          </Profile.ContentPanel>
        </Profile.Content>
      </Profile.Root>
    </div>
  );
}

describe('Profile in a real browser', () => {
  it('returns focus to the new page title after a keyboard pick in the select', async () => {
    await page.viewport(1024, 768);
    render(
      <MosaicProvider>
        <Controlled width={600} />
      </MosaicProvider>,
    );
    const trigger = await screen.findByRole('combobox', { name: 'Account' });
    trigger.focus();
    await userEvent.keyboard('{Enter}');
    await expect.poll(() => document.activeElement?.getAttribute('role')).toBe('option');
    await userEvent.keyboard('{ArrowDown}');
    await userEvent.keyboard('{Enter}');

    await expect.poll(() => screen.queryByRole('listbox')).toBeNull();
    await expect.poll(() => document.activeElement).toBe(screen.getByRole('combobox', { name: 'Security' }));
  });

  it('returns focus to the new page title after a keyboard pick in the sheet', async () => {
    await page.viewport(375, 700);
    render(
      <MosaicProvider>
        <Controlled width={375} />
      </MosaicProvider>,
    );
    const trigger = await screen.findByRole('button', { name: 'Account' });
    trigger.focus();
    await userEvent.keyboard('{Enter}');
    await expect.poll(() => document.activeElement?.getAttribute('role')).toBe('dialog');
    await userEvent.keyboard('{Tab}');
    await userEvent.keyboard('{ArrowDown}');
    await userEvent.keyboard('{Enter}');

    await expect.poll(() => screen.queryByRole('dialog')).toBeNull();
    await expect.poll(() => document.activeElement).toBe(screen.getByRole('button', { name: 'Security' }));
  });
});
