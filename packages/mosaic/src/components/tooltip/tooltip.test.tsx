import * as stylex from '@stylexjs/stylex';
import { act, cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';

import { Tooltip } from './tooltip';

afterEach(() => cleanup());

describe('Mosaic Tooltip', () => {
  it('opens on hover and names the popup as a tooltip', async () => {
    const user = userEvent.setup();
    render(
      <Tooltip.Root delay={0}>
        <Tooltip.Trigger>Hover me</Tooltip.Trigger>
        <Tooltip.Popup>Helpful label</Tooltip.Popup>
      </Tooltip.Root>,
    );

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

    const trigger = screen.getByRole('button', { name: 'Hover me' });
    await user.hover(trigger);

    const tooltip = screen.getByRole('tooltip');
    expect(tooltip).toHaveTextContent('Helpful label');
    expect(trigger).toHaveAttribute('aria-describedby', tooltip.id);
  });

  it('opens on focus', async () => {
    render(
      <Tooltip.Root delay={0}>
        <Tooltip.Trigger>Focus me</Tooltip.Trigger>
        <Tooltip.Popup>Helpful label</Tooltip.Popup>
      </Tooltip.Root>,
    );

    await act(() => {
      screen.getByRole('button', { name: 'Focus me' }).focus();
    });

    expect(screen.getByRole('tooltip')).toHaveTextContent('Helpful label');
  });

  it('renders a custom trigger through the render prop', () => {
    render(
      <Tooltip.Root>
        <Tooltip.Trigger
          render={props => (
            <a
              href='#settings'
              {...props}
            >
              Settings
            </a>
          )}
        />
        <Tooltip.Popup>Open settings</Tooltip.Popup>
      </Tooltip.Root>,
    );

    expect(screen.getByRole('link', { name: 'Settings' })).toHaveAttribute('data-closed', '');
  });

  it('carries the mosaic slot classes on the trigger, positioner and popup', () => {
    render(
      <Tooltip.Root defaultOpen>
        <Tooltip.Trigger>Hover me</Tooltip.Trigger>
        <Tooltip.Popup>Helpful label</Tooltip.Popup>
      </Tooltip.Root>,
    );

    expect(document.querySelector('.cl-tooltip-trigger')).toBeInTheDocument();
    expect(document.querySelector('.cl-tooltip-positioner')).toBeInTheDocument();
    expect(document.querySelector('.cl-tooltip-popup')).toBeInTheDocument();
  });

  it('composes consumer xstyle onto the trigger alongside the slot class', () => {
    const caller = stylex.create({ trigger: { marginInlineStart: '4px' } });
    render(
      <Tooltip.Root>
        <Tooltip.Trigger xstyle={caller.trigger}>Hover me</Tooltip.Trigger>
        <Tooltip.Popup>Helpful label</Tooltip.Popup>
      </Tooltip.Root>,
    );

    expect(screen.getByRole('button', { name: 'Hover me' })).toHaveClass(
      'cl-tooltip-trigger',
      stylex.props(caller.trigger).className ?? '',
    );
  });

  it('merges the className a render source hands the trigger', () => {
    render(
      <Tooltip.Root>
        <Tooltip.Trigger
          render={
            <button
              type='button'
              className='from-render'
            />
          }
        >
          Hover me
        </Tooltip.Trigger>
        <Tooltip.Popup>Helpful label</Tooltip.Popup>
      </Tooltip.Root>,
    );

    expect(screen.getByRole('button', { name: 'Hover me' })).toHaveClass('cl-tooltip-trigger', 'from-render');
  });

  it('composes consumer xstyle onto the popup', () => {
    const caller = stylex.create({ popup: { marginTop: '8px' } });
    render(
      <Tooltip.Root defaultOpen>
        <Tooltip.Trigger>Hover me</Tooltip.Trigger>
        <Tooltip.Popup xstyle={caller.popup}>Helpful label</Tooltip.Popup>
      </Tooltip.Root>,
    );

    expect(document.querySelector('.cl-tooltip-popup')).toHaveClass(
      'cl-tooltip-popup',
      stylex.props(caller.popup).className ?? '',
    );
  });

  it('forwards the ref to the popup element', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(
      <Tooltip.Root defaultOpen>
        <Tooltip.Trigger>Hover me</Tooltip.Trigger>
        <Tooltip.Popup ref={ref}>Helpful label</Tooltip.Popup>
      </Tooltip.Root>,
    );

    expect(ref.current).toBe(document.querySelector('.cl-tooltip-popup'));
  });
});
