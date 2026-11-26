import { cleanup, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, onTestFinished } from 'vitest';
import { page } from 'vitest/browser';

import { Button } from '../../button';
import { Dialog } from '../../dialog';
import { Flow } from '../../flow';
import { Card } from '..';

afterEach(() => cleanup());

describe('Card.Media', () => {
  it('leaves 24px between the media and the title', () => {
    render(
      <Card.Root renderBranding={false}>
        <Card.Header>
          <Card.Media data-testid='media'>
            <svg
              width='32'
              height='32'
            />
          </Card.Media>
          <Card.Title data-testid='title'>Title</Card.Title>
          <Card.Description>Description</Card.Description>
        </Card.Header>
      </Card.Root>,
    );

    const mediaBottom = screen.getByTestId('media').getBoundingClientRect().bottom;
    const titleTop = screen.getByTestId('title').getBoundingClientRect().top;

    expect(titleTop - mediaBottom).toBe(24);
  });
});

describe('Card.Root align', () => {
  function CenteredCard() {
    return (
      <Card.Root
        align='center'
        renderBranding={false}
        data-testid='root'
      >
        <Card.Header>
          <Card.Media data-testid='media'>
            <svg
              width='32'
              height='32'
            />
          </Card.Media>
          <Card.Title>
            <span data-testid='title'>Title</span>
          </Card.Title>
        </Card.Header>
      </Card.Root>
    );
  }

  function expectCentered(testId: string) {
    const root = screen.getByTestId('root').getBoundingClientRect();
    const part = screen.getByTestId(testId).getBoundingClientRect();
    expect(part.left + part.width / 2).toBeCloseTo(root.left + root.width / 2, 0);
  }

  it('centers the media and title in the card', () => {
    render(<CenteredCard />);

    expectCentered('media');
    expectCentered('title');
  });

  it('keeps a description that does not wrap inside the card', () => {
    render(
      <Card.Root
        align='center'
        renderBranding={false}
        data-testid='root'
      >
        <Card.Header>
          <Card.Title>
            <span data-testid='title'>Title</span>
          </Card.Title>
          <Card.Description
            data-testid='description'
            style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
          >
            {'jane@acme.com'.repeat(12)}
          </Card.Description>
        </Card.Header>
      </Card.Root>,
    );

    const root = screen.getByTestId('root').getBoundingClientRect();
    const description = screen.getByTestId('description').getBoundingClientRect();
    expect(description.left).toBeGreaterThanOrEqual(root.left);
    expect(description.right).toBeLessThanOrEqual(root.right);
    expectCentered('title');
  });

  it('keeps them centered in the card beside the dialog close button', () => {
    render(
      <Dialog.Root defaultOpen>
        <Dialog.Popup>
          <CenteredCard />
        </Dialog.Popup>
      </Dialog.Root>,
    );

    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
    expectCentered('media');
    expectCentered('title');
  });
});

describe('Card.Footer divider', () => {
  function renderInDialog(node: ReactNode) {
    return render(
      <Dialog.Root defaultOpen>
        <Dialog.Popup>{node}</Dialog.Popup>
      </Dialog.Root>,
    );
  }

  function borderTop(testId: string) {
    return getComputedStyle(screen.getByTestId(testId)).borderTopWidth;
  }

  function Header() {
    return (
      <Card.Header>
        <Card.Title>Title</Card.Title>
      </Card.Header>
    );
  }

  function FlowCard({ step, footer }: { step: ReactNode; footer?: ReactNode }) {
    return (
      <Card.Root
        size='lg'
        renderBranding={false}
      >
        <Flow.Root
          value='only'
          state={null}
        >
          {() => <Flow.Step ids={['only']}>{step}</Flow.Step>}
        </Flow.Root>
        {footer}
      </Card.Root>
    );
  }

  it('draws a divider when the footer follows content', () => {
    renderInDialog(
      <Card.Root
        size='lg'
        renderBranding={false}
      >
        <Header />
        <Card.Content>Body</Card.Content>
        <Card.Footer data-testid='footer'>Footer</Card.Footer>
      </Card.Root>,
    );

    expect(borderTop('footer')).toBe('1px');
  });

  it('draws no divider when the footer directly follows the header', () => {
    renderInDialog(
      <Card.Root
        size='lg'
        renderBranding={false}
      >
        <Header />
        <Card.Footer data-testid='footer'>Footer</Card.Footer>
      </Card.Root>,
    );

    expect(borderTop('footer')).toBe('0px');
  });

  it('draws no divider when the footer directly follows the header inside a flow step', () => {
    renderInDialog(
      <FlowCard
        step={
          <>
            <Header />
            <Card.Footer data-testid='footer'>Footer</Card.Footer>
          </>
        }
      />,
    );

    expect(borderTop('footer')).toBe('0px');
  });

  it('draws a divider when the footer follows a flow whose step has content', () => {
    renderInDialog(
      <FlowCard
        step={
          <>
            <Header />
            <Card.Content>Body</Card.Content>
          </>
        }
        footer={<Card.Footer data-testid='footer'>Footer</Card.Footer>}
      />,
    );

    expect(borderTop('footer')).toBe('1px');
  });

  it('draws a divider on a step footer and on the card footer after it', () => {
    renderInDialog(
      <FlowCard
        step={
          <>
            <Header />
            <Card.Content>Body</Card.Content>
            <Card.Footer data-testid='step-footer'>Step</Card.Footer>
          </>
        }
        footer={<Card.Footer data-testid='card-footer'>Card</Card.Footer>}
      />,
    );

    expect(borderTop('step-footer')).toBe('1px');
    expect(borderTop('card-footer')).toBe('1px');
  });

  it('draws no divider when the footer follows a flow whose step is only a header', () => {
    renderInDialog(
      <FlowCard
        step={<Header />}
        footer={<Card.Footer data-testid='footer'>Footer</Card.Footer>}
      />,
    );

    expect(borderTop('footer')).toBe('0px');
  });

  it('draws no divider on a card that is the page rather than a dialog', () => {
    render(
      <Card.Root renderBranding={false}>
        <Header />
        <Card.Content>Body</Card.Content>
        <Card.Footer data-testid='footer'>Footer</Card.Footer>
      </Card.Root>,
    );

    expect(borderTop('footer')).toBe('0px');
  });

  it('draws a divider in a medium dialog, as in a large one', () => {
    renderInDialog(
      <Card.Root renderBranding={false}>
        <Header />
        <Card.Content>Body</Card.Content>
        <Card.Footer data-testid='footer'>Footer</Card.Footer>
      </Card.Root>,
    );

    expect(borderTop('footer')).toBe('1px');
  });
});

describe('Card.Footer in a dialog', () => {
  function DialogCard() {
    return (
      <Dialog.Root defaultOpen>
        <Dialog.Popup>
          <Card.Root renderBranding={false}>
            <Card.Header>
              <Card.Title>Edit name</Card.Title>
            </Card.Header>
            <Card.Footer>
              <Button
                variant='outline'
                color='neutral'
              >
                Cancel
              </Button>
              <Button>Save</Button>
            </Card.Footer>
          </Card.Root>
        </Dialog.Popup>
      </Dialog.Root>
    );
  }

  const top = (name: string) => screen.getByRole('button', { name }).getBoundingClientRect().top;

  it('shares the row on a wide screen', async () => {
    await page.viewport(1280, 800);
    onTestFinished(() => page.viewport(414, 896));
    render(<DialogCard />);

    expect(top('Save')).toBe(top('Cancel'));
  });

  it('stacks with the primary on top on a phone', async () => {
    await page.viewport(390, 844);
    onTestFinished(() => page.viewport(414, 896));
    render(<DialogCard />);

    expect(top('Save')).toBeLessThan(top('Cancel'));
  });

  it('keeps each button at its full height when they stack on a phone', async () => {
    await page.viewport(1280, 800);
    const { unmount } = render(<DialogCard />);
    const height = screen.getByRole('button', { name: 'Save' }).getBoundingClientRect().height;
    unmount();
    await page.viewport(390, 844);
    onTestFinished(() => page.viewport(414, 896));
    render(<DialogCard />);

    expect(screen.getByRole('button', { name: 'Save' }).getBoundingClientRect().height).toBe(height);
    expect(screen.getByRole('button', { name: 'Cancel' }).getBoundingClientRect().height).toBe(height);
  });
});

describe('Card.Root variant', () => {
  function edges(testId: string) {
    const root = screen.getByTestId('root').getBoundingClientRect();
    const part = screen.getByTestId(testId).getBoundingClientRect();
    return { top: part.top - root.top, left: part.left - root.left, right: root.right - part.right };
  }

  function PageCard({ variant }: { variant?: 'default' | 'prominent' }) {
    return (
      <Card.Root
        variant={variant}
        data-testid='root'
      >
        <Card.Header>
          <Card.Title data-testid='title'>Sign in to Acme</Card.Title>
        </Card.Header>
        <Card.Content data-testid='content'>
          <span>Body</span>
        </Card.Content>
        <Card.Footer data-testid='footer'>
          <span>Prompt</span>
        </Card.Footer>
      </Card.Root>
    );
  }

  it('keeps the default insets', () => {
    render(<PageCard />);

    expect(edges('title').top).toBe(16);
    expect(edges('content').left).toBe(0);
    expect(getComputedStyle(screen.getByTestId('content')).paddingInlineStart).toBe('20px');
    expect(getComputedStyle(screen.getByTestId('title')).fontSize).toBe('16px');
  });

  it('gives a prominent card wider insets, a larger title and an unfilled, borderless footer', () => {
    render(<PageCard variant='prominent' />);

    expect(edges('title').top).toBe(32);
    expect(getComputedStyle(screen.getByTestId('content')).paddingInlineStart).toBe('32px');
    expect(getComputedStyle(screen.getByTestId('footer')).paddingInlineStart).toBe('32px');
    expect(getComputedStyle(screen.getByTestId('title')).fontSize).toBe('20px');
    expect(getComputedStyle(screen.getByTestId('footer')).borderTopWidth).toBe('0px');
    expect(getComputedStyle(screen.getByTestId('footer')).backgroundColor).toBe('rgba(0, 0, 0, 0)');
  });

  it('falls back to the default inline insets on a compact prominent card', () => {
    render(
      <div style={{ width: '22rem' }}>
        <PageCard variant='prominent' />
      </div>,
    );

    expect(getComputedStyle(screen.getByTestId('content')).paddingInlineStart).toBe('20px');
  });
});

describe('Card.Lead', () => {
  it('sits at the top inset and pulls the header up to 24px beneath it', () => {
    render(
      <Card.Root
        variant='prominent'
        renderBranding={false}
        data-testid='root'
      >
        <Card.Lead data-testid='lead'>
          <svg
            width='48'
            height='48'
          />
        </Card.Lead>
        <Card.Header>
          <Card.Title data-testid='title'>Title</Card.Title>
        </Card.Header>
      </Card.Root>,
    );

    const root = screen.getByTestId('root').getBoundingClientRect();
    const lead = screen.getByTestId('lead').getBoundingClientRect();
    const title = screen.getByTestId('title').getBoundingClientRect();
    expect(lead.top - root.top).toBe(0);
    expect(getComputedStyle(screen.getByTestId('lead')).paddingTop).toBe('32px');
    expect(title.top - lead.bottom).toBe(24);
  });

  it('keeps the header under it when the header sits inside a flow step', () => {
    render(
      <Card.Root
        renderBranding={false}
        data-testid='root'
      >
        <Card.Lead data-testid='lead'>
          <svg
            width='48'
            height='48'
          />
        </Card.Lead>
        <Flow.Root
          value='one'
          state={null}
        >
          {() => (
            <Flow.Step ids={['one']}>
              <Card.Header>
                <Card.Title data-testid='title'>Title</Card.Title>
              </Card.Header>
            </Flow.Step>
          )}
        </Flow.Root>
      </Card.Root>,
    );

    const lead = screen.getByTestId('lead').getBoundingClientRect();
    const title = screen.getByTestId('title').getBoundingClientRect();
    expect(title.top - lead.bottom).toBe(20);
  });
});
