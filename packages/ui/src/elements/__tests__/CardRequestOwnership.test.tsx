import { createDeferredPromise } from '@clerk/shared/utils';
import type { PropsWithChildren } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { act, fireEvent, render } from '@/test/utils';
import { SuggestionPreview } from '@/ui/components/SessionTasks/tasks/TaskChooseOrganization/choose-organization-screen.rows';
import { localizationKeys } from '@/ui/customizables';

import { Action } from '../Actions';
import { AvatarUploader } from '../AvatarUploader';
import { useCardState, withCardStateProvider } from '../contexts';
import { Form } from '../Form';

const { createFixtures } = bindCreateFixtures('UserProfile');
const Boundary = withCardStateProvider(({ children }: PropsWithChildren) => <>{children}</>);
const Status = () => {
  const card = useCardState();
  return (
    <>
      <span role='status'>{card.isLoading ? 'loading' : 'idle'}</span>
      <button
        type='button'
        onClick={() => card.setIdle()}
      >
        Old cleanup
      </button>
    </>
  );
};
const TestForm = ({ submit, id }: { submit: () => Promise<unknown>; id: string }) => (
  <Form.Root
    data-testid={id}
    onSubmit={submit}
  >
    <Form.SubmitButton />
  </Form.Root>
);
const TestAvatar = ({ change }: { change: () => Promise<unknown> }) => (
  <AvatarUploader
    title={localizationKeys('userProfile.profilePage.imageFormTitle')}
    avatarPreview={<span />}
    onAvatarChange={change}
  />
);
const TestIcon = () => <svg />;
const TestAction = ({ run, label }: { run: () => Promise<unknown>; label: string }) => (
  <Action
    icon={TestIcon}
    label={label}
    onClick={run}
  />
);
const TestSuggestion = ({ accept }: { accept: () => Promise<void> }) => (
  <SuggestionPreview
    row={{
      id: 'sug_1',
      organization: { id: 'org_1', name: 'Suggested organization', slug: 'suggested', imageUrl: '', hasImage: false },
      status: 'pending',
      accept,
    }}
  />
);

describe('card request ownership', () => {
  it('starts one of two action clicks before rendering', async () => {
    const { wrapper } = await createFixtures();
    const deferred = createDeferredPromise<void>();
    const first = vi.fn(() => deferred.promise);
    const second = vi.fn().mockResolvedValue(undefined);
    const { getByRole } = render(
      <Boundary>
        <TestAction
          label='First action'
          run={first}
        />
        <TestAction
          label='Second action'
          run={second}
        />
      </Boundary>,
      { wrapper },
    );
    const firstButton = getByRole('button', { name: 'First action' });
    const secondButton = getByRole('button', { name: 'Second action' });
    act(() => {
      firstButton.click();
      secondButton.click();
    });
    expect(first).toHaveBeenCalledOnce();
    expect(second).not.toHaveBeenCalled();
    await act(async () => {
      deferred.resolve();
      await deferred.promise;
    });
  });

  it('does not start an action in the same event batch as a form submission', async () => {
    const { wrapper } = await createFixtures();
    const deferred = createDeferredPromise<void>();
    const run = vi.fn().mockResolvedValue(undefined);
    const { getByRole, getByTestId } = render(
      <Boundary>
        <TestForm
          id='form'
          submit={() => deferred.promise}
        />
        <TestAction
          label='Other action'
          run={run}
        />
      </Boundary>,
      { wrapper },
    );
    const button = getByRole('button', { name: 'Other action' });
    act(() => {
      fireEvent.submit(getByTestId('form'));
      button.click();
    });
    expect(run).not.toHaveBeenCalled();
    await act(async () => {
      deferred.resolve();
      await deferred.promise;
    });
  });

  it('releases a closed action without letting its completion release a replacement', async () => {
    const { wrapper } = await createFixtures();
    const first = createDeferredPromise<void>();
    const second = createDeferredPromise<void>();
    const renderActions = (replacement: boolean) => (
      <Boundary>
        <Status />
        <TestAction
          key={replacement ? 'second' : 'first'}
          label={replacement ? 'Second action' : 'First action'}
          run={() => (replacement ? second.promise : first.promise)}
        />
      </Boundary>
    );
    const { getByRole, rerender, userEvent } = render(renderActions(false), { wrapper });
    await userEvent.click(getByRole('button', { name: 'First action' }));
    expect(getByRole('status')).toHaveTextContent('loading');
    rerender(renderActions(true));
    expect(getByRole('status')).toHaveTextContent('idle');
    await userEvent.click(getByRole('button', { name: 'Second action' }));
    await act(async () => {
      first.resolve();
      await first.promise;
    });
    expect(getByRole('status')).toHaveTextContent('loading');
    await act(async () => {
      second.resolve();
      await second.promise;
    });
    expect(getByRole('status')).toHaveTextContent('idle');
  });

  it('starts one of two form submissions before rendering', async () => {
    const { wrapper } = await createFixtures();
    const first = createDeferredPromise<void>();
    const firstSubmit = vi.fn(() => first.promise);
    const secondSubmit = vi.fn().mockResolvedValue(undefined);
    const { getByTestId } = render(
      <Boundary>
        <TestForm
          id='first'
          submit={firstSubmit}
        />
        <TestForm
          id='second'
          submit={secondSubmit}
        />
      </Boundary>,
      { wrapper },
    );
    act(() => {
      fireEvent.submit(getByTestId('first'));
      fireEvent.submit(getByTestId('second'));
    });
    expect(firstSubmit).toHaveBeenCalledOnce();
    expect(secondSubmit).not.toHaveBeenCalled();
    await act(async () => {
      first.resolve();
      await first.promise;
    });
  });

  it('does not start an avatar upload in the same event batch as a form submission', async () => {
    const { wrapper } = await createFixtures();
    const deferred = createDeferredPromise<void>();
    const submit = vi.fn(() => deferred.promise);
    const change = vi.fn().mockResolvedValue(undefined);
    const { container, getByTestId } = render(
      <Boundary>
        <TestForm
          id='form'
          submit={submit}
        />
        <TestAvatar change={change} />
      </Boundary>,
      { wrapper },
    );
    act(() => {
      fireEvent.submit(getByTestId('form'));
      fireEvent.change(container.querySelector('input[type=file]')!, {
        target: { files: [new File(['image'], 'avatar.png', { type: 'image/png' })] },
      });
    });
    expect(submit).toHaveBeenCalledOnce();
    expect(change).not.toHaveBeenCalled();
    await act(async () => {
      deferred.resolve();
      await deferred.promise;
    });
  });

  it('does not start a suggestion action in the same event batch as a form submission', async () => {
    const { wrapper } = await createFixtures();
    const deferred = createDeferredPromise<void>();
    const accept = vi.fn().mockResolvedValue(undefined);
    const { getByRole, getByTestId } = render(
      <Boundary>
        <TestForm
          id='form'
          submit={() => deferred.promise}
        />
        <TestSuggestion accept={accept} />
      </Boundary>,
      { wrapper },
    );
    act(() => {
      fireEvent.submit(getByTestId('form'));
      getByRole('button', { name: 'Request to join' }).click();
    });
    expect(accept).not.toHaveBeenCalled();
    await act(async () => {
      deferred.resolve();
      await deferred.promise;
    });
  });

  it('does not let an old idle update clear an owned request', async () => {
    const { wrapper } = await createFixtures();
    const deferred = createDeferredPromise<void>();
    const { getByTestId, getByRole, userEvent } = render(
      <Boundary>
        <Status />
        <TestForm
          id='form'
          submit={() => deferred.promise}
        />
      </Boundary>,
      { wrapper },
    );
    fireEvent.submit(getByTestId('form'));
    await userEvent.click(getByRole('button', { name: 'Old cleanup' }));
    expect(getByRole('status')).toHaveTextContent('loading');
    await act(async () => {
      deferred.resolve();
      await deferred.promise;
    });
    expect(getByRole('status')).toHaveTextContent('idle');
  });
  it('does not block a request on another card', async () => {
    const { wrapper } = await createFixtures();
    const first = createDeferredPromise<void>();
    const second = createDeferredPromise<void>();
    const firstSubmit = vi.fn(() => first.promise);
    const secondSubmit = vi.fn(() => second.promise);
    const { getByTestId } = render(
      <>
        <Boundary>
          <TestForm
            id='first'
            submit={firstSubmit}
          />
        </Boundary>
        <Boundary>
          <TestForm
            id='second'
            submit={secondSubmit}
          />
        </Boundary>
      </>,
      { wrapper },
    );
    act(() => {
      fireEvent.submit(getByTestId('first'));
      fireEvent.submit(getByTestId('second'));
    });
    expect(firstSubmit).toHaveBeenCalledOnce();
    expect(secondSubmit).toHaveBeenCalledOnce();
    await act(async () => {
      first.resolve();
      second.resolve();
      await Promise.all([first.promise, second.promise]);
    });
  });
});
