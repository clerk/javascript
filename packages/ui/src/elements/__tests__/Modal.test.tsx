import { describe, expect, it } from 'vitest';

import { bindCreateFixtures, render, screen } from '@/test/utils';

import { Header } from '../Header';
import { Modal } from '../Modal';

const { createFixtures } = bindCreateFixtures('UserProfile');

describe('Modal', () => {
  it('is named after the Header.Title rendered inside it', async () => {
    const { wrapper } = await createFixtures();

    render(
      <Modal>
        <Header.Title>Verification required</Header.Title>
      </Modal>,
      { wrapper },
    );

    const dialog = await screen.findByRole('dialog', { name: 'Verification required' });
    const title = screen.getByRole('heading', { name: 'Verification required' });
    expect(dialog).toHaveAttribute('aria-labelledby', title.id);
  });

  it('updates its name when the title is swapped', async () => {
    const { wrapper } = await createFixtures();

    const { rerender } = render(
      <Modal>
        <Header.Title key='first'>First title</Header.Title>
      </Modal>,
      { wrapper },
    );

    expect(await screen.findByRole('dialog', { name: 'First title' })).toBeInTheDocument();

    rerender(
      <Modal>
        <Header.Title key='second'>Second title</Header.Title>
      </Modal>,
    );

    expect(await screen.findByRole('dialog', { name: 'Second title' })).toBeInTheDocument();
  });

  it('is named after the first title when more than one is rendered', async () => {
    const { wrapper } = await createFixtures();

    render(
      <Modal>
        <Header.Title>Primary title</Header.Title>
        <Header.Title>Secondary title</Header.Title>
      </Modal>,
      { wrapper },
    );

    expect(await screen.findByRole('dialog', { name: 'Primary title' })).toBeInTheDocument();
  });

  it('does not set aria-labelledby when there is no title', async () => {
    const { wrapper } = await createFixtures();

    render(
      <Modal>
        <div>Content</div>
      </Modal>,
      { wrapper },
    );

    const dialog = await screen.findByRole('dialog');
    expect(dialog).not.toHaveAttribute('aria-labelledby');
  });

  it('does not add an id to a Header.Title rendered outside a Modal', async () => {
    const { wrapper } = await createFixtures();

    render(<Header.Title>Standalone title</Header.Title>, { wrapper });

    expect(screen.getByRole('heading', { name: 'Standalone title' })).not.toHaveAttribute('id');
  });
});
