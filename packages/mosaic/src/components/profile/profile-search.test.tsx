import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { MosaicProvider } from '../../mosaic-provider';
import { Dialog } from '../dialog';
import { Section } from '../section';
import type { ProfileNavProps } from './profile';
import { Profile } from './profile';
import { SearchTarget, useIsSearchIndexing } from './profile-search-index';

const pageTitles: Record<string, string> = {
  account: 'Account',
  security: 'Security',
  billing: 'Billing',
  usage: 'Usage',
};

const searchPages: NonNullable<ProfileNavProps['search']> = [
  { value: 'account', label: 'Account' },
  { value: 'security', label: 'Security' },
  { value: 'billing', label: 'Billing', keywords: ['invoices', 'plan'] },
  { value: 'usage', label: 'Usage', keywords: ['plan'] },
];

function Titled({ children, keywords, id }: { children: string; keywords?: readonly string[]; id?: string }) {
  return (
    <Section.Root search={{ label: children, keywords, id }}>
      <Section.Group>
        <Section.Header>
          <Section.Content>
            <Section.Title>{children}</Section.Title>
          </Section.Content>
        </Section.Header>
      </Section.Group>
    </Section.Root>
  );
}

const indexedRenders = vi.fn();
const indexClosed = vi.fn();
const sectionBodyRenders = vi.fn();

function UsagePage() {
  const indexing = useIsSearchIndexing();
  indexedRenders(indexing);
  React.useEffect(() => (indexing ? indexClosed : undefined), [indexing]);
  return (
    <>
      <SearchTarget
        label='Rate limits'
        keywords={['throttle']}
        render={<article className='usage-card' />}
      >
        <h3>Rate limits</h3>
      </SearchTarget>
      <SearchTarget
        label='Seats'
        id='seats-included'
        render={<article />}
      >
        <h3>Seats included</h3>
      </SearchTarget>
      <SearchTarget
        label='Seats'
        id='seats-extra'
        render={<article />}
      >
        <h3>Extra seats</h3>
      </SearchTarget>
    </>
  );
}

function SectionBody() {
  sectionBodyRenders(useIsSearchIndexing());
  return <p>Devices list</p>;
}

function IndexOnly() {
  return useIsSearchIndexing() ? <SearchTarget label='Index only' /> : null;
}

function Surface({
  initialPage = 'account',
  showPhone = true,
  searchable = true,
}: {
  initialPage?: string;
  showPhone?: boolean;
  searchable?: boolean;
}) {
  const [page, setPage] = React.useState(initialPage);
  return (
    <Profile.Root
      value={page}
      onValueChange={setPage}
    >
      <Profile.Title>User profile</Profile.Title>
      <Profile.Nav search={searchable ? searchPages : undefined}>
        <Profile.NavItem value='account'>Account</Profile.NavItem>
        <Profile.NavItem value='security'>Security</Profile.NavItem>
        <Profile.NavItem value='billing'>Billing</Profile.NavItem>
        <Profile.NavItem value='usage'>Usage</Profile.NavItem>
      </Profile.Nav>
      <Profile.Content pageTitle={pageTitles[page]}>
        <Profile.ContentPanel value='account'>
          <Titled keywords={['inbox']}>Email addresses</Titled>
          {showPhone ? <Titled>Phone numbers</Titled> : null}
        </Profile.ContentPanel>
        <Profile.ContentPanel value='security'>
          <Titled>Password</Titled>
          <Section.Root search={{ label: 'Active devices' }}>
            <SectionBody />
          </Section.Root>
          <IndexOnly />
        </Profile.ContentPanel>
        <Profile.ContentPanel value='billing'>Billing page</Profile.ContentPanel>
        <Profile.ContentPanel value='usage'>
          <UsagePage />
        </Profile.ContentPanel>
      </Profile.Content>
    </Profile.Root>
  );
}

function renderSurface(props: React.ComponentProps<typeof Surface> = {}) {
  return render(
    <MosaicProvider>
      <Surface {...props} />
    </MosaicProvider>,
  );
}

function renderSecurityPage(children: React.ReactNode) {
  return render(
    <MosaicProvider>
      <Profile.Root value='security'>
        <Profile.Title>User profile</Profile.Title>
        <Profile.Nav search={[{ value: 'security', label: 'Security' }]}>
          <Profile.NavItem value='security'>Security</Profile.NavItem>
        </Profile.Nav>
        <Profile.Content pageTitle='Security'>
          <Profile.ContentPanel value='security'>{children}</Profile.ContentPanel>
        </Profile.Content>
      </Profile.Root>
    </MosaicProvider>,
  );
}

function targetOf(title: string): HTMLElement {
  const target = screen.getByRole('heading', { name: title }).closest<HTMLElement>('.cl-profile-search-target');
  if (!target) {
    throw new Error(`No search target holds "${title}"`);
  }
  return target;
}

function resultsOf(group: HTMLElement) {
  return within(group)
    .getAllByRole('option')
    .map(option => option.textContent);
}

const scrollIntoView = vi.fn();

function scrolledTargets() {
  return scrollIntoView.mock.contexts.filter(
    element => element instanceof HTMLElement && element.classList.contains('cl-profile-search-target'),
  );
}

beforeEach(() => {
  scrollIntoView.mockClear();
  indexedRenders.mockClear();
  indexClosed.mockClear();
  sectionBodyRenders.mockClear();
  Element.prototype.scrollIntoView = scrollIntoView;
});

afterEach(() => {
  Reflect.deleteProperty(Element.prototype, 'scrollIntoView');
});

describe('Profile search', () => {
  it('shows the navigation until there is something to search for', async () => {
    const user = userEvent.setup();
    renderSurface();

    const search = screen.getByRole('combobox', { name: 'Search' });
    expect(screen.getByRole('tablist')).toBeVisible();

    await user.type(search, '   ');

    expect(screen.getByRole('tablist')).toBeVisible();
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('finds the sections a page renders, though the page is not open, grouped by page', async () => {
    const user = userEvent.setup();
    renderSurface();

    await user.type(screen.getByRole('combobox', { name: 'Search' }), 'PASS');

    expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
    const listbox = screen.getByRole('listbox');
    const groups = within(listbox).getAllByRole('group');
    expect(groups).toHaveLength(1);
    expect(groups[0]).toHaveAccessibleName('Security');
    expect(resultsOf(groups[0])).toEqual(['Password']);
    expect(within(listbox).getByText('Pass', { selector: 'mark' })).toBeInTheDocument();
    expect(screen.queryByText('No results')).not.toBeInTheDocument();
  });

  it('finds the targets of a page of your own', async () => {
    const user = userEvent.setup();
    renderSurface();

    await user.type(screen.getByRole('combobox', { name: 'Search' }), 'seats');

    expect(resultsOf(screen.getByRole('group', { name: 'Usage' }))).toEqual(['Seats', 'Seats']);
  });

  it('finds a target inside a section that is not a target itself', async () => {
    const user = userEvent.setup();
    renderSecurityPage(
      <Section.Root>
        <SearchTarget label='Recovery codes' />
      </Section.Root>,
    );

    await user.type(screen.getByRole('combobox', { name: 'Search' }), 'recovery');

    expect(screen.getByRole('option', { name: 'Recovery codes' })).toBeInTheDocument();
  });

  it('finds a section by its keywords', async () => {
    const user = userEvent.setup();
    renderSurface();

    await user.type(screen.getByRole('combobox', { name: 'Search' }), 'throttle');

    expect(resultsOf(screen.getByRole('group', { name: 'Usage' }))).toEqual(['Rate limits']);
  });

  it('lists a page whose name or keywords match', async () => {
    const user = userEvent.setup();
    renderSurface();
    const search = screen.getByRole('combobox', { name: 'Search' });

    await user.type(search, 'bill');
    expect(resultsOf(screen.getByRole('group', { name: 'Billing' }))).toEqual(['Billing']);

    await user.clear(search);
    await user.type(search, 'invoices');
    expect(resultsOf(screen.getByRole('group', { name: 'Billing' }))).toEqual(['Billing']);
  });

  it('opens the chosen page when more than one page matches', async () => {
    const user = userEvent.setup();
    renderSurface();

    await user.type(screen.getByRole('combobox', { name: 'Search' }), 'plan');
    await user.click(screen.getByRole('option', { name: 'Billing' }));

    expect(screen.getByRole('tab', { name: 'Billing' })).toHaveAttribute('aria-selected', 'true');
  });

  it('does not find a section its page does not render', async () => {
    const user = userEvent.setup();
    renderSurface({ showPhone: false });

    await user.type(screen.getByRole('combobox', { name: 'Search' }), 'phone');

    expect(screen.getByText('No results')).toBeInTheDocument();
  });

  it('finds a section that appears while the search is open', async () => {
    const user = userEvent.setup();
    const reveals: (() => void)[] = [];
    function Later() {
      const [shown, setShown] = React.useState(false);
      reveals.push(() => setShown(true));
      return shown ? <Titled>Backup codes</Titled> : null;
    }
    render(
      <MosaicProvider>
        <Profile.Root value='account'>
          <Profile.Title>User profile</Profile.Title>
          <Profile.Nav search={[{ value: 'account', label: 'Account' }]}>
            <Profile.NavItem value='account'>Account</Profile.NavItem>
          </Profile.Nav>
          <Profile.Content pageTitle='Account'>
            <Profile.ContentPanel value='account'>
              <Later />
            </Profile.ContentPanel>
          </Profile.Content>
        </Profile.Root>
      </MosaicProvider>,
    );

    await user.type(screen.getByRole('combobox', { name: 'Search' }), 'backup');
    expect(screen.getByText('No results')).toBeInTheDocument();

    act(() => reveals.forEach(reveal => reveal()));

    expect(await screen.findByRole('option', { name: 'Backup codes' })).toBeInTheDocument();
  });

  it('follows a target whose label or keywords change while the search is open', async () => {
    const user = userEvent.setup();
    let advance = () => {};
    function Renamed() {
      const [step, setStep] = React.useState(0);
      advance = () => setStep(step + 1);
      return (
        <SearchTarget
          id='codes'
          label={step > 0 ? 'Recovery codes' : 'Backup codes'}
          keywords={step > 1 ? ['spare'] : []}
        />
      );
    }
    render(
      <MosaicProvider>
        <Profile.Root value='account'>
          <Profile.Title>User profile</Profile.Title>
          <Profile.Nav search={[{ value: 'account', label: 'Account' }]}>
            <Profile.NavItem value='account'>Account</Profile.NavItem>
          </Profile.Nav>
          <Profile.Content pageTitle='Account'>
            <Profile.ContentPanel value='account'>
              <Renamed />
            </Profile.ContentPanel>
          </Profile.Content>
        </Profile.Root>
      </MosaicProvider>,
    );
    const search = screen.getByRole('combobox', { name: 'Search' });

    await user.type(search, 'codes');
    expect(screen.getByRole('option', { name: 'Backup codes' })).toBeInTheDocument();

    act(() => advance());
    expect(await screen.findByRole('option', { name: 'Recovery codes' })).toBeInTheDocument();

    await user.clear(search);
    await user.type(search, 'spare');
    expect(screen.getByText('No results')).toBeInTheDocument();

    act(() => advance());
    expect(await screen.findByRole('option', { name: 'Recovery codes' })).toBeInTheDocument();
  });

  it('leaves out a page that throws while it is indexed, and keeps the rest', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const user = userEvent.setup();
    function Broken(): React.ReactNode {
      if (useIsSearchIndexing()) {
        throw new Error('Broken page');
      }
      return <p>Broken page content</p>;
    }
    render(
      <MosaicProvider>
        <Profile.Root value='account'>
          <Profile.Title>User profile</Profile.Title>
          <Profile.Nav
            search={[
              { value: 'account', label: 'Account' },
              { value: 'broken', label: 'Broken' },
            ]}
          >
            <Profile.NavItem value='account'>Account</Profile.NavItem>
            <Profile.NavItem value='broken'>Broken</Profile.NavItem>
          </Profile.Nav>
          <Profile.Content pageTitle='Account'>
            <Profile.ContentPanel value='account'>
              <Titled>Email addresses</Titled>
            </Profile.ContentPanel>
            <Profile.ContentPanel value='broken'>
              <Broken />
            </Profile.ContentPanel>
          </Profile.Content>
        </Profile.Root>
      </MosaicProvider>,
    );

    await user.type(screen.getByRole('combobox', { name: 'Search' }), 'email');

    expect(screen.getByRole('option', { name: 'Email addresses' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Email addresses' })).toBeInTheDocument();
  });

  it('says so when nothing matches', async () => {
    const user = userEvent.setup();
    renderSurface();

    await user.type(screen.getByRole('combobox', { name: 'Search' }), 'zzz');

    expect(screen.queryByRole('option')).not.toBeInTheDocument();
    expect(screen.getByText('No results')).toBeInTheDocument();
  });

  it('renders closed pages only while the search is in use, and never the body of a section', async () => {
    const user = userEvent.setup();
    renderSurface();
    expect(indexedRenders).not.toHaveBeenCalled();

    await user.click(screen.getByRole('combobox', { name: 'Search' }));
    expect(indexedRenders).toHaveBeenCalledWith(true);
    expect(sectionBodyRenders).not.toHaveBeenCalled();

    await user.tab();
    expect(indexClosed).toHaveBeenCalled();
    indexedRenders.mockClear();
    await user.click(screen.getByRole('tab', { name: 'Account' }));
    expect(indexedRenders).not.toHaveBeenCalled();
  });

  it('stops rendering closed pages once the search goes away', async () => {
    const user = userEvent.setup();
    const { rerender } = renderSurface();
    await user.type(screen.getByRole('combobox', { name: 'Search' }), 'seat');
    expect(indexClosed).not.toHaveBeenCalled();

    rerender(
      <MosaicProvider>
        <Surface searchable={false} />
      </MosaicProvider>,
    );

    expect(indexClosed).toHaveBeenCalled();
  });

  it('opens the page of a chosen section and brings the section itself into view', async () => {
    const user = userEvent.setup();
    renderSurface();
    const search = screen.getByRole('combobox', { name: 'Search' });

    await user.type(search, 'devices');
    await user.click(screen.getByRole('option', { name: 'Active devices' }));

    expect(screen.getByRole('tab', { name: 'Security' })).toHaveAttribute('aria-selected', 'true');
    expect(search).toHaveValue('');
    expect(screen.getByRole('tablist')).toBeVisible();
    const target = screen.getByText('Devices list').parentElement;
    expect(target?.tagName).toBe('SECTION');
    expect(target).toHaveClass('cl-section', 'cl-profile-search-target');
    expect(scrolledTargets()).toEqual([target]);
    expect(target).toHaveFocus();
    expect(target).toHaveAttribute('data-highlighted');
    expect(targetOf('Password')).not.toHaveAttribute('data-highlighted');
    expect(sectionBodyRenders).not.toHaveBeenCalledWith(true);
  });

  it('keeps targets out of the tab order', () => {
    renderSurface();

    expect(targetOf('Phone numbers')).toHaveAttribute('tabindex', '-1');
  });

  it('scrolls the chosen target into view, at once when motion is reduced', async () => {
    const user = userEvent.setup();
    const focus = vi.spyOn(HTMLElement.prototype, 'focus');
    renderSurface();
    const search = screen.getByRole('combobox', { name: 'Search' });

    await user.type(search, 'phone');
    await user.click(screen.getByRole('option', { name: 'Phone numbers' }));
    expect(scrollIntoView).toHaveBeenLastCalledWith({ behavior: 'smooth', block: 'start' });
    expect(focus).toHaveBeenLastCalledWith({ preventScroll: true });

    vi.stubGlobal(
      'matchMedia',
      vi.fn((query: string) => ({ matches: query === '(prefers-reduced-motion: reduce)' })),
    );
    await user.type(search, 'email');
    await user.click(screen.getByRole('option', { name: 'Email addresses' }));
    expect(scrollIntoView).toHaveBeenLastCalledWith({ behavior: 'auto', block: 'start' });
  });

  it('makes the element passed as `render` the target', async () => {
    const user = userEvent.setup();
    renderSurface();

    await user.type(screen.getByRole('combobox', { name: 'Search' }), 'rate');
    await user.click(screen.getByRole('option', { name: 'Rate limits' }));

    const target = targetOf('Rate limits');
    expect(target.tagName).toBe('ARTICLE');
    expect(target).toHaveClass('usage-card');
    expect(screen.getByRole('heading', { name: 'Rate limits' }).parentElement).toBe(target);
    expect(target).toHaveFocus();
    expect(target).toHaveAttribute('data-highlighted');
  });

  it('tells apart targets that share a label by their id', async () => {
    const user = userEvent.setup();
    renderSurface();

    await user.type(screen.getByRole('combobox', { name: 'Search' }), 'seats');
    await user.click(screen.getAllByRole('option', { name: 'Seats' })[1]);

    expect(targetOf('Extra seats')).toHaveFocus();
  });

  it('brings a section on the open page into view', async () => {
    const user = userEvent.setup();
    renderSurface();

    await user.type(screen.getByRole('combobox', { name: 'Search' }), 'phone');
    await user.click(screen.getByRole('option', { name: 'Phone numbers' }));

    expect(screen.getByRole('tab', { name: 'Account' })).toHaveAttribute('aria-selected', 'true');
    expect(targetOf('Phone numbers')).toHaveFocus();
    expect(targetOf('Phone numbers')).toHaveAttribute('data-highlighted');
  });

  it('clears the highlight once its animation ends', async () => {
    const user = userEvent.setup();
    renderSurface();

    await user.type(screen.getByRole('combobox', { name: 'Search' }), 'phone');
    await user.click(screen.getByRole('option', { name: 'Phone numbers' }));
    act(() => {
      document
        .querySelector('.cl-profile-search-highlight')
        ?.dispatchEvent(new Event('animationend', { bubbles: true }));
    });

    expect(targetOf('Phone numbers')).not.toHaveAttribute('data-highlighted');
    expect(document.querySelector('.cl-profile-search-highlight')).toBeNull();
  });

  it('keeps the highlight when an animation inside the target ends', async () => {
    const user = userEvent.setup();
    renderSurface();

    await user.type(screen.getByRole('combobox', { name: 'Search' }), 'phone');
    await user.click(screen.getByRole('option', { name: 'Phone numbers' }));
    act(() => {
      screen
        .getByRole('heading', { name: 'Phone numbers' })
        .dispatchEvent(new Event('animationend', { bubbles: true }));
    });

    expect(targetOf('Phone numbers')).toHaveAttribute('data-highlighted');
  });

  it('chooses the active result with the keyboard', async () => {
    const user = userEvent.setup();
    renderSurface();

    await user.type(screen.getByRole('combobox', { name: 'Search' }), 'numbers');
    await user.keyboard('{ArrowDown}{Enter}');

    expect(screen.getByRole('tab', { name: 'Account' })).toHaveAttribute('aria-selected', 'true');
    expect(targetOf('Phone numbers')).toHaveFocus();
  });

  it('focuses the page title when a page is chosen', async () => {
    const user = userEvent.setup();
    renderSurface();

    await user.type(screen.getByRole('combobox', { name: 'Search' }), 'bill');
    await user.click(screen.getByRole('option', { name: 'Billing' }));

    expect(screen.getByRole('tab', { name: 'Billing' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('heading', { name: 'Billing' })).toHaveFocus();
    expect(scrolledTargets()).toEqual([]);
  });

  it('falls back to the page title when the chosen section is not on the page', async () => {
    const user = userEvent.setup();
    renderSurface();

    await user.type(screen.getByRole('combobox', { name: 'Search' }), 'index only');
    await user.click(screen.getByRole('option', { name: 'Index only' }));

    expect(screen.getByRole('heading', { name: 'Security' })).toHaveFocus();
    expect(scrolledTargets()).toEqual([]);
  });

  it('falls back to the page title when the chosen section has left the page', async () => {
    const user = userEvent.setup();
    const retires: (() => void)[] = [];
    function Retired() {
      const [retired, setRetired] = React.useState(false);
      retires.push(() => setRetired(true));
      return useIsSearchIndexing() || !retired ? <Titled>Old devices</Titled> : null;
    }
    renderSecurityPage(<Retired />);

    act(() => retires.forEach(retire => retire()));
    await user.type(screen.getByRole('combobox', { name: 'Search' }), 'old');
    await user.click(screen.getByRole('option', { name: 'Old devices' }));

    expect(screen.getByRole('heading', { name: 'Security' })).toHaveFocus();
    expect(scrolledTargets()).toEqual([]);
  });

  it('clears the search on Escape, and leaves the dialog open', async () => {
    const user = userEvent.setup();
    render(
      <MosaicProvider>
        <Dialog.Root defaultOpen>
          <Dialog.Popup variant='profile'>
            <Surface />
          </Dialog.Popup>
        </Dialog.Root>
      </MosaicProvider>,
    );
    const search = screen.getByRole('combobox', { name: 'Search' });

    await user.type(search, 'pass');
    await user.keyboard('{Escape}');

    expect(search).toHaveValue('');
    expect(screen.getByRole('dialog', { name: 'User profile' })).toBeInTheDocument();

    await user.keyboard('{Escape}');

    expect(screen.queryByRole('dialog', { name: 'User profile' })).not.toBeInTheDocument();
  });

  it('clears the search from its clear button', async () => {
    const user = userEvent.setup();
    renderSurface();
    const search = screen.getByRole('combobox', { name: 'Search' });

    await user.type(search, 'pass');
    await user.click(screen.getByRole('button', { name: 'Clear search' }));

    expect(search).toHaveValue('');
    expect(search).toHaveFocus();
    expect(screen.getByRole('tablist')).toBeVisible();
  });

  it('renders no search without pages to search', () => {
    render(
      <Profile.Root value='account'>
        <Profile.Title>User profile</Profile.Title>
        <Profile.Nav>
          <Profile.NavItem value='account'>Account</Profile.NavItem>
        </Profile.Nav>
        <Profile.Content pageTitle='Account'>
          <Profile.ContentPanel value='account'>Account page</Profile.ContentPanel>
        </Profile.Content>
      </Profile.Root>,
    );

    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });

  it('renders a target outside a profile as its element alone', () => {
    render(
      <SearchTarget
        label='Seats'
        render={<article />}
      >
        Seats
      </SearchTarget>,
    );

    expect(screen.getByText('Seats').tagName).toBe('ARTICLE');
  });

  describe('compact', () => {
    const original = globalThis.ResizeObserver;

    afterEach(() => {
      globalThis.ResizeObserver = original;
    });

    function reportWidth(width: number) {
      class FakeResizeObserver {
        private readonly callback: ResizeObserverCallback;
        constructor(callback: ResizeObserverCallback) {
          this.callback = callback;
        }
        observe(target: Element) {
          if (!target.classList.contains('cl-profile-sentinel')) {
            return;
          }
          Object.defineProperty(target, 'offsetWidth', { configurable: true, value: width });
          Object.defineProperty(target, 'offsetHeight', { configurable: true, value: 600 });
          this.callback([], this as unknown as ResizeObserver);
        }
        disconnect() {}
        unobserve() {}
      }
      globalThis.ResizeObserver = FakeResizeObserver as unknown as typeof ResizeObserver;
    }

    it.each([
      ['select', 2],
      ['sheet', 3],
    ])('renders no search in the %s layout', (_layout, width) => {
      reportWidth(width);

      renderSurface();

      expect(screen.queryByRole('combobox', { name: 'Search' })).not.toBeInTheDocument();
    });

    it('renders no search in the open sheet', async () => {
      const user = userEvent.setup();
      reportWidth(3);
      renderSurface();

      await user.click(screen.getByRole('button', { name: 'Account' }));

      expect(screen.getByRole('dialog', { name: 'User profile' })).toContainElement(screen.getByRole('tablist'));
      expect(screen.queryByRole('combobox', { name: 'Search' })).not.toBeInTheDocument();
    });
  });
});
