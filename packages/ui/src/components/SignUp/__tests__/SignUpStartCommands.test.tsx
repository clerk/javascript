import { ClerkAPIResponseError } from '@clerk/shared/error';
import type { SignUpResource } from '@clerk/shared/types';
import { describe, expect, it } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { act, renderHook } from '@/test/utils';

import { useSignUpStartModel } from '../sign-up-start.model';

const { createFixtures } = bindCreateFixtures('SignUp');

const completedSignUp = (session: string) => ({ status: 'complete', createdSessionId: session }) as SignUpResource;

describe('Sign-up start commands', () => {
  it('returns ticket display data and completes using the returned sign-up', async () => {
    const { wrapper, fixtures } = await createFixtures();
    fixtures.signUp.create.mockResolvedValue({
      ...completedSignUp('sess_ticket_result'),
      emailAddress: 'invited@clerk.com',
    });
    const { result } = renderHook(() => useSignUpStartModel(), { wrapper });

    await act(async () => {
      const ticket = await result.current.createTicket('ticket');
      expect(ticket).toBeDefined();
      if (!ticket) {
        throw new Error('Ticket not created');
      }
      expect(ticket.emailAddress).toBe('invited@clerk.com');
      expect(ticket.hasMissingRequirements).toBe(false);
      expect(ticket).not.toHaveProperty('createdSessionId');
      expect(ticket).not.toHaveProperty('prepareEmailAddressVerification');
      expect(fixtures.clerk.setActive).not.toHaveBeenCalled();
      await ticket.complete();
    });
    expect(fixtures.clerk.setActive).toHaveBeenCalledWith(expect.objectContaining({ session: 'sess_ticket_result' }));
  });

  it('chooses the configured phone channel and attaches metadata before creation', async () => {
    const { wrapper, fixtures, props } = await createFixtures();
    props.setProps({ unsafeMetadata: { source: 'test' } });
    fixtures.environment.authConfig.preferredChannels = { US: 'whatsapp' };
    fixtures.signUp.create.mockResolvedValue(completedSignUp('sess_phone_result'));
    const { result } = renderHook(() => useSignUpStartModel(), { wrapper });

    await act(async () => {
      expect(await result.current.submit({ phoneNumber: '+14155552671' }, { useTicket: false })).toBeUndefined();
    });
    expect(fixtures.signUp.create).toHaveBeenCalledWith({
      phoneNumber: '+14155552671',
      strategy: 'phone_code',
      channel: 'whatsapp',
      unsafeMetadata: { source: 'test' },
    });
    expect(fixtures.signUp.upsert).not.toHaveBeenCalled();
    expect(fixtures.clerk.setActive).toHaveBeenCalledWith(expect.objectContaining({ session: 'sess_phone_result' }));
  });

  it('keeps ticket strategy when a preferred phone channel is configured', async () => {
    const { wrapper, fixtures } = await createFixtures();
    fixtures.environment.authConfig.preferredChannels = { US: 'whatsapp' };
    fixtures.signUp.upsert.mockResolvedValue(completedSignUp('sess_upsert_result'));
    const { result } = renderHook(() => useSignUpStartModel(), { wrapper });

    await act(async () => {
      await result.current.submit({ phoneNumber: '+14155552671', ticket: 'ticket' }, { useTicket: true });
    });
    expect(fixtures.signUp.upsert).toHaveBeenCalledWith({
      phoneNumber: '+14155552671',
      ticket: 'ticket',
      strategy: 'ticket',
    });
    expect(fixtures.signUp.create).not.toHaveBeenCalled();
  });

  it('routes to connection selection when sign-up needs an enterprise connection', async () => {
    const { wrapper, fixtures } = await createFixtures();
    fixtures.signUp.create.mockRejectedValue(
      new ClerkAPIResponseError('Choose connection', {
        status: 422,
        data: [
          { code: 'enterprise_connection_id_is_required_with_multiple_connections', message: 'Choose connection' },
        ],
      }),
    );
    const { result } = renderHook(() => useSignUpStartModel(), { wrapper });

    await act(async () => {
      await result.current.submit({ emailAddress: 'test@clerk.com' }, { useTicket: false });
    });
    expect(fixtures.router.navigate).toHaveBeenCalledWith('./enterprise-connections');
    expect(fixtures.clerk.setActive).not.toHaveBeenCalled();
  });
});
