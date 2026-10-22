import { Clerk } from '@clerk/clerk-js';
import { LoomProvider } from '@clerk/loom/react';
import { ClerkContextProvider } from '@clerk/shared/react';
import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { Suspense } from 'react';
import { describe, expect, it } from 'vitest';

import { fapiUrl, holdRequests, publishableKey, serveFapi, worker } from '../../../__tests__/feature/fake-fapi';
import { fapiClient, fapiEmailAddress, fapiEnvironment, fapiSession, fapiUser } from '../../../__tests__/feature/fapi';
import { openMenu } from '../../../__tests__/feature/menu';
import { MosaicProvider } from '../../../mosaic-provider';
import { LoomComposedProfile } from '../loom-composed-profile';
import { LoomProfileDetails } from '../loom-profile-details';
import { profileSettings } from './profile-fixture';

const alice = fapiUser({
  id: 'user_1',
  first_name: 'Alice',
  last_name: 'Smith',
  username: 'alice',
  email_addresses: [fapiEmailAddress({ id: 'idn_1' })],
});

function details(clerk: Clerk, hydration?: Parameters<typeof LoomProvider>[0]['hydration']) {
  return (
    <ClerkContextProvider
      clerk={clerk}
      clerkStatus={clerk.status}
    >
      <MosaicProvider>
        <LoomProvider
          clerk={clerk}
          hydration={hydration}
        >
          <Suspense fallback={<p role='status'>Loading profile details</p>}>
            <LoomProfileDetails />
          </Suspense>
        </LoomProvider>
      </MosaicProvider>
    </ClerkContextProvider>
  );
}

describe('Loom profile details', () => {
  it('reconciles a ClerkJS avatar upload and removal into the Loom display', async () => {
    const fapi = serveFapi({ client: fapiClient([fapiSession({ id: 'sess_1', user: alice })]) });
    const clerk = new Clerk(publishableKey());
    await clerk.load({ routerPush: () => Promise.resolve(), routerReplace: () => Promise.resolve() });
    const view = render(details(clerk));
    const actor = userEvent.setup();
    await screen.findByText('Alice Smith');
    const input = view.container.querySelector('input[type="file"]');
    if (!(input instanceof HTMLInputElement)) {
      throw new Error('Missing image input');
    }
    expect(screen.queryByRole('button', { name: 'Manage profile picture' })).not.toBeInTheDocument();
    await actor.upload(input, new File(['avatar'], 'avatar.png', { type: 'image/png' }));
    await openMenu(actor, await screen.findByRole('button', { name: 'Manage profile picture' }));
    expect(fapi.client.sessions[0]?.user.has_image).toBe(true);
    await actor.click(screen.getByRole('menuitem', { name: 'Remove avatar' }));
    await waitFor(() =>
      expect(screen.queryByRole('button', { name: 'Manage profile picture' })).not.toBeInTheDocument(),
    );
    expect(screen.getByRole('button', { name: 'Upload' })).toBeEnabled();
    expect(fapi.client.sessions[0]?.user.has_image).toBe(false);
    view.unmount();
  });

  it('shows disabled picture and email actions from hydration before Clerk loads', async () => {
    serveFapi({});
    const clerk = new Clerk(publishableKey());
    const view = render(
      <ClerkContextProvider
        clerk={clerk}
        clerkStatus={clerk.status}
      >
        <MosaicProvider>
          <LoomProvider
            clerk={clerk}
            hydration={{
              version: 5,
              profileSettings: { data: profileSettings, updatedAt: Date.now() },
              scope: { instanceKey: 'server', userId: 'user_1', sessionId: 'sess_1' },
              user: {
                data: {
                  id: 'user_1',
                  firstName: 'Alice',
                  lastName: 'Smith',
                  username: 'alice',
                  imageUrl: 'https://img.example/alice',
                  hasImage: true,
                  primaryEmailAddressId: 'idn_1',
                  passwordEnabled: false,
                  deleteSelfEnabled: true,
                  externalAccounts: [],
                  enterpriseAccounts: [],
                  emailAddresses: [
                    {
                      id: 'idn_2',
                      emailAddress: 'other@example.com',
                      verification: { status: null, strategy: null, expireAt: null, error: null },
                    },
                    {
                      id: 'idn_1',
                      emailAddress: 'alice@example.com',
                      verification: { status: 'verified', strategy: null, expireAt: null, error: null },
                    },
                  ],
                },
                updatedAt: Date.now(),
              },
            }}
          >
            <LoomComposedProfile />
          </LoomProvider>
        </MosaicProvider>
      </ClerkContextProvider>,
    );
    expect(screen.getByText('Profile picture')).toBeInTheDocument();
    const email = screen.getByRole('group', { name: 'Email' });
    expect(within(email).getByText('alice@example.com')).toBeInTheDocument();
    expect(within(email).getByText('other@example.com')).toBeInTheDocument();
    expect(within(email).getByText('Primary')).toBeInTheDocument();
    expect(within(email).getByText('Unverified')).toBeInTheDocument();
    expect(within(email).getByRole('button', { name: 'Add email' })).toBeDisabled();
    expect(within(email).getByRole('button', { name: 'Manage other@example.com' })).toBeDisabled();
    expect(within(email).getByRole('button', { name: 'Manage alice@example.com' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Manage profile picture' })).toBeDisabled();
    const actor = userEvent.setup();
    await actor.click(within(email).getByRole('button', { name: 'Manage other@example.com' }));
    await actor.keyboard('{Tab}{Enter}');
    expect(screen.queryByRole('menuitem')).not.toBeInTheDocument();
    view.unmount();
  });

  it('keeps prefetched email policy when host policy hides email addresses', async () => {
    serveFapi({
      environment: fapiEnvironment({
        attributes: { email_address: { enabled: false, used_for_first_factor: false, first_factors: [] } },
      }),
      client: fapiClient([fapiSession({ id: 'sess_1', user: alice })]),
    });
    const clerk = new Clerk(publishableKey());
    const hydration = {
      version: 5 as const,
      profileSettings: { data: profileSettings, updatedAt: Date.now() },
      scope: {
        instanceKey: JSON.stringify([clerk.publishableKey, clerk.frontendApi, clerk.proxyUrl ?? '', clerk.domain]),
        userId: 'user_1',
        sessionId: 'sess_1',
      },
      user: {
        data: {
          id: 'user_1',
          firstName: 'Alice',
          lastName: 'Smith',
          username: 'alice',
          imageUrl: 'https://img.example/alice',
          hasImage: false,
          primaryEmailAddressId: 'idn_1',
          passwordEnabled: false,
          deleteSelfEnabled: true,
          externalAccounts: [],
          enterpriseAccounts: [],
          emailAddresses: [
            {
              id: 'idn_1',
              emailAddress: 'alice@example.com',
              verification: { status: 'verified', strategy: null, expireAt: null, error: null },
            },
          ],
        },
        updatedAt: Date.now(),
      },
    };
    const view = render(
      <ClerkContextProvider
        clerk={clerk}
        clerkStatus={clerk.status}
      >
        <MosaicProvider>
          <LoomProvider
            clerk={clerk}
            hydration={hydration}
          >
            <LoomComposedProfile />
          </LoomProvider>
        </MosaicProvider>
      </ClerkContextProvider>,
    );
    expect(screen.getByText('alice@example.com')).toBeInTheDocument();
    await act(() => clerk.load({ routerPush: () => Promise.resolve(), routerReplace: () => Promise.resolve() }));
    view.rerender(
      <ClerkContextProvider
        clerk={clerk}
        clerkStatus={clerk.status}
      >
        <MosaicProvider>
          <LoomProvider
            clerk={clerk}
            hydration={hydration}
          >
            <LoomComposedProfile />
          </LoomProvider>
        </MosaicProvider>
      </ClerkContextProvider>,
    );
    expect(screen.getByRole('group', { name: 'Email' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add email' })).toBeDisabled();
    view.unmount();
  });

  it('keeps snapshot email rows while attaching matching host actions', async () => {
    const hostUser = fapiUser({
      id: 'user_1',
      email_addresses: [fapiEmailAddress({ id: 'host_only', email_address: 'host@example.com' })],
    });
    serveFapi({ environment: fapiEnvironment(), client: fapiClient([fapiSession({ id: 'sess_1', user: hostUser })]) });
    const clerk = new Clerk(publishableKey());
    const hydration = {
      version: 5 as const,
      profileSettings: { data: profileSettings, updatedAt: Date.now() },
      scope: {
        instanceKey: JSON.stringify([clerk.publishableKey, clerk.frontendApi, clerk.proxyUrl ?? '', clerk.domain]),
        userId: 'user_1',
        sessionId: 'sess_1',
      },
      user: {
        data: {
          id: 'user_1',
          firstName: 'Alice',
          lastName: null,
          username: null,
          imageUrl: 'https://img.example/alice',
          hasImage: false,
          primaryEmailAddressId: 'idn_1',
          passwordEnabled: false,
          deleteSelfEnabled: true,
          externalAccounts: [],
          enterpriseAccounts: [],
          emailAddresses: [
            {
              id: 'idn_1',
              emailAddress: 'snapshot@example.com',
              verification: { status: 'verified', strategy: null, expireAt: null, error: null },
            },
          ],
        },
        updatedAt: Date.now(),
      },
    };
    const renderProfile = () => (
      <ClerkContextProvider
        clerk={clerk}
        clerkStatus={clerk.status}
      >
        <MosaicProvider>
          <LoomProvider
            clerk={clerk}
            hydration={hydration}
          >
            <LoomComposedProfile />
          </LoomProvider>
        </MosaicProvider>
      </ClerkContextProvider>
    );
    const view = render(renderProfile());
    expect(screen.getByText('snapshot@example.com')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add email' })).toBeDisabled();
    const addButton = screen.getByRole('button', { name: 'Add email' });
    const manageButton = screen.getByRole('button', { name: 'Manage snapshot@example.com' });
    expect(manageButton).toBeDisabled();
    const addBefore = addButton.getBoundingClientRect();
    const manageBefore = manageButton.getBoundingClientRect();
    expect(addBefore.width).toBeGreaterThan(0);
    expect(manageBefore.width).toBeGreaterThan(0);
    await act(() => clerk.load({ routerPush: () => Promise.resolve(), routerReplace: () => Promise.resolve() }));
    view.rerender(renderProfile());
    expect(screen.queryByText('host@example.com')).not.toBeInTheDocument();
    expect(screen.getByText('snapshot@example.com')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Manage snapshot@example.com' })).toBeDisabled();
    const addAfter = screen.getByRole('button', { name: 'Add email' }).getBoundingClientRect();
    const manageAfter = screen.getByRole('button', { name: 'Manage snapshot@example.com' }).getBoundingClientRect();
    expect([addAfter.x, addAfter.y, addAfter.width, addAfter.height]).toEqual([
      addBefore.x,
      addBefore.y,
      addBefore.width,
      addBefore.height,
    ]);
    expect([manageAfter.x, manageAfter.y, manageAfter.width, manageAfter.height]).toEqual([
      manageBefore.x,
      manageBefore.y,
      manageBefore.width,
      manageBefore.height,
    ]);
    view.unmount();
  });
  it('shows configured empty name before host readiness', () => {
    serveFapi({});
    const clerk = new Clerk(publishableKey());
    const view = render(
      details(clerk, {
        version: 5,
        profileSettings: { data: profileSettings, updatedAt: Date.now() },
        scope: { instanceKey: 'server', userId: 'user_1', sessionId: 'sess_1' },
        user: {
          data: {
            id: 'user_1',
            firstName: null,
            lastName: null,
            username: 'alice',
            imageUrl: 'https://img.example/alice',
            hasImage: false,
            primaryEmailAddressId: null,
            passwordEnabled: false,
            deleteSelfEnabled: true,
            externalAccounts: [],
            enterpriseAccounts: [],
            emailAddresses: [],
          },
          updatedAt: Date.now(),
        },
      }),
    );
    const section = screen.getByRole('group', { name: 'Profile' });
    expect(within(section).getByText('alice')).toBeInTheDocument();
    expect(within(section).getByText('Name')).toBeInTheDocument();
    view.unmount();
  });

  it('shows hydrated identity without claiming account policy or actions, then enables the real edit flow', async () => {
    serveFapi({
      environment: fapiEnvironment(),
      client: fapiClient([fapiSession({ id: 'sess_1', user: alice })]),
    });
    const clerk = new Clerk(publishableKey());
    const hydration = {
      version: 5 as const,
      profileSettings: { data: profileSettings, updatedAt: Date.now() },
      scope: {
        instanceKey: JSON.stringify([clerk.publishableKey, clerk.frontendApi, clerk.proxyUrl ?? '', clerk.domain]),
        userId: 'user_1',
        sessionId: 'sess_1',
      },
      user: {
        data: {
          id: 'user_1',
          firstName: 'Alice',
          lastName: 'Smith',
          username: 'alice',
          imageUrl: 'https://img.example/alice',
          hasImage: false,
          primaryEmailAddressId: null,
          passwordEnabled: false,
          deleteSelfEnabled: true,
          externalAccounts: [],
          enterpriseAccounts: [],
          emailAddresses: [],
        },
        updatedAt: Date.now(),
      },
    };
    const view = render(details(clerk, hydration));
    expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Profile picture')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Edit name' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Edit username' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Upload' })).toBeDisabled();
    const actor = userEvent.setup();
    const editName = screen.getByRole('button', { name: 'Edit name' });
    const before = editName.getBoundingClientRect();
    expect(before.width).toBeGreaterThan(0);
    await actor.click(editName);
    await actor.keyboard('{Tab}{Enter}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    await act(() => clerk.load({ routerPush: () => Promise.resolve(), routerReplace: () => Promise.resolve() }));
    view.rerender(details(clerk, hydration));
    const after = (await screen.findByRole('button', { name: 'Edit name' })).getBoundingClientRect();
    expect([after.x, after.y, after.width, after.height]).toEqual([before.x, before.y, before.width, before.height]);
    await actor.click(screen.getByRole('button', { name: 'Edit name' }));
    const dialog = screen.getByRole('dialog', { name: 'Edit name' });
    await actor.clear(within(dialog).getByLabelText('First name'));
    await actor.type(within(dialog).getByLabelText('First name'), 'Alicia');
    const refresh = holdRequests('get', '/v1/me');
    await actor.click(within(dialog).getByRole('button', { name: 'Save changes' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(screen.getByText('Alicia Smith')).toBeInTheDocument();
    expect(screen.queryByText('Alice Smith')).not.toBeInTheDocument();
    refresh.release();
    expect(await screen.findByText('Alicia Smith')).toBeInTheDocument();
    view.unmount();
  });

  it('keeps the name dialog open and maps a Clerk field error', async () => {
    serveFapi({
      environment: fapiEnvironment(),
      client: fapiClient([fapiSession({ id: 'sess_1', user: alice })]),
    });
    const clerk = new Clerk(publishableKey());
    await act(() => clerk.load({ routerPush: () => Promise.resolve(), routerReplace: () => Promise.resolve() }));
    const view = render(details(clerk));
    await screen.findByText('Alice Smith');
    worker.use(
      http.post(
        fapiUrl('/v1/me'),
        () =>
          HttpResponse.json(
            {
              errors: [
                {
                  code: 'form_param_invalid',
                  message: 'Invalid first name',
                  long_message: 'First name is invalid',
                  meta: { param_name: 'first_name' },
                },
              ],
            },
            { status: 422 },
          ),
        { once: true },
      ),
    );
    const actor = userEvent.setup();
    await actor.click(screen.getByRole('button', { name: 'Edit name' }));
    const dialog = screen.getByRole('dialog', { name: 'Edit name' });
    await actor.clear(within(dialog).getByLabelText('First name'));
    await actor.type(within(dialog).getByLabelText('First name'), 'Invalid');
    await actor.click(within(dialog).getByRole('button', { name: 'Save changes' }));
    await waitFor(() => expect(within(dialog).getByLabelText('First name')).toHaveAttribute('aria-invalid', 'true'));
    expect(screen.getByRole('dialog', { name: 'Edit name' })).toBeInTheDocument();
    expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    view.unmount();
  });

  it('keeps the shell fallback while a cold user query resolves', async () => {
    serveFapi({ client: fapiClient([fapiSession({ id: 'sess_1', user: alice })]) });
    const clerk = new Clerk(publishableKey());
    await act(() => clerk.load({ routerPush: () => Promise.resolve(), routerReplace: () => Promise.resolve() }));
    const view = render(details(clerk));
    expect(screen.getByText('Loading profile details')).toBeInTheDocument();
    expect(await screen.findByText('Alice Smith')).toBeInTheDocument();
    view.unmount();
  });

  it('uses instance policy for disabled names and immutable usernames after connection', async () => {
    serveFapi({
      environment: fapiEnvironment({
        attributes: {
          first_name: { enabled: false },
          last_name: { enabled: false },
          username: { immutable: true },
        },
      }),
      client: fapiClient([fapiSession({ id: 'sess_1', user: alice })]),
    });
    const clerk = new Clerk(publishableKey());
    await act(() => clerk.load({ routerPush: () => Promise.resolve(), routerReplace: () => Promise.resolve() }));
    const view = render(details(clerk));
    const section = await screen.findByRole('group', { name: 'Profile' });
    await waitFor(() => expect(within(section).queryByText('Name')).not.toBeInTheDocument());
    expect(within(section).getByText('alice')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Edit username' })).not.toBeInTheDocument();
    view.unmount();
  });

  it('omits managed and immutable snapshot edits while keeping picture management', () => {
    serveFapi({});
    const clerk = new Clerk(publishableKey());
    const view = render(
      details(clerk, {
        version: 5,
        profileSettings: {
          data: { ...profileSettings, username: { ...profileSettings.username, immutable: true } },
          updatedAt: Date.now(),
        },
        scope: { instanceKey: 'server', userId: 'user_1', sessionId: 'sess_1' },
        user: {
          data: {
            id: 'user_1',
            firstName: 'Alice',
            lastName: 'Smith',
            username: 'alice',
            imageUrl: '',
            hasImage: false,
            primaryEmailAddressId: null,
            passwordEnabled: false,
            deleteSelfEnabled: true,
            emailAddresses: [],
            externalAccounts: [],
            enterpriseAccounts: [
              {
                active: true,
                provider: 'saml_company',
                enterpriseConnection: { name: 'Company SSO', disableAdditionalIdentifications: false },
              },
            ],
          },
          updatedAt: Date.now(),
        },
      }),
    );
    expect(screen.getByText('Managed by Company SSO')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Edit name' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Edit username' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Upload' })).toBeDisabled();
    view.unmount();
  });

  it('drops the previous identity and actions on account switch and sign-out', async () => {
    const bob = fapiUser({ id: 'user_2', first_name: 'Bob', last_name: 'Jones' });
    serveFapi({
      client: fapiClient([fapiSession({ id: 'sess_1', user: alice }), fapiSession({ id: 'sess_2', user: bob })]),
    });
    const clerk = new Clerk(publishableKey());
    await act(() => clerk.load({ routerPush: () => Promise.resolve(), routerReplace: () => Promise.resolve() }));
    const view = render(details(clerk));
    expect(await screen.findByText('Alice Smith')).toBeInTheDocument();
    await act(() => clerk.setActive({ session: 'sess_2' }));
    expect(await screen.findByText('Bob Jones')).toBeInTheDocument();
    expect(screen.queryByText('Alice Smith')).not.toBeInTheDocument();
    await act(() => clerk.signOut());
    await waitFor(() => expect(screen.queryByText('Bob Jones')).not.toBeInTheDocument());
    expect(screen.queryByRole('button', { name: 'Edit name' })).not.toBeInTheDocument();
    view.unmount();
  });

  it('keeps the other account sections and Security navigation usable while details load', async () => {
    serveFapi({ client: fapiClient([fapiSession({ id: 'sess_1', user: alice })]) });
    const clerk = new Clerk(publishableKey());
    await act(() => clerk.load({ routerPush: () => Promise.resolve(), routerReplace: () => Promise.resolve() }));
    const held = holdRequests('get', '/v1/me');
    const view = render(
      <ClerkContextProvider
        clerk={clerk}
        clerkStatus={clerk.status}
      >
        <MosaicProvider>
          <LoomProvider clerk={clerk}>
            <LoomComposedProfile />
          </LoomProvider>
        </MosaicProvider>
      </ClerkContextProvider>,
    );

    expect(screen.queryByRole('group', { name: 'Profile' })).not.toBeInTheDocument();
    expect(screen.queryByRole('group', { name: 'Email' })).not.toBeInTheDocument();
    expect(screen.queryByText(/Loading/)).not.toBeInTheDocument();
    const actor = userEvent.setup();
    await actor.click(screen.getByRole('button', { name: 'Account' }));
    await actor.click(screen.getByRole('tab', { name: 'Security' }));
    expect(screen.getByRole('heading', { name: 'Security' })).toBeInTheDocument();
    expect(screen.queryByRole('group', { name: 'Password' })).not.toBeInTheDocument();
    held.release();
    view.unmount();
  });
});
