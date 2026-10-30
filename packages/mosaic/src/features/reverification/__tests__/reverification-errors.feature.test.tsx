import { reverificationError } from '@clerk/shared/authorization-errors';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, expect, it, vi } from 'vitest';

import { fapiUrl, serveFapi, worker } from '../../../__tests__/feature/fake-fapi';
import { fapiClient, fapiEnvironment, fapiSession, fapiUser } from '../../../__tests__/feature/fapi';
import { renderWithClerk } from '../../../__tests__/feature/render';
import { MosaicProvider } from '../../../mosaic-provider';
import { Host } from './reverification-test-host';

const factors = [
  {
    strategy: 'password',
    label: 'Password',
    paramName: 'password',
    level: 'first_factor',
    endpoint: 'attempt_first_factor',
  },
  {
    strategy: 'backup_code',
    label: 'Backup code',
    paramName: 'code',
    level: 'second_factor',
    endpoint: 'attempt_second_factor',
  },
] as const;

for (const factor of factors) {
  describe(`${factor.strategy} error routing`, () => {
    for (const kind of ['matching', 'unrelated', 'global', 'mixed'] as const) {
      it(`renders ${kind} errors in their proper places and clears them on edit`, async () => {
        serveFapi({
          client: fapiClient([fapiSession({ id: 'sess_1', user: fapiUser({ id: 'user_1' }) })]),
          verification: {
            firstFactors: [{ strategy: 'password' }],
            secondFactors: [{ strategy: 'backup_code' }],
            secrets: { password: 'correct', backup_code: 'correct' },
          },
        });
        const action = vi
          .fn()
          .mockResolvedValueOnce(reverificationError({ level: factor.level, afterMinutes: 10 }))
          .mockResolvedValue({ done: true });
        await renderWithClerk(
          <MosaicProvider
            localization={{ messages: { 'errors.form_param_nil__password': 'Localized password required.' } }}
          >
            <Host action={action} />
          </MosaicProvider>,
        );
        const fieldMessages =
          factor.strategy === 'password'
            ? 'Localized password required. Another field error.'
            : 'Field error. Another field error.';
        const fieldErrors = [
          {
            code: factor.strategy === 'password' ? 'form_param_nil' : 'custom_field',
            message: 'Field error.',
            meta: { param_name: factor.paramName },
          },
          { code: 'custom_field', message: 'Another field error.', meta: { param_name: factor.paramName } },
        ];
        const globalErrors = [
          { code: 'custom_global', message: 'Global error.' },
          { code: 'custom_other', message: 'Unrelated error.', meta: { param_name: 'session_id' } },
        ];
        const errors =
          kind === 'matching'
            ? fieldErrors
            : kind === 'unrelated'
              ? globalErrors.slice(1)
              : kind === 'global'
                ? globalErrors.slice(0, 1)
                : [globalErrors[0], ...fieldErrors, globalErrors[1]];
        worker.use(
          http.post(
            fapiUrl(`/v1/client/sessions/sess_1/verify/${factor.endpoint}`),
            () => HttpResponse.json({ errors }, { status: 422 }),
            { once: true },
          ),
        );
        const user = userEvent.setup();
        await user.click(screen.getByRole('button', { name: 'Run action' }));
        const field = await screen.findByLabelText(factor.label);
        await user.type(field, 'wrong{Enter}');
        const hasField = kind === 'matching' || kind === 'mixed';
        if (hasField) {
          expect(await screen.findByText(fieldMessages)).toBeVisible();
          expect(field).toHaveAttribute('aria-invalid', 'true');
          expect(field).toHaveAccessibleDescription(fieldMessages);
        }
        if (kind !== 'matching') {
          const globalMessage =
            kind === 'mixed'
              ? 'Global error. Unrelated error.'
              : kind === 'global'
                ? 'Global error.'
                : 'Unrelated error.';
          await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent(globalMessage));
          if (!hasField) {
            expect(field).not.toHaveAttribute('aria-invalid', 'true');
          }
        }
        await user.clear(field);
        await user.type(field, 'correct');
        await waitFor(() => expect(screen.queryByText(fieldMessages)).toBeNull());
        await waitFor(() => expect(screen.getByRole('alert')).not.toHaveTextContent(/Global error|Unrelated error/));
        expect(field).not.toHaveAttribute('aria-invalid', 'true');
        await user.type(field, '{Enter}');
        await waitFor(() => expect(screen.getByLabelText('Outcome')).toHaveTextContent('resolved'));
        expect(action).toHaveBeenCalledTimes(2);
      });
    }
  });
}

it('clears mixed errors when switching factors and does not restore them on return', async () => {
  serveFapi({
    client: fapiClient([fapiSession({ id: 'sess_1', user: fapiUser({ id: 'user_1' }) })]),
    environment: fapiEnvironment({ display_config: { preferred_sign_in_strategy: 'password' } }),
    verification: {
      firstFactors: [
        { strategy: 'password' },
        { strategy: 'email_code', email_address_id: 'idn_email', safe_identifier: 'alice@example.com' },
      ],
      secrets: { password: 'correct', email_code: '123456' },
    },
  });
  const action = vi.fn().mockResolvedValueOnce(reverificationError()).mockResolvedValue({ done: true });
  await renderWithClerk(<Host action={action} />);
  worker.use(
    http.post(
      fapiUrl('/v1/client/sessions/sess_1/verify/attempt_first_factor'),
      () =>
        HttpResponse.json(
          {
            errors: [
              { code: 'custom_field', message: 'Field error.', meta: { param_name: 'password' } },
              { code: 'custom_global', message: 'Global error.' },
            ],
          },
          { status: 422 },
        ),
      { once: true },
    ),
  );
  const user = userEvent.setup();
  await user.click(screen.getByRole('button', { name: 'Run action' }));
  await user.type(await screen.findByLabelText('Password'), 'wrong{Enter}');
  expect(await screen.findByText('Field error.')).toBeVisible();
  expect(screen.getByRole('alert')).toHaveTextContent('Global error.');
  await user.click(screen.getByRole('button', { name: 'Use another method' }));
  await user.click(await screen.findByRole('button', { name: /Email code to/ }));
  expect(await screen.findByRole('group', { name: 'Verification code' })).toBeVisible();
  await waitFor(() => expect(screen.queryByText('Field error.')).toBeNull());
  await waitFor(() => expect(screen.queryByText('Global error.')).toBeNull());
  await user.click(screen.getByRole('button', { name: 'Use another method' }));
  await user.click(await screen.findByRole('button', { name: 'Continue with your password' }));
  const field = await screen.findByLabelText('Password');
  expect(field).toHaveValue('');
  expect(field).not.toHaveAttribute('aria-invalid', 'true');
  expect(screen.queryByText('Field error.')).toBeNull();
  expect(screen.queryByText('Global error.')).toBeNull();
});
