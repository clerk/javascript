import { render, screen, userEvent } from '@clerk/shared/testUtils';
import React from 'react';

import type Clerk from '../../../core/clerk';
import { HashRouter, Route, useRouter } from '..';

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
  <HashRouter preservedParams={['preserved']}>
    <Route index>
      <div id='index'>Index</div>
      <Button to='foo'>Internal</Button>
      <Button to='/external'>External</Button>
    </Route>
    <Route path='foo'>
      <div id='bar'>Bar</div>
    </Route>
  </HashRouter>
);

describe('HashRouter', () => {
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
      window.location = new URL('https://www.example.com/hash#/foo');
    });

    it('loads that path', () => {
      // Wrap this is an await because we need a state update with the path change
      render(<Tester />);

      expect(mockNavigate).not.toHaveBeenCalled();
      expect(screen.queryByText('Bar')).toBeInTheDocument();
    });
  });

  describe('when query has a preservedParam', () => {
    beforeEach(() => {
      // @ts-ignore
      window.location = new URL('https://www.example.com/hash#/?preserved=1');
    });

    it('preserves the param for internal navigation', async () => {
      render(<Tester />);

      const button = screen.getByRole('button', { name: /Internal/i });
      await userEvent.click(button);

      expect(window.location.hash).toBe('#/foo?preserved=1');
      expect(screen.queryByText('Bar')).toBeInTheDocument();
    });

    it('removes the param for external navigation', async () => {
      render(<Tester />);

      const button = screen.getByRole('button', { name: /External/i });
      await userEvent.click(button);

      expect(mockNavigate).toHaveBeenNthCalledWith(1, 'https://www.example.com/external');
    });
  });
});
