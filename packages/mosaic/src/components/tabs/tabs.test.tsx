import * as stylex from '@stylexjs/stylex';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { Tabs } from './tabs';
import { styles } from './tabs.styles';

const atoms = stylex.create({
  spaced: { marginTop: '8px' },
});

describe('Mosaic Tabs', () => {
  it('renders styled parts and changes the visible panel', async () => {
    render(
      <Tabs.Root defaultValue='members'>
        <Tabs.List>
          <Tabs.Tab value='members'>Members</Tabs.Tab>
          <Tabs.Tab value='invitations'>Invitations</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panels>
          <Tabs.Panel value='members'>Member list</Tabs.Panel>
          <Tabs.Panel value='invitations'>Invitation list</Tabs.Panel>
        </Tabs.Panels>
      </Tabs.Root>,
    );

    expect(screen.getByRole('tablist')).toHaveClass('cl-tabs-list');
    expect(screen.getByRole('tab', { name: 'Members' })).toHaveClass('cl-tabs-tab');
    expect(screen.getByText('Member list')).toBeVisible();
    expect(screen.getByText('Invitation list')).not.toBeVisible();

    await userEvent.click(screen.getByRole('tab', { name: 'Invitations' }));

    expect(screen.getByRole('tab', { name: 'Invitations' })).toHaveAttribute('data-selected');
    expect(screen.getByText('Invitation list')).toBeVisible();
  });

  it('renders the anchored indicator in the list and a fallback indicator in each tab', () => {
    render(
      <Tabs.Root defaultValue='members'>
        <Tabs.List aria-label='Members'>
          <Tabs.Tab value='members'>Members</Tabs.Tab>
          <Tabs.Tab value='invitations'>Invitations</Tabs.Tab>
        </Tabs.List>
      </Tabs.Root>,
    );

    const list = screen.getByRole('tablist');
    const anchored = list.firstElementChild;
    expect(anchored).toHaveClass('cl-tabs-indicator', stylex.props(styles.indicator).className ?? '');
    expect(anchored).toHaveAttribute('aria-hidden', 'true');

    for (const tab of screen.getAllByRole('tab')) {
      const fallback = tab.querySelector('.cl-tabs-indicator');
      expect(fallback).toHaveClass(stylex.props(styles.fallbackIndicator).className ?? '');
      expect(fallback).toHaveAttribute('aria-hidden', 'true');
    }
    expect(screen.getByRole('tab', { name: 'Members' })).toHaveAccessibleName('Members');
  });

  it('marks the indicator with the direction the selection traveled', async () => {
    render(
      <Tabs.Root defaultValue='invitations'>
        <Tabs.List>
          <Tabs.Tab value='members'>Members</Tabs.Tab>
          <Tabs.Tab value='invitations'>Invitations</Tabs.Tab>
          <Tabs.Tab value='requests'>Requests</Tabs.Tab>
        </Tabs.List>
      </Tabs.Root>,
    );
    const indicator = screen.getByRole('tablist').firstElementChild;

    await userEvent.click(screen.getByRole('tab', { name: 'Members' }));
    expect(indicator).toHaveAttribute('data-direction', 'backward');

    await userEvent.click(screen.getByRole('tab', { name: 'Requests' }));
    expect(indicator).toHaveAttribute('data-direction', 'forward');
  });

  it('keeps a nested tab list on its own indicator', async () => {
    render(
      <Tabs.Root defaultValue='outer-a'>
        <Tabs.List aria-label='Outer'>
          <Tabs.Tab value='outer-a'>Outer A</Tabs.Tab>
          <Tabs.Tab value='outer-b'>Outer B</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value='outer-a'>
          <Tabs.Root defaultValue='inner-b'>
            <Tabs.List aria-label='Inner'>
              <Tabs.Tab value='inner-a'>Inner A</Tabs.Tab>
              <Tabs.Tab value='inner-b'>Inner B</Tabs.Tab>
            </Tabs.List>
          </Tabs.Root>
        </Tabs.Panel>
      </Tabs.Root>,
    );
    const outer = screen.getByRole('tablist', { name: 'Outer' });
    const inner = screen.getByRole('tablist', { name: 'Inner' });

    await userEvent.click(screen.getByRole('tab', { name: 'Inner A' }));

    expect(inner.firstElementChild).toHaveAttribute('data-direction', 'backward');
    expect(outer.firstElementChild).toHaveAttribute('data-direction', 'forward');
    expect(outer).toHaveClass(stylex.props(styles.list).className ?? '');
    expect(inner).toHaveClass(stylex.props(styles.list).className ?? '');
  });

  it('renders a stackable panel wrapper with a ref and xstyle', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(
      <Tabs.Root defaultValue='members'>
        <Tabs.Panels
          ref={ref}
          xstyle={atoms.spaced}
        >
          <Tabs.Panel value='members'>Member list</Tabs.Panel>
        </Tabs.Panels>
      </Tabs.Root>,
    );

    const atom = stylex.props(atoms.spaced).className ?? '';
    const panelsAtom = stylex.props(styles.panels).className ?? '';
    const panelAtom = stylex.props(styles.panel).className ?? '';
    expect(ref.current).toHaveClass('cl-tabs-panels', panelsAtom, atom);
    expect(screen.getByText('Member list')).toHaveClass('cl-tabs-panel', panelAtom);
  });

  it('renders a custom panel wrapper and merges its refs and classes', () => {
    const ref = React.createRef<HTMLDivElement>();
    const renderRef = React.createRef<HTMLDivElement>();
    render(
      <Tabs.Root defaultValue='members'>
        <Tabs.Panels
          ref={ref}
          render={
            <div
              ref={renderRef}
              data-testid='custom-panels'
              className='from-source'
            />
          }
        >
          <Tabs.Panel value='members'>Member list</Tabs.Panel>
        </Tabs.Panels>
      </Tabs.Root>,
    );

    const panels = screen.getByTestId('custom-panels');
    const panelsAtom = stylex.props(styles.panels).className ?? '';
    expect(ref.current).toBe(panels);
    expect(renderRef.current).toBe(panels);
    expect(panels).toHaveClass('cl-tabs-panels', panelsAtom, 'from-source');
    expect(panels).toContainElement(screen.getByRole('tabpanel'));
  });
});
