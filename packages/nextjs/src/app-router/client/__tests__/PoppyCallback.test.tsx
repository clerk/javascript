import { useSignIn } from '@clerk/react/legacy';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import React, { StrictMode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { PoppyCallback } from '../PoppyCallback';

vi.mock('@clerk/react/legacy', () => ({ useSignIn: vi.fn() }));

const create = vi.fn();
const setActive = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  create.mockResolvedValue({ status: 'complete', createdSessionId: 'sess_agent' });
  setActive.mockResolvedValue(undefined);
  vi.mocked(useSignIn, { partial: true, deep: true }).mockReturnValue({
    isLoaded: true,
    signIn: { create },
    setActive,
  });
});

afterEach(cleanup);

describe('PoppyCallback', () => {
  it('redeems the ticket once through normal sign-in and activates its Session', async () => {
    render(
      <StrictMode>
        <PoppyCallback
          ticket='one-use-ticket'
          redirectTo='https://company.example/cart'
        />
      </StrictMode>,
    );
    await waitFor(() =>
      expect(setActive).toHaveBeenCalledWith({ session: 'sess_agent', redirectUrl: 'https://company.example/cart' }),
    );
    expect(create).toHaveBeenCalledExactlyOnceWith({ strategy: 'ticket', ticket: 'one-use-ticket' });
    expect(setActive).toHaveBeenCalledTimes(1);
    expect(document.location.href).not.toContain('one-use-ticket');
  });

  it.each([
    { status: 'needs_second_factor', createdSessionId: null },
    { status: 'complete', createdSessionId: null },
  ])('does not activate incomplete sign-in $status', async result => {
    create.mockResolvedValue(result);
    render(
      <PoppyCallback
        ticket='one-use-ticket'
        redirectTo='/'
      />,
    );
    await screen.findByText('Start the browser connection again.');
    expect(setActive).not.toHaveBeenCalled();
  });

  it('shows a restart action when ticket redemption fails', async () => {
    create.mockRejectedValue(new Error('Ticket expired'));
    render(
      <PoppyCallback
        ticket='expired-ticket'
        redirectTo='/'
      />,
    );
    await screen.findByText('Start the browser connection again.');
    expect(setActive).not.toHaveBeenCalled();
  });
});
