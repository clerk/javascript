// @vitest-environment node

import React from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { MosaicProvider } from '../../mosaic-provider';
import { Panel } from '../panel';
import { Profile } from '.';

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
      </MosaicProvider>,
    );

    const pageTitle = html.match(/<h3[^>]*class="[^"]*\bcl-profile-page-title\b[^"]*"[^>]*>(.*?)<\/h3>/)?.[1];
    expect(pageTitle).toContain('Security');
    expect(pageTitle).not.toContain('Account');
  });

  it.each([
    { subPage: null, title: 'Security', back: false },
    { subPage: 'passkeys', title: 'Passkeys', back: true },
  ])('gives the page title id to the open sub-page only, with subPage $subPage', ({ subPage, title, back }) => {
    const html = renderToString(
      <MosaicProvider>
        <Profile.Root value='security'>
          <Profile.Title>User profile</Profile.Title>
          <Profile.Content>
            <Profile.ContentPanel
              value='security'
              label='Security'
              subPage={subPage}
              onSubPageChange={() => {}}
            >
              <Profile.SubPage value={null}>
                <Panel.Root>
                  <Panel.Title>Security</Panel.Title>
                </Panel.Root>
              </Profile.SubPage>
              <Profile.SubPage value='passkeys'>
                <Panel.Root>
                  <Panel.Title>Passkeys</Panel.Title>
                </Panel.Root>
              </Profile.SubPage>
            </Profile.ContentPanel>
          </Profile.Content>
        </Profile.Root>
      </MosaicProvider>,
    );

    const headings = [...html.matchAll(/<h3[^>]*>(.*?)<\/h3>/g)];
    expect(headings).toHaveLength(1);
    const [heading, content] = headings[0] ?? [];
    const id = heading?.match(/\sid="([^"]+)"/)?.[1];
    expect(id).toBeDefined();
    expect(content).toContain(title);
    expect(html.match(new RegExp(`id="${id}"`, 'g'))).toHaveLength(1);
    expect(html).toContain(`aria-labelledby="${id}-label"`);
    expect(html).toContain(`<span id="${id}-label">${title}</span>`);
    expect(html.includes('aria-label="Back to Security"')).toBe(back);
  });
});
