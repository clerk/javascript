import type { CustomPage } from '@clerk/shared/types';
import { act, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import type { CustomPagesOptions, CustomProfileItem } from '../user-button.pages';
import { useCustomPages } from '../user-button.pages';

// The bridge's other half lives in clerk-js: `ExternalElementMounter` renders a `div` and hands it to
// `mount`, then hands it back to `unmount` when the profile goes away. These stand in for it, so the
// tests exercise the same handshake the real modal performs.
function mountInto(callback: ((el: HTMLDivElement) => void) | undefined): HTMLDivElement {
  const el = document.createElement('div');
  document.body.appendChild(el);
  act(() => callback?.(el));
  return el;
}

function unmountFrom(callback: ((el?: HTMLDivElement) => void) | undefined, el: HTMLDivElement) {
  act(() => callback?.(el));
  el.remove();
}

let emitted: CustomPage[] | undefined;

function Harness({ items, order, builtInPages = ['account', 'security'] }: Partial<CustomPagesOptions>) {
  const { customPages, portals } = useCustomPages({ items, order, builtInPages });
  emitted = customPages;
  return <div data-testid='host'>{portals}</div>;
}

const terms: CustomProfileItem = {
  label: 'Terms',
  path: 'terms',
  icon: <span>terms icon</span>,
  content: <p>Terms body</p>,
};

const docs: CustomProfileItem = {
  label: 'Docs',
  path: 'docs',
  href: 'https://clerk.com/docs',
  icon: <span>docs icon</span>,
};

beforeEach(() => {
  emitted = undefined;
});

describe('useCustomPages', () => {
  it('sends nothing when there are no custom pages', () => {
    render(<Harness />);

    expect(emitted).toBeUndefined();
    expect(screen.getByTestId('host')).toBeEmptyDOMElement();
  });

  it('sends a page as its path and a link as its href', () => {
    render(<Harness items={[terms, docs]} />);

    expect(emitted?.map(page => page.url)).toEqual(['terms', 'https://clerk.com/docs']);
    expect(emitted?.map(page => page.label)).toEqual(['Terms', 'Docs']);
  });

  // clerk-js tells a page from a link by which callbacks are present, so content callbacks are what
  // make an item a page. A link carrying them would be routed to instead of followed.
  it('sends content callbacks for a page and none for a link', () => {
    render(<Harness items={[terms, docs]} />);

    const [page, link] = emitted ?? [];
    expect(page.mount).toBeTypeOf('function');
    expect(page.unmount).toBeTypeOf('function');
    expect(link.mount).toBeUndefined();
    expect(link.unmount).toBeUndefined();
  });

  // Without them clerk-js drops the page as invalid, so `icon` could not be optional.
  it('sends the icon callbacks even for an item with no icon', () => {
    render(<Harness items={[{ label: 'Terms', path: 'terms', content: <p>Terms body</p> }]} />);

    const [page] = emitted ?? [];
    expect(page.mountIcon).toBeTypeOf('function');
    expect(page.unmountIcon).toBeTypeOf('function');

    const el = mountInto(page.mountIcon);
    expect(el).toBeEmptyDOMElement();
  });

  it('renders page content into the element clerk-js hands back', () => {
    render(<Harness items={[terms]} />);

    const el = mountInto(emitted?.[0].mount);

    expect(within(el).getByText('Terms body')).toBeInTheDocument();
  });

  it('renders an icon into its own element, apart from the content', () => {
    render(<Harness items={[terms]} />);

    const content = mountInto(emitted?.[0].mount);
    const icon = mountInto(emitted?.[0].mountIcon);

    expect(within(icon).getByText('terms icon')).toBeInTheDocument();
    expect(within(content).queryByText('terms icon')).toBeNull();
  });

  it('keeps each page in the element that asked for it', () => {
    const help: CustomProfileItem = { label: 'Help', path: 'help', content: <p>Help body</p> };
    render(<Harness items={[terms, help]} />);

    const first = mountInto(emitted?.[0].mount);
    const second = mountInto(emitted?.[1].mount);

    expect(within(first).getByText('Terms body')).toBeInTheDocument();
    expect(within(second).getByText('Help body')).toBeInTheDocument();
  });

  it('stops rendering content once clerk-js gives the element back', () => {
    render(<Harness items={[terms]} />);

    const el = mountInto(emitted?.[0].mount);
    expect(within(el).getByText('Terms body')).toBeInTheDocument();

    unmountFrom(emitted?.[0].unmount, el);

    expect(screen.queryByText('Terms body')).toBeNull();
  });

  // The profile is opened once with the callbacks from that render, and never handed a later set.
  // They have to keep working against the current content, or a page re-rendered while the profile
  // is open goes stale.
  it('renders updated content through the callbacks the profile was opened with', () => {
    const { rerender } = render(<Harness items={[terms]} />);
    const el = mountInto(emitted?.[0].mount);

    rerender(<Harness items={[{ ...terms, content: <p>Revised terms</p> }]} />);

    expect(within(el).getByText('Revised terms')).toBeInTheDocument();
  });

  describe('order', () => {
    it('leaves the built-in pages alone when no order is given', () => {
      render(<Harness items={[terms, docs]} />);

      expect(emitted?.map(page => page.label)).toEqual(['Terms', 'Docs']);
    });

    it('sends the pages in the order it was given', () => {
      render(
        <Harness
          items={[terms, docs]}
          order={['security', 'terms', 'account', 'docs']}
        />,
      );

      expect(emitted?.map(page => page.label)).toEqual(['security', 'Terms', 'account', 'Docs']);
    });

    // Anything more than the id and clerk-js reads it as a custom page.
    it('sends a built-in page as its id alone', () => {
      render(<Harness order={['security', 'account']} />);

      expect(emitted).toEqual([{ label: 'security' }, { label: 'account' }]);
    });

    // Unsent built-ins jump to the front, so one left out of the order would not stay put.
    it('sends the pages left out of the order after the ones in it', () => {
      render(
        <Harness
          items={[terms, docs]}
          builtInPages={['account', 'security', 'billing']}
          order={['terms']}
        />,
      );

      expect(emitted?.map(page => page.label)).toEqual(['Terms', 'account', 'security', 'billing', 'Docs']);
    });

    it('drops an id that belongs to no page', () => {
      render(
        <Harness
          items={[terms]}
          order={['billing', 'terms']}
        />,
      );

      expect(emitted?.map(page => page.label)).toEqual(['Terms', 'account', 'security']);
    });

    it('sends a page once even when the order names it twice', () => {
      render(<Harness order={['security', 'account', 'security']} />);

      expect(emitted?.map(page => page.label)).toEqual(['security', 'account']);
    });

    it('renders a reordered page into the element clerk-js hands back', () => {
      render(
        <Harness
          items={[terms]}
          order={['account', 'terms']}
        />,
      );

      const el = mountInto(emitted?.[1].mount);

      expect(within(el).getByText('Terms body')).toBeInTheDocument();
    });
  });
});
