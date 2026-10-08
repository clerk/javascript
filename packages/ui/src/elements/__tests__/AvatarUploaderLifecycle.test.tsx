import { ClerkAPIResponseError } from '@clerk/shared/error';
import { createDeferredPromise } from '@clerk/shared/utils';
import { act, fireEvent, render, waitFor } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { ProfileForm as OrganizationProfileForm } from '@/ui/components/OrganizationProfile/ProfileForm';
import { ProfileForm as UserProfileForm } from '@/ui/components/UserProfile/ProfileForm';
import { localizationKeys } from '@/ui/customizables';

import { AvatarUploader } from '../AvatarUploader';
import { useCardState, withCardStateProvider } from '../contexts';

const { createFixtures } = bindCreateFixtures('UserProfile');
const { createFixtures: createOrganizationFixtures } = bindCreateFixtures('OrganizationProfile');
const Boundary = withCardStateProvider(({ children }: PropsWithChildren) => <>{children}</>);
const Preview = ({ imageUrl = '' }: { imageUrl?: string }) => <span data-testid='preview'>{imageUrl}</span>;
const Status = () => {
  const card = useCardState();
  return (
    <>
      <span role='status'>{card.isLoading ? 'loading' : 'idle'}</span>
      {card.error && <span role='alert'>{card.error}</span>}
    </>
  );
};
const Harness = ({
  source = 'first',
  change,
  remove,
}: {
  source?: string;
  change: (file: File) => Promise<unknown>;
  remove?: () => void | Promise<unknown>;
}) => (
  <Boundary>
    <Status />
    <AvatarUploader
      key={source}
      title={localizationKeys('userProfile.profilePage.imageFormTitle')}
      avatarPreview={<Preview />}
      onAvatarChange={change}
      onAvatarRemove={remove}
    />
  </Boundary>
);
const file = () => new File(['image'], 'avatar.png', { type: 'image/png' });
const input = (container: HTMLElement) => container.querySelector<HTMLInputElement>('input[type=file]')!;
const failure = () =>
  new ClerkAPIResponseError('Upload failed', {
    status: 500,
    data: [{ code: 'internal_server_error', message: 'Upload failed', long_message: 'Please try again' }],
  });

class ControlledReader {
  static LOADING = 1;
  static instances: ControlledReader[] = [];
  readyState = 0;
  result: string | null = null;
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  onabort: (() => void) | null = null;
  abort = vi.fn(() => {
    this.readyState = 2;
    this.onabort?.();
  });
  readAsDataURL = vi.fn(() => {
    this.readyState = 1;
  });
  constructor() {
    ControlledReader.instances.push(this);
  }
  finish(value: string) {
    this.result = value;
    this.readyState = 2;
    this.onload?.();
  }
}
const readers = () => {
  ControlledReader.instances = [];
  vi.stubGlobal('FileReader', ControlledReader);
};
afterEach(() => vi.unstubAllGlobals());

describe('AvatarUploader lifecycle', () => {
  it('releases loading after upload failure and clears the error on retry', async () => {
    const { wrapper } = await createFixtures();
    const change = vi.fn().mockRejectedValueOnce(failure()).mockResolvedValueOnce(undefined);
    const { container, getByRole, findByRole, queryByRole } = render(<Harness change={change} />, { wrapper });
    const selected = file();
    fireEvent.change(input(container), { target: { files: [selected] } });
    expect(await findByRole('alert')).toHaveTextContent('Please try again');
    await waitFor(() => expect(input(container)).toBeEnabled());
    fireEvent.change(input(container), { target: { files: [selected] } });
    await waitFor(() => expect(change).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(getByRole('status')).toHaveTextContent('idle'));
    expect(queryByRole('alert')).not.toBeInTheDocument();
  });

  it('starts one upload for two selections before rendering', async () => {
    readers();
    const { wrapper } = await createFixtures();
    const deferred = createDeferredPromise<void>();
    const change = vi.fn(() => deferred.promise);
    const { container } = render(<Harness change={change} />, { wrapper });
    act(() => {
      fireEvent.change(input(container), { target: { files: [file()] } });
      fireEvent.change(input(container), { target: { files: [file()] } });
    });
    expect(change).toHaveBeenCalledOnce();
    expect(ControlledReader.instances).toHaveLength(1);
    await act(async () => {
      deferred.resolve();
      await deferred.promise;
    });
  });

  it('releases loading after asynchronous removal fails', async () => {
    const { wrapper } = await createFixtures();
    const remove = vi.fn().mockRejectedValue(failure());
    const { getByRole, findByRole } = render(
      <Harness
        change={vi.fn().mockResolvedValue(undefined)}
        remove={remove}
      />,
      { wrapper },
    );
    fireEvent.click(getByRole('button', { name: /^remove$/i }));
    expect(await findByRole('alert')).toHaveTextContent('Please try again');
    await waitFor(() => expect(getByRole('button', { name: /^remove$/i })).toBeEnabled());
  });

  it.each(['user', 'organization'] as const)('waits for the real %s profile removal command', async kind => {
    const create = kind === 'user' ? createFixtures : createOrganizationFixtures;
    const { wrapper, fixtures } = await create(f => {
      f.withOrganizations();
      f.withUser({
        email_addresses: ['first@clerk.com'],
        image_url: 'https://example.com/avatar.png',
        organization_memberships: [{ name: 'Org1', role: 'admin', image_url: 'https://example.com/logo.png' }],
      });
    });
    const deferred = createDeferredPromise<any>();
    const remove = kind === 'user' ? fixtures.clerk.user!.setProfileImage : fixtures.clerk.organization!.setLogo;
    remove.mockReturnValue(deferred.promise);
    const onSuccess = vi.fn();
    const { getByRole } = render(
      kind === 'user' ? (
        <UserProfileForm
          onSuccess={onSuccess}
          onReset={vi.fn()}
        />
      ) : (
        <OrganizationProfileForm
          onSuccess={onSuccess}
          onReset={vi.fn()}
        />
      ),
      { wrapper },
    );
    const button = getByRole('button', { name: /^remove$/i });
    fireEvent.click(button);
    await waitFor(() => expect(remove).toHaveBeenCalledWith({ file: null }));
    expect(button).toBeDisabled();
    expect(onSuccess).not.toHaveBeenCalled();
    await act(async () => {
      deferred.resolve(undefined);
      await deferred.promise;
    });
    expect(button).toBeEnabled();
    expect(onSuccess).toHaveBeenCalledOnce();
  });

  it('waits for asynchronous removal and starts it only once before rendering', async () => {
    const { wrapper } = await createFixtures();
    const deferred = createDeferredPromise<void>();
    const remove = vi.fn(() => deferred.promise);
    const { getByRole } = render(
      <Harness
        change={vi.fn().mockResolvedValue(undefined)}
        remove={remove}
      />,
      { wrapper },
    );
    const button = getByRole('button', { name: /^remove$/i });
    act(() => {
      button.click();
      button.click();
    });
    expect(remove).toHaveBeenCalledOnce();
    expect(button).toBeDisabled();
    await act(async () => {
      deferred.resolve();
      await deferred.promise;
    });
    expect(button).toBeEnabled();
  });

  it('cancels an obsolete reader and keeps the newer preview', async () => {
    readers();
    const { wrapper } = await createFixtures();
    const { container, getByTestId } = render(<Harness change={vi.fn().mockResolvedValue(undefined)} />, { wrapper });
    fireEvent.change(input(container), { target: { files: [file()] } });
    const first = ControlledReader.instances[0];
    const oldLoad = first.onload!;
    await waitFor(() => expect(input(container)).toBeEnabled());
    fireEvent.change(input(container), { target: { files: [file()] } });
    expect(first.abort).toHaveBeenCalledOnce();
    act(() => {
      ControlledReader.instances[1].finish('new-preview');
    });
    act(() => {
      first.result = 'old-preview';
      oldLoad();
    });
    expect(getByTestId('preview')).toHaveTextContent('new-preview');
  });

  it('does not restore a removed preview from a late reader', async () => {
    readers();
    const { wrapper } = await createFixtures();
    const { container, getByTestId, getByRole } = render(
      <Harness
        change={vi.fn().mockResolvedValue(undefined)}
        remove={vi.fn()}
      />,
      { wrapper },
    );
    fireEvent.change(input(container), { target: { files: [file()] } });
    const reader = ControlledReader.instances[0];
    const oldLoad = reader.onload!;
    await waitFor(() => expect(input(container)).toBeEnabled());
    fireEvent.click(getByRole('button', { name: /^remove$/i }));
    expect(reader.abort).toHaveBeenCalledOnce();
    act(() => {
      reader.result = 'old-preview';
      oldLoad();
    });
    expect(getByTestId('preview')).toBeEmptyDOMElement();
  });

  it('aborts the preview read when the uploader closes', async () => {
    readers();
    const { wrapper } = await createFixtures();
    const { container, unmount } = render(<Harness change={vi.fn().mockResolvedValue(undefined)} />, { wrapper });
    fireEvent.change(input(container), { target: { files: [file()] } });
    const reader = ControlledReader.instances[0];
    unmount();
    expect(reader.abort).toHaveBeenCalledOnce();
    expect(reader.onload).toBeNull();
    expect(reader.onerror).toBeNull();
  });

  it('keeps a replacement uploader busy after an old upload failure', async () => {
    readers();
    const { wrapper } = await createFixtures();
    const first = createDeferredPromise<void>();
    const second = createDeferredPromise<void>();
    const { container, getByRole, queryByRole, rerender } = render(<Harness change={() => first.promise} />, {
      wrapper,
    });
    fireEvent.change(input(container), { target: { files: [file()] } });
    rerender(
      <Harness
        source='second'
        change={() => second.promise}
      />,
    );
    await waitFor(() => expect(input(container)).toBeEnabled());
    fireEvent.change(input(container), { target: { files: [file()] } });
    await act(async () => {
      first.reject(failure());
      await first.promise.catch(() => {});
    });
    expect(getByRole('status')).toHaveTextContent('loading');
    expect(input(container)).toBeDisabled();
    expect(queryByRole('alert')).not.toBeInTheDocument();
    await act(async () => {
      second.resolve();
      await second.promise;
    });
    expect(input(container)).toBeEnabled();
  });

  it('keeps upload completion available when preview reading fails', async () => {
    readers();
    const { wrapper } = await createFixtures();
    const deferred = createDeferredPromise<void>();
    const change = vi.fn(() => deferred.promise);
    const { container, getByRole } = render(<Harness change={change} />, { wrapper });
    fireEvent.change(input(container), { target: { files: [file()] } });
    act(() => {
      ControlledReader.instances[0].onerror?.();
    });
    expect(change).toHaveBeenCalledOnce();
    await act(async () => {
      deferred.resolve();
      await deferred.promise;
    });
    expect(getByRole('status')).toHaveTextContent('idle');
  });
});
