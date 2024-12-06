import { render } from '@testing-library/react';
import React from 'react';

import { useAuth } from '../useAuth';

const TestComponent = () => {
  const { isLoaded, isSignedIn } = useAuth();
  return (
    <div>
      {isLoaded}
      {isSignedIn}
    </div>
  );
};

describe('useAuth', () => {
  test('throws an error if not wrapped in <ClerkProvider>', () => {
    expect(() => {
      render(<TestComponent />);
    }).toThrow(
      '@clerk/clerk-react: useAuth can only be used within the <ClerkProvider /> component. Learn more: https://clerk.com/docs/components/clerk-provider',
    );
  });
});
