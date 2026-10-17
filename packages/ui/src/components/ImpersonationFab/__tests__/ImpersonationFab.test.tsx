import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { fireEvent, render } from '@/test/utils';

import { ImpersonationFab } from '../';

const { createFixtures } = bindCreateFixtures('UserButton');

describe('ImpersonationFab', () => {
  afterEach(() => {
    fireEvent(window, new Event('blur'));
    document.documentElement.style.removeProperty('--cl-impersonation-fab-top');
    document.documentElement.style.removeProperty('--cl-impersonation-fab-right');
    vi.restoreAllMocks();
  });

  const pointer = (
    target: EventTarget,
    type: string,
    init: MouseEventInit & { movementX?: number; movementY?: number; pointerId?: number },
  ) => {
    const event = new MouseEvent(type, { bubbles: true, cancelable: true, ...init });
    Object.defineProperties(event, {
      pointerId: { value: init.pointerId ?? 1 },
      movementX: { value: init.movementX ?? 0 },
      movementY: { value: init.movementY ?? 0 },
    });
    fireEvent(target, event);
    return event;
  };

  const renderDraggableFab = async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withUser({ email_addresses: ['test@clerk.com'], actor: { sub: 'user_impersonated' } });
    });
    const result = render(<ImpersonationFab />, { wrapper });
    const fab = document.getElementById('cl-impersonationEye')!.parentElement!;
    const top = () => parseFloat(document.documentElement.style.getPropertyValue('--cl-impersonation-fab-top')) || 109;
    const right = () =>
      parseFloat(document.documentElement.style.getPropertyValue('--cl-impersonation-fab-right')) || 23;
    let width = 200;
    Object.defineProperties(fab, {
      offsetTop: { get: top },
      offsetLeft: { get: () => window.innerWidth - right() - width },
      offsetWidth: { get: () => width },
      offsetHeight: { get: () => 64 },
    });
    vi.spyOn(fab, 'getBoundingClientRect').mockImplementation(() =>
      DOMRect.fromRect({ x: window.innerWidth - right() - width, y: top(), width, height: 64 }),
    );
    return { ...result, fixtures, fab, setWidth: (value: number) => (width = value) };
  };

  it('follows viewport pointer coordinates regardless of movement units or hover width changes', async () => {
    const { fab, setWidth } = await renderDraggableFab();
    pointer(fab, 'pointerdown', { clientX: 900, clientY: 130 });
    pointer(window, 'pointermove', { clientX: 880, clientY: 160, movementX: -40, movementY: 60 });
    expect(document.documentElement.style.getPropertyValue('--cl-impersonation-fab-right')).toBe('43px');
    expect(document.documentElement.style.getPropertyValue('--cl-impersonation-fab-top')).toBe('139px');

    setWidth(64);
    pointer(window, 'pointermove', { clientX: 870, clientY: 165, movementX: -20, movementY: 10 });
    expect(document.documentElement.style.getPropertyValue('--cl-impersonation-fab-right')).toBe('53px');
    expect(document.documentElement.style.getPropertyValue('--cl-impersonation-fab-top')).toBe('144px');
    pointer(window, 'pointerup', { clientX: 870, clientY: 165 });
    expect(document.documentElement.style.getPropertyValue('--cl-impersonation-fab-right')).toBe('53px');
  });

  it('prevents text selection when starting a drag', async () => {
    const { fab } = await renderDraggableFab();
    expect(pointer(fab, 'pointerdown', { clientX: 900, clientY: 130 }).defaultPrevented).toBe(true);
  });

  it('supports repeated drags with fractional coordinates and without movement values', async () => {
    const { fab } = await renderDraggableFab();
    pointer(fab, 'pointerdown', { clientX: 900, clientY: 130 });
    pointer(window, 'pointermove', { clientX: 879.5, clientY: 160.25 });
    pointer(window, 'pointerup', {});
    pointer(fab, 'pointerdown', { clientX: 879.5, clientY: 160.25 });
    pointer(window, 'pointermove', { clientX: 890, clientY: 150 });
    expect(document.documentElement.style.getPropertyValue('--cl-impersonation-fab-right')).toBe('33px');
    expect(document.documentElement.style.getPropertyValue('--cl-impersonation-fab-top')).toBe('129px');
  });

  it('ignores movement and release from another pointer', async () => {
    const { fab } = await renderDraggableFab();
    pointer(fab, 'pointerdown', { clientX: 900, clientY: 130 });
    pointer(window, 'pointermove', { clientX: 500, clientY: 500, pointerId: 2 });
    pointer(window, 'pointerup', { pointerId: 2 });
    expect(document.documentElement.style.getPropertyValue('--cl-impersonation-fab-top')).toBe('');
    pointer(window, 'pointermove', { clientX: 880, clientY: 160 });
    expect(document.documentElement.style.getPropertyValue('--cl-impersonation-fab-top')).toBe('139px');
  });

  it.each(['pointerup', 'pointercancel', 'blur'])('ends dragging on %s', async type => {
    const { fab } = await renderDraggableFab();
    pointer(fab, 'pointerdown', { clientX: 900, clientY: 130 });
    pointer(window, 'pointermove', { clientX: 880, clientY: 160 });
    pointer(window, type, {});
    pointer(window, 'pointermove', { clientX: 800, clientY: 200 });
    expect(document.documentElement.style.getPropertyValue('--cl-impersonation-fab-right')).toBe('43px');
    expect(document.documentElement.style.getPropertyValue('--cl-impersonation-fab-top')).toBe('139px');
  });

  it('removes drag listeners when unmounted', async () => {
    const { fab, unmount } = await renderDraggableFab();
    pointer(fab, 'pointerdown', { clientX: 900, clientY: 130 });
    unmount();
    pointer(window, 'pointermove', { clientX: 880, clientY: 160 });
    expect(document.documentElement.style.getPropertyValue('--cl-impersonation-fab-top')).toBe('');
  });

  it('ignores secondary clicks and preserves the sign-out action', async () => {
    const { fab, fixtures, getByText, userEvent } = await renderDraggableFab();
    expect(pointer(fab, 'pointerdown', { button: 2 }).defaultPrevented).toBe(false);
    const signOut = getByText('Sign out');
    expect(pointer(signOut, 'pointerdown', { clientX: 900, clientY: 130 }).defaultPrevented).toBe(false);
    pointer(window, 'pointermove', { clientX: 880, clientY: 160 });
    expect(document.documentElement.style.getPropertyValue('--cl-impersonation-fab-top')).toBe('');
    await userEvent.click(signOut);
    expect(fixtures.clerk.signOut).toHaveBeenCalled();
  });

  it('resets an out-of-viewport position on release and resize', async () => {
    const { fab } = await renderDraggableFab();
    pointer(fab, 'pointerdown', { clientX: 900, clientY: 130 });
    pointer(window, 'pointermove', { clientX: 1200, clientY: 130 });
    pointer(window, 'pointerup', {});
    expect(document.documentElement.style.getPropertyValue('--cl-impersonation-fab-right')).toBe('23px');
    document.documentElement.style.setProperty('--cl-impersonation-fab-top', '1000px');
    fireEvent(window, new Event('resize'));
    expect(document.documentElement.style.getPropertyValue('--cl-impersonation-fab-top')).toBe('109px');
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
