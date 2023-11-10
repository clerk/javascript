import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import type Clerk from '../../../core/clerk';
import { PathRouter, Route, useRouter } from '..';

const mockNavigate = jest.fn();

jest.mock('ui/contexts', () => {
  return {
    useCoreClerk: () => {
      return {
        navigate: (to: string) => {
          mockNavigate(to);
          if (to) {
            // @ts-ignore
            window.location = new URL(to, window.location.origin);
          }
          return Promise.resolve();
        },
      } as Clerk;
    },
  };
});

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

const Tester = () => (
  <PathRouter
    preservedParams={['preserved']}
    basePath='/foo'
  >
    <Route path='bar'>
      <Button to='../baz'>Internal</Button>
      <Button to='../../'>External</Button>
    </Route>
  </PathRouter>
);

describe('PathRouter', () => {
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

  describe('when hash has a path included in it', () => {
    beforeEach(() => {
      // @ts-ignore
      window.location = new URL('https://www.example.com/foo#/bar');
    });

    it('adds the hash path to the primary path', async () => {
      render(<Tester />);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenNthCalledWith(1, '/foo/bar');
      });
    });
  });

  describe('when query has a preservedParam', () => {
    beforeEach(() => {
      // @ts-ignore
      window.location = new URL('https://www.example.com/foo/bar?preserved=1');
    });

    it('preserves the param for internal navigation', async () => {
      render(<Tester />);

      const button = screen.getByRole('button', { name: /Internal/i });
      await userEvent.click(button);

      expect(mockNavigate).toHaveBeenNthCalledWith(1, '/foo/baz?preserved=1');
    });

    it('removes the param for external navigation', async () => {
      render(<Tester />);

      const button = screen.getByRole('button', { name: /External/i });
      await userEvent.click(button);

      expect(mockNavigate).toHaveBeenNthCalledWith(1, 'https://www.example.com/');
    });
  });
});
