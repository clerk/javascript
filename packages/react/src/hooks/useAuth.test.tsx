import { render, screen, userEvent } from '@clerk/shared/testUtils';
import React, { useEffect, useState } from 'react';

import { useAuth } from './useAuth';
import { ClerkProvider } from '../contexts/ClerkProvider';

const withFakeClerk = Component => {
  return props => (
    <ClerkProvider frontendApi='https://example.com'>
      <Component {...props} />
    </ClerkProvider>
  );
};

describe('useAuth()', () => {
  it('auth is stable between re-renders', async () => {
    let renderCount = 0;
    const MyDemo = () => {
      const [count, setCount] = useState(0);
      const auth = useAuth();
      useEffect(() => {
        renderCount++;
      }, [auth]);
      return <button onClick={() => setCount(i => i + 1)}>Hi</button>;
    };
    const App = withFakeClerk(MyDemo);
    render(<App />);
    const btn = screen.getByText('Hi');
    userEvent.click(btn);
    expect(renderCount).toBe(1);
  });

  it('getToken is stable between re-renders', async () => {
    let renderCount = 0;
    const MyDemo = () => {
      const [count, setCount] = useState(0);
      const { getToken } = useAuth();
      useEffect(() => {
        renderCount++;
      }, [getToken]);
      return <button onClick={() => setCount(i => i + 1)}>Hi</button>;
    };
    const App = withFakeClerk(MyDemo);
    render(<App />);
    const btn = screen.getByText('Hi');
    userEvent.click(btn);
    expect(renderCount).toBe(1);
  });
});
