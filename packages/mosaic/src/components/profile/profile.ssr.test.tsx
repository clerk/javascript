// @vitest-environment node

import React from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { MosaicProvider } from '../../mosaic-provider';
import { Profile } from './profile';

describe('Profile SSR', () => {
  it('names the page in the page title heading on the server', () => {
    const html = renderToString(
      <MosaicProvider>
        <Profile.Root value='security'>
          <Profile.Title>User profile</Profile.Title>
          <Profile.Nav>
            <Profile.NavItem value='account'>Account</Profile.NavItem>
            <Profile.NavItem value='security'>Security</Profile.NavItem>
          </Profile.Nav>
          <Profile.Content pageTitle='Security'>
            <Profile.ContentPanel value='account'>Account page</Profile.ContentPanel>
            <Profile.ContentPanel value='security'>Security page</Profile.ContentPanel>
          </Profile.Content>
        </Profile.Root>
      </MosaicProvider>,
    );

    const pageTitle = html.match(/<h3[^>]*class="[^"]*\bcl-profile-page-title\b[^"]*"[^>]*>(.*?)<\/h3>/)?.[1];
    expect(pageTitle).toContain('Security');
    expect(pageTitle).not.toContain('Account');
  });
});
