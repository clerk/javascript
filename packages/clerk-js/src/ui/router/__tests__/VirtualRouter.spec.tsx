import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { Route, useRouter, VirtualRouter } from '..';

const mockNavigate = vi.fn();

vi.mock('@clerk/shared/react', () => ({
  useClerk: () => ({
    navigate: vi.fn(to => {
      mockNavigate(to);
      if (to) {
        // @ts-ignore
        window.location = new URL(to, window.location.origin);
      }
      return Promise.resolve();
    }),
  }),
}));

const Button = ({ to, children }: React.PropsWithChildren<{ to: string }>) => {
  const router = useRouter();
  return (
    <button
      onClick={() => {
        void router.navigate(to);
      }}
    >
      {children}
    </button>
  );
};
const ShowPreserved = () => {
  const { queryParams } = useRouter();
  return <div>{`preserved=${queryParams.preserved}`}</div>;
};
const Tester = () => (
  <VirtualRouter
    preservedParams={['preserved']}
    startPath={'/' + ''}
  >
    <Route index>
      <div id='index'>Index</div>
      <Button to='created?preserved=1'>Create</Button>
    </Route>
    <Route path='created'>
      <div>Created</div>
      <Button to='../preserved'>Preserve</Button>
    </Route>
    <Route path='preserved'>
      <ShowPreserved />
    </Route>
  </VirtualRouter>
);

describe('VirtualRouter', () => {
  const oldWindowLocation = window.location;

  beforeAll(() => {
    // @ts-ignore
    delete window.location;
  });

  afterAll(() => {
    window.location = oldWindowLocation;
  });

  beforeEach(() => {
    mockNavigate.mockReset();
  });

  describe('when mounted', () => {
    beforeEach(() => {
      // @ts-ignore
      window.location = new URL('https://www.example.com/virtual');
    });

    it('it loads the start path', async () => {
      render(<Tester />);
      expect(screen.queryByText('Index')).toBeInTheDocument();
    });
  });

  describe('when a preserved query param is created internally', () => {
    beforeEach(() => {
      // @ts-ignore
      window.location = new URL('https://www.example.com/virtual');
    });

    it('preserves the param for internal navigation', async () => {
      render(<Tester />);
      const createButton = screen.getByRole('button', { name: /Create/i });
      expect(createButton).toBeInTheDocument();
      await userEvent.click(createButton);
      const preserveButton = screen.getByText(/Preserve/i);
      expect(preserveButton).toBeInTheDocument();
      await userEvent.click(preserveButton);
      expect(screen.queryByText('preserved=1')).toBeInTheDocument();
    });
  });
});
