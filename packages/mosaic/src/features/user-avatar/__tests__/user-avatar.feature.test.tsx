import { screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { holdRequests, serveFapi } from '../../../__tests__/feature/fake-fapi';
import { fapiClient, fapiEmailAddress, fapiSession, fapiUser } from '../../../__tests__/feature/fapi';
import { renderWithClerk } from '../../../__tests__/feature/render';
import type { UserAvatarProps } from '../user-avatar';
import { UserAvatar } from '../user-avatar';

const PIXEL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

const email = fapiEmailAddress({ id: 'idn_alice', email_address: 'alice@example.com' });

const alice = fapiUser({ id: 'user_1', first_name: 'Alice', last_name: 'Smith', email_addresses: [email] });

function signedInAs(user = alice) {
  return { client: fapiClient([fapiSession({ id: 'sess_1', user })]) };
}

function tree(props: UserAvatarProps = {}) {
  return (
    <div data-testid='host'>
      <UserAvatar {...props} />
    </div>
  );
}

const host = () => screen.getByTestId('host');

describe('UserAvatar', () => {
  it('renders its fallback while Clerk is still loading', async () => {
    serveFapi(signedInAs());
    const client = holdRequests('get', '/v1/client');
    const rendering = renderWithClerk(tree({ fallback: <output data-testid='fallback'>Loading</output> }));

    await waitFor(() => expect(client.requests).toHaveLength(1));
    expect(screen.getByTestId('fallback')).toBeInTheDocument();

    client.release();
    await rendering;
    expect(screen.queryByTestId('fallback')).toBeNull();
    expect(screen.getByRole('img', { name: 'Alice Smith' })).toBeInTheDocument();
  });

  it('renders nothing, not even its fallback, when nobody is signed in', async () => {
    serveFapi({ client: fapiClient() });
    await renderWithClerk(tree({ fallback: <output>Loading</output> }));

    expect(host()).toBeEmptyDOMElement();
  });

  it('holds the initials in the placeholder for a user with no profile image', async () => {
    serveFapi(signedInAs());
    await renderWithClerk(tree());

    const avatar = screen.getByRole('img', { name: 'Alice Smith' });
    expect(avatar).toHaveTextContent('AS');
    expect(avatar.querySelector('img')).toBeNull();
  });

  it('shows the profile image once it loads', async () => {
    serveFapi(signedInAs(fapiUser({ ...alice, image_url: PIXEL, has_image: true })));
    await renderWithClerk(tree());

    const avatar = screen.getByRole('img', { name: 'Alice Smith' });
    await waitFor(() => expect(avatar.querySelector('img')).toHaveAttribute('src', PIXEL));
    expect(avatar).not.toHaveTextContent('AS');
  });

  it('is named by the identifier, and holds its first letter, for a user with no name', async () => {
    serveFapi(signedInAs(fapiUser({ id: 'user_2', email_addresses: [email] })));
    await renderWithClerk(tree());

    expect(screen.getByRole('img', { name: 'alice@example.com' })).toHaveTextContent('A');
  });

  it('takes the shape and size it is given', async () => {
    serveFapi(signedInAs());
    await renderWithClerk(tree({ shape: 'square', size: 'lg' }));

    const avatar = screen.getByRole('img', { name: 'Alice Smith' });
    expect(avatar).toHaveClass('cl-user-avatar', 'cl-avatar');
    expect(avatar).toHaveAttribute('data-shape', 'square');
    expect(avatar).toHaveAttribute('data-size', 'lg');
  });
});
