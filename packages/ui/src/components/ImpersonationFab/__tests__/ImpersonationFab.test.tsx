import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { fireEvent, render } from '@/test/utils';

import { ImpersonationFab } from '../';

const { createFixtures } = bindCreateFixtures('UserButton');

describe('ImpersonationFab', () => {
  const topProperty = '--cl-impersonation-fab-top';
  const rightProperty = '--cl-impersonation-fab-right';
  const cssVar = (name: string) => document.documentElement.style.getPropertyValue(name);

  afterEach(() => {
    pointer(window, 'pointercancel', {});
    document.documentElement.style.removeProperty(topProperty);
    document.documentElement.style.removeProperty(rightProperty);
    vi.restoreAllMocks();
  });

  const pointer = (
    target: EventTarget,
    type: string,
    init: MouseEventInit & { movementX?: number; movementY?: number },
  ) => {
    const event = new MouseEvent(type, { bubbles: true, cancelable: true, ...init });
    Object.defineProperties(event, {
      pointerId: { value: 1 },
      movementX: { value: init.movementX ?? 0 },
      movementY: { value: init.movementY ?? 0 },
    });
    fireEvent(target, event);
  };

  const renderDraggableFab = async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withUser({ email_addresses: ['test@clerk.com'], actor: { sub: 'user_impersonated' } });
    });
    const result = render(<ImpersonationFab />, { wrapper });
    const fab = document.getElementById('cl-impersonationEye')?.parentElement;
    if (!fab) {
      throw new Error('Impersonation button was not rendered');
    }

    const top = () => parseFloat(cssVar(topProperty)) || 109;
    const right = () => parseFloat(cssVar(rightProperty)) || 23;
    let width = 200;
    Object.defineProperties(fab, {
      offsetTop: { get: top },
      offsetLeft: { get: () => window.innerWidth - right() - width },
      offsetWidth: { get: () => width },
      offsetHeight: { get: () => 64 },
      setPointerCapture: { value: vi.fn() },
      hasPointerCapture: { value: () => false },
    });
    vi.spyOn(fab, 'getBoundingClientRect').mockImplementation(() =>
      DOMRect.fromRect({ x: window.innerWidth - right() - width, y: top(), width, height: 64 }),
    );
    return { ...result, fixtures, fab, setWidth: (value: number) => (width = value) };
  };

  it('follows the pointer position rather than movement values, across hover width changes', async () => {
    const { fab, setWidth } = await renderDraggableFab();
    pointer(fab, 'pointerdown', { clientX: 900, clientY: 130 });
    pointer(window, 'pointermove', { clientX: 880, clientY: 160, movementX: -40, movementY: 60 });
    expect(cssVar(rightProperty)).toBe('43px');
    expect(cssVar(topProperty)).toBe('139px');

    setWidth(64);
    pointer(window, 'pointermove', { clientX: 870, clientY: 165, movementX: -20, movementY: 10 });
    expect(cssVar(rightProperty)).toBe('53px');
    expect(cssVar(topProperty)).toBe('144px');
  });

  it('keeps the sign-out action clickable', async () => {
    const { fixtures, getByText, userEvent } = await renderDraggableFab();
    await userEvent.click(getByText('Sign out'));
    expect(fixtures.clerk.signOut).toHaveBeenCalledExactlyOnceWith({ redirectUrl: '/' });
  });

  it('settles inside the viewport inset when released off-screen', async () => {
    const { fab } = await renderDraggableFab();
    pointer(fab, 'pointerdown', { clientX: 900, clientY: 130 });
    pointer(window, 'pointermove', { clientX: 1200, clientY: -100 });
    pointer(window, 'pointerup', {});
    expect(cssVar(rightProperty)).toBe('20px');
    expect(cssVar(topProperty)).toBe('20px');
  });

  it('keeps the position when released inside the viewport inset', async () => {
    const { fab } = await renderDraggableFab();
    pointer(fab, 'pointerdown', { clientX: 900, clientY: 130 });
    pointer(window, 'pointermove', { clientX: 880, clientY: 160 });
    pointer(window, 'pointerup', {});
    expect(cssVar(rightProperty)).toBe('43px');
    expect(cssVar(topProperty)).toBe('139px');
  });

  it('resets an out-of-viewport position on resize', async () => {
    await renderDraggableFab();
    document.documentElement.style.setProperty(topProperty, '1000px');
    fireEvent(window, new Event('resize'));
    expect(cssVar(topProperty)).toBe('109px');
  });

  it('does not render when user has no actor', async () => {
    const { wrapper } = await createFixtures(f => {
      f.withUser({ email_addresses: ['test@clerk.com'] });
    });
    render(<ImpersonationFab />, { wrapper });
    expect(document.getElementById('cl-impersonationEye')).toBeNull();
  });

  it('renders when user has actor without type (impersonation)', async () => {
    const { wrapper } = await createFixtures(f => {
      f.withUser({
        email_addresses: ['test@clerk.com'],
        actor: { sub: 'user_impersonated' },
      });
    });
    render(<ImpersonationFab />, { wrapper });
    expect(document.getElementById('cl-impersonationEye')).toBeInTheDocument();
  });

  it('does not render when user has actor with type "agent"', async () => {
    const { wrapper } = await createFixtures(f => {
      f.withUser({
        email_addresses: ['test@clerk.com'],
        actor: { sub: 'user_agent', type: 'agent' },
      });
    });
    render(<ImpersonationFab />, { wrapper });
    expect(document.getElementById('cl-impersonationEye')).toBeNull();
  });
});
