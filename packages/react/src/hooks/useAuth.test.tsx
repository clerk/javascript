import { render } from '@clerk/shared/testUtils';
import React, { useEffect } from 'react';

import { useAuth } from './useAuth';
import { ClerkProvider } from '../contexts/ClerkProvider';

import { withClerk } from '../components/withClerk';

jest.mock('../components/withClerk', () => ({
  withClerk: (Component: any) => (props: any) => {
    return (
      <Component
        {...props}
        clerk={{}}
      />
    );
  },
}));

describe('useAuth()', () => {
  it('getToken is stable between re-renders', async () => {
    let renderCount = 0;
    const MyDemo = ({ id }: { id: number }) => {
      const { getToken } = useAuth();
      useEffect(() => {
        renderCount++;
      }, [getToken]);
      return <button>Hi {id}</button>;
    };
    const App = withClerk(({ id }: { id: number; clerk }) => (
      <ClerkProvider frontendApi='https://example.com'>
        <MyDemo id={id} />
      </ClerkProvider>
    ));
    expect(renderCount).toBe(0);
    const { rerender } = render(<App id={0} />);
    expect(renderCount).toBe(1);
    rerender(<App id={1} />);
    expect(renderCount).toBe(1);
  });

  it('signOut is stable between re-renders', async () => {
    let renderCount = 0;
    const MyDemo = ({ id }: { id: number }) => {
      const { signOut } = useAuth();
      useEffect(() => {
        renderCount++;
      }, [signOut]);
      return <button>Hi {id}</button>;
    };
    const App = withClerk(({ id }: { id: number; clerk }) => (
      <ClerkProvider frontendApi='https://example.com'>
        <MyDemo id={id} />
      </ClerkProvider>
    ));
    expect(renderCount).toBe(0);
    const { rerender } = render(<App id={0} />);
    expect(renderCount).toBe(1);
    rerender(<App id={1} />);
    expect(renderCount).toBe(1);
  });
});
