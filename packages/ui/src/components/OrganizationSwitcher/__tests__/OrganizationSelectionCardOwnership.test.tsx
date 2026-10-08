import { createDeferredPromise } from '@clerk/shared/utils';
import type { PropsWithChildren } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { act, fireEvent, render } from '@/test/utils';
import { useCardState, withCardStateProvider } from '@/ui/elements/contexts';
import { Form } from '@/ui/elements/Form';
import { PreviewButton } from '@/ui/elements/PreviewButton';

import { useOrganizationSwitcherPopoverController } from '../organization-switcher-popover.controller';
import { useOrganizationSwitcherPopoverModel } from '../organization-switcher-popover.model';

const { createFixtures } = bindCreateFixtures('OrganizationSwitcher');
const Boundary = withCardStateProvider(({ children }: PropsWithChildren) => <>{children}</>);
const Status = () => {
  const card = useCardState();
  return (
    <>
      <span role='status'>{card.isLoading ? 'loading' : 'idle'}</span>
      <button
        type='button'
        onClick={() => card.setLoading()}
      >
        Legacy loading
      </button>
      <button
        type='button'
        onClick={() => card.setIdle()}
      >
        Old cleanup
      </button>
    </>
  );
};
const PersonalSelection = () => {
  const model = useOrganizationSwitcherPopoverModel();
  const controller = useOrganizationSwitcherPopoverController(model);
  return (
    <PreviewButton
      onClick={() => {
        void controller.onPersonalWorkspaceClick();
      }}
    >
      Select personal workspace
    </PreviewButton>
  );
};
async function setup() {
  return createFixtures(f => {
    f.withOrganizations();
    f.withUser({ email_addresses: ['first@clerk.com'], create_organization_enabled: true });
  });
}

describe('organization selection card ownership', () => {
  it.each(['form', 'selection'] as const)(
    'blocks a second request when the %s starts first in one event batch',
    async first => {
      const { wrapper, fixtures } = await setup();
      const deferred = createDeferredPromise<void>();
      const submit = vi.fn(() => deferred.promise);
      fixtures.clerk.setActive.mockReturnValue(deferred.promise);
      const { getByRole, getByTestId } = render(
        <Boundary>
          <Form.Root
            data-testid='form'
            onSubmit={submit}
          >
            <Form.SubmitButton />
          </Form.Root>
          <PersonalSelection />
        </Boundary>,
        { wrapper },
      );
      const button = getByRole('button', { name: 'Select personal workspace' });
      act(() => {
        if (first === 'form') {
          fireEvent.submit(getByTestId('form'));
          button.click();
        } else {
          button.click();
          fireEvent.submit(getByTestId('form'));
        }
      });
      await act(async () => {
        await Promise.resolve();
      });
      if (first === 'form') {
        expect(submit).toHaveBeenCalledOnce();
        expect(fixtures.clerk.setActive).not.toHaveBeenCalled();
      } else {
        expect(fixtures.clerk.setActive).toHaveBeenCalledOnce();
        expect(submit).not.toHaveBeenCalled();
      }
      await act(async () => {
        deferred.resolve();
        await deferred.promise;
      });
    },
  );

  it('does not clear another action loading when the controller mounts', async () => {
    const { wrapper } = await setup();
    const page = (show: boolean) => (
      <Boundary>
        <Status />
        {show && <PersonalSelection />}
      </Boundary>
    );
    const { getByRole, rerender, userEvent } = render(page(false), { wrapper });
    await userEvent.click(getByRole('button', { name: 'Legacy loading' }));
    rerender(page(true));
    expect(getByRole('status')).toHaveTextContent('loading');
  });

  it('does not let an old idle update clear a pending organization selection', async () => {
    const { wrapper, fixtures } = await setup();
    const deferred = createDeferredPromise<void>();
    fixtures.clerk.setActive.mockReturnValue(deferred.promise);
    const { getByRole, userEvent } = render(
      <Boundary>
        <Status />
        <PersonalSelection />
      </Boundary>,
      { wrapper },
    );
    await userEvent.click(getByRole('button', { name: 'Select personal workspace' }));
    await userEvent.click(getByRole('button', { name: 'Old cleanup' }));
    expect(getByRole('status')).toHaveTextContent('loading');
    await act(async () => {
      deferred.resolve();
      await deferred.promise;
    });
    expect(getByRole('status')).toHaveTextContent('idle');
  });

  it('releases a closed selection without letting its completion release a replacement', async () => {
    const { wrapper, fixtures } = await setup();
    const first = createDeferredPromise<void>();
    const second = createDeferredPromise<void>();
    fixtures.clerk.setActive.mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);
    const page = (key: string) => (
      <Boundary>
        <Status />
        <PersonalSelection key={key} />
      </Boundary>
    );
    const { getByRole, rerender, userEvent } = render(page('first'), { wrapper });
    await userEvent.click(getByRole('button', { name: 'Select personal workspace' }));
    expect(getByRole('status')).toHaveTextContent('loading');
    rerender(page('second'));
    expect(getByRole('status')).toHaveTextContent('idle');
    await userEvent.click(getByRole('button', { name: 'Select personal workspace' }));
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
    expect(fixtures.clerk.setActive).toHaveBeenCalledTimes(2);
  });

  it('releases its loading after the SDK changes the active session', async () => {
    const { wrapper, fixtures } = await setup();
    const deferred = createDeferredPromise<void>();
    fixtures.clerk.setActive.mockReturnValue(deferred.promise);
    const { getByRole, userEvent } = render(
      <Boundary>
        <Status />
        <PersonalSelection />
      </Boundary>,
      { wrapper },
    );
    await userEvent.click(getByRole('button', { name: 'Select personal workspace' }));
    expect(getByRole('status')).toHaveTextContent('loading');
    vi.spyOn(fixtures.clerk, 'session', 'get').mockReturnValue({
      ...fixtures.clerk.session!,
      id: 'session_changed',
    } as never);
    await act(async () => {
      deferred.resolve();
      await deferred.promise;
    });
    expect(getByRole('status')).toHaveTextContent('idle');
  });
});
