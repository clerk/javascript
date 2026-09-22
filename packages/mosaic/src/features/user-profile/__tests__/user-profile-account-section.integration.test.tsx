import { ClerkAPIResponseError } from '@clerk/shared/error';
import type * as SharedReact from '@clerk/shared/react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { MosaicProvider } from '../../../MosaicProvider';
import { UserProfileAccountSection } from '../user-profile-account-section/user-profile-account-section';

let usernameEnabled: boolean;
let namesEnabled: boolean;
let user: {
  firstName: string;
  lastName: string;
  username: string;
  imageUrl: string;
  hasImage: boolean;
  enterpriseAccounts: never[];
  primaryEmailAddressId: null;
  primaryPhoneNumberId: null;
  emailAddresses: never[];
  phoneNumbers: never[];
  setProfileImage: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
};

vi.mock('@clerk/shared/react', async importOriginal => {
  const actual = await importOriginal<typeof SharedReact>();
  return {
    ...actual,
    useUser: () => ({ isLoaded: true, user }),
    useClerk: () => ({
      __internal_environment: {
        userSettings: {
          attributes: {
            first_name: { enabled: namesEnabled, required: false },
            last_name: { enabled: namesEnabled, required: false },
            username: { enabled: usernameEnabled, required: false },
          },
        },
      },
    }),
  };
});

function renderSection() {
  return render(
    <MosaicProvider>
      <UserProfileAccountSection />
    </MosaicProvider>,
  );
}

beforeEach(() => {
  usernameEnabled = true;
  namesEnabled = true;
  user = {
    firstName: 'Preston',
    lastName: 'Booth',
    username: 'prestonxyz',
    imageUrl: 'https://img.clerk.com/preston.png',
    hasImage: false,
    enterpriseAccounts: [],
    primaryEmailAddressId: null,
    primaryPhoneNumberId: null,
    emailAddresses: [],
    phoneNumbers: [],
    setProfileImage: vi.fn(() => Promise.resolve({})),
    update: vi.fn(() => Promise.resolve(user)),
  };
});

describe('UserProfileAccountSection', () => {
  it('saves an edited name and closes the dialog', async () => {
    const actor = userEvent.setup();
    renderSection();

    await actor.click(screen.getByRole('button', { name: 'Edit name' }));
    const dialog = screen.getByRole('dialog', { name: 'Edit name' });
    await actor.clear(within(dialog).getByLabelText('First name'));
    await actor.type(within(dialog).getByLabelText('First name'), 'Pres');
    await actor.click(within(dialog).getByRole('button', { name: 'Save changes' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(user.update).toHaveBeenCalledExactlyOnceWith({ firstName: 'Pres', lastName: 'Booth' });
  });

  it('keeps the username dialog open on the error the server names it for', async () => {
    user.update.mockRejectedValue(
      new ClerkAPIResponseError('failed', {
        data: [
          {
            code: 'form_identifier_exists',
            message: 'Taken',
            long_message: 'That username is taken. Please try another.',
            meta: { param_name: 'username' },
          },
        ],
        status: 422,
      }),
    );
    const actor = userEvent.setup();
    renderSection();

    await actor.click(screen.getByRole('button', { name: 'Edit username' }));
    const dialog = screen.getByRole('dialog', { name: 'Edit username' });
    await actor.type(within(dialog).getByLabelText('Username'), '2');
    await actor.click(within(dialog).getByRole('button', { name: 'Save changes' }));

    expect(await within(dialog).findByText('That username is taken. Please try another.')).toBeInTheDocument();
    expect(user.update).toHaveBeenCalledExactlyOnceWith({ username: 'prestonxyz2' });
  });

  it('uploads a picked picture and shows why it failed', async () => {
    user.setProfileImage.mockRejectedValue(
      new ClerkAPIResponseError('failed', {
        data: [{ code: 'avatar_file_size_exceeded', message: 'Too large', long_message: 'Too large.' }],
        status: 413,
      }),
    );
    const actor = userEvent.setup();
    const { container } = renderSection();
    const file = new File(['x'], 'me.png', { type: 'image/png' });

    const input = container.querySelector('input[type="file"]');
    if (!(input instanceof HTMLInputElement)) {
      throw new Error('expected a file input');
    }
    await actor.upload(input, file);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'File size exceeds the maximum limit of 10MB. Please choose a smaller file.',
    );
    expect(user.setProfileImage).toHaveBeenCalledExactlyOnceWith({ file });
  });

  it('leaves the username row out when the instance does not use usernames', () => {
    usernameEnabled = false;
    renderSection();

    expect(screen.queryByText('Username')).not.toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
  });

  it('leaves the name row out when the instance collects neither name', () => {
    namesEnabled = false;
    renderSection();

    expect(screen.queryByText('Name')).not.toBeInTheDocument();
    expect(screen.getByText('Username')).toBeInTheDocument();
  });
});
