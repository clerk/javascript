import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { MosaicProvider } from '../../mosaic-provider';
import { HeadingLevelProvider } from '../heading';
import { Profile } from '../profile';
import { Section } from '../section';
import { Panel } from './panel';

function Account() {
  return (
    <Panel.Root data-testid='root'>
      <Panel.Title>Account</Panel.Title>
      <Panel.Sections data-testid='sections'>
        <Section.Root>
          <Section.Group>
            <Section.Header>
              <Section.Content>
                <Section.Title>Email addresses</Section.Title>
              </Section.Content>
            </Section.Header>
          </Section.Group>
        </Section.Root>
      </Panel.Sections>
    </Panel.Root>
  );
}

describe('Panel', () => {
  it('renders every part with its slot', () => {
    render(
      <MosaicProvider>
        <Account />
      </MosaicProvider>,
    );

    expect(screen.getByTestId('root')).toHaveClass('cl-panel');
    expect(screen.getByTestId('sections')).toHaveClass('cl-panel-sections');
    expect(screen.getByRole('heading', { name: 'Account' }).parentElement).toHaveClass('cl-panel-title');
  });

  it('titles the panel at level 2 and its sections one level below', () => {
    render(
      <MosaicProvider>
        <Account />
      </MosaicProvider>,
    );

    expect(screen.getByRole('heading', { level: 2, name: 'Account' })).toHaveClass('cl-heading');
    expect(screen.getByRole('heading', { level: 3, name: 'Email addresses' })).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('starts from the level of an enclosing HeadingLevelProvider', () => {
    render(
      <MosaicProvider>
        <HeadingLevelProvider level={4}>
          <Account />
        </HeadingLevelProvider>
      </MosaicProvider>,
    );

    expect(screen.getByRole('heading', { level: 4, name: 'Account' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 5, name: 'Email addresses' })).toBeInTheDocument();
  });

  it('leaves the title to the profile inside a profile page', () => {
    render(
      <MosaicProvider>
        <Profile.Root value='account'>
          <Profile.Title>User profile</Profile.Title>
          <Profile.Nav>
            <Profile.NavItem value='account'>Account</Profile.NavItem>
          </Profile.Nav>
          <Profile.Content pageTitle='Account'>
            <Profile.ContentPanel value='account'>
              <Account />
            </Profile.ContentPanel>
          </Profile.Content>
        </Profile.Root>
      </MosaicProvider>,
    );

    expect(document.querySelector('.cl-panel-title')).not.toBeInTheDocument();
    expect(screen.getAllByRole('heading', { name: 'Account' })).toHaveLength(1);
    expect(screen.getByRole('heading', { name: 'Account' })).toHaveClass('cl-profile-page-title');
  });

  it('hands its ref to the page title inside a profile page', () => {
    const titleRef = React.createRef<HTMLDivElement>();
    render(
      <MosaicProvider>
        <Profile.Root value='account'>
          <Profile.Title>User profile</Profile.Title>
          <Profile.Nav>
            <Profile.NavItem value='account'>Account</Profile.NavItem>
          </Profile.Nav>
          <Profile.Content pageTitle='Account'>
            <Profile.ContentPanel value='account'>
              <Panel.Root>
                <Panel.Title ref={titleRef}>Account</Panel.Title>
              </Panel.Root>
            </Profile.ContentPanel>
          </Profile.Content>
        </Profile.Root>
      </MosaicProvider>,
    );

    const title = screen.getByRole('heading', { name: 'Account' });
    expect(titleRef.current).toBe(title);
    expect(title).toHaveAttribute('tabindex', '-1');
  });
});
