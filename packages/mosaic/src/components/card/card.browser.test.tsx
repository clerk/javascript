import { cleanup, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it } from 'vitest';

import { Dialog } from '../dialog';
import { Flow } from '../flow';
import { Card } from './card';

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
      <Card.Root renderBranding={false}>
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
    render(
      <Card.Root renderBranding={false}>
        <Header />
        <Card.Content>Body</Card.Content>
        <Card.Footer data-testid='footer'>Footer</Card.Footer>
      </Card.Root>,
    );

    expect(borderTop('footer')).toBe('1px');
  });

  it('draws no divider when the footer directly follows the header', () => {
    render(
      <Card.Root renderBranding={false}>
        <Header />
        <Card.Footer data-testid='footer'>Footer</Card.Footer>
      </Card.Root>,
    );

    expect(borderTop('footer')).toBe('0px');
  });

  it('draws no divider when the footer directly follows the header inside a flow step', () => {
    render(
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
    render(
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
    render(
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
    render(
      <FlowCard
        step={<Header />}
        footer={<Card.Footer data-testid='footer'>Footer</Card.Footer>}
      />,
    );

    expect(borderTop('footer')).toBe('0px');
  });
});
