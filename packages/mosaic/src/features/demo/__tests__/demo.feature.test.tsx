import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { holdRequests, serveFapi } from '../../../__tests__/feature/fake-fapi';
import { fapiClient, fapiSession, fapiUser } from '../../../__tests__/feature/fapi';
import { renderWithClerk } from '../../../__tests__/feature/render';
import { Demo } from '../demo';

function serveDemo() {
  return serveFapi({ client: fapiClient([fapiSession({ id: 'sess_demo', user: fapiUser({ id: 'user_demo' }) })]) });
}

async function changeName(name: string) {
  const user = userEvent.setup();
  const input = await screen.findByRole('textbox', { name: 'Instance name' });
  await user.clear(input);
  await user.type(input, name);
  await user.click(screen.getByRole('button', { name: 'Save' }));
}

describe('Mosaic demo', () => {
  it('loads and saves instance data without the legacy UI runtime', async () => {
    serveDemo();
    await renderWithClerk(<Demo />);
    expect(await screen.findByText('Current name: Demo')).toBeInTheDocument();

    await changeName('Updated');
    expect(await screen.findByText('Current name: Updated')).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByRole('textbox', { name: 'Instance name' })).not.toHaveAttribute('aria-disabled', 'true'),
    );
  });

  it('keeps the form pending until the write and refresh finish', async () => {
    serveDemo();
    await renderWithClerk(<Demo />);
    await screen.findByRole('textbox', { name: 'Instance name' });
    const write = holdRequests('post', '/v1/demo');
    await changeName('Updated');
    await waitFor(() => expect(write.requests).toHaveLength(1));
    const refresh = holdRequests('get', '/v1/demo');
    write.release();
    await waitFor(() => expect(refresh.requests).toHaveLength(1));
    expect(screen.getByRole('textbox', { name: 'Instance name' })).toHaveAttribute('aria-disabled', 'true');
    refresh.release();
    await waitFor(() =>
      expect(screen.getByRole('textbox', { name: 'Instance name' })).not.toHaveAttribute('aria-disabled', 'true'),
    );
    expect(screen.getByText('Current name: Updated')).toBeInTheDocument();
  });

  it('routes API validation errors to the name field and preserves the draft', async () => {
    serveDemo();
    await renderWithClerk(<Demo />);
    await screen.findByRole('textbox', { name: 'Instance name' });
    const write = holdRequests('post', '/v1/demo');
    await changeName('Rejected');
    await waitFor(() => expect(write.requests).toHaveLength(1));
    write.fail('form_param_invalid', 'Use another name.', 'name');
    await waitFor(() =>
      expect(screen.getByRole('textbox', { name: 'Instance name' })).toHaveAccessibleDescription('Use another name.'),
    );
    expect(screen.getByRole('textbox', { name: 'Instance name' })).toHaveValue('Rejected');
    expect(screen.getByText('Current name: Demo')).toBeInTheDocument();
  });

  it('hides the form on sign-out while a write is in flight', async () => {
    serveDemo();
    const { clerk } = await renderWithClerk(<Demo />);
    await screen.findByRole('textbox', { name: 'Instance name' });
    const write = holdRequests('post', '/v1/demo');
    await changeName('Updated');
    await waitFor(() => expect(write.requests).toHaveLength(1));
    await act(() => clerk.signOut());
    write.release();
    await waitFor(() => expect(screen.queryByRole('textbox', { name: 'Instance name' })).toBeNull());
  });
});
