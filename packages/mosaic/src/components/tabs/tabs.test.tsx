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
          <Tabs.Indicator data-testid='indicator' />
        </Tabs.List>
        <Tabs.Panels>
          <Tabs.Panel value='members'>Member list</Tabs.Panel>
          <Tabs.Panel value='invitations'>Invitation list</Tabs.Panel>
        </Tabs.Panels>
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
