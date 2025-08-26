import React from 'react';
import { render, screen } from '@testing-library/react';
import { Avatar } from '../Avatar';
import { AppearanceProvider } from '../../customizables';

const mockTheme = {
  colors: {
    $colorForeground: '#000000',
    $colorBackground: '#ffffff',
  },
  radii: {
    $circle: '50%',
    $avatar: '4px',
  },
  sizes: {
    $4: '16px',
    $6: '24px',
  },
  space: {
    $2: '8px',
  },
};

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <AppearanceProvider
    appearanceKey='userButton'
    appearance={{
      variables: mockTheme,
    }}
  >
    {children}
  </AppearanceProvider>
);

describe('Avatar', () => {
  it('should reset error state when imageUrl changes', () => {
    const { rerender } = render(
      <TestWrapper>
        <Avatar
          imageUrl='https://example.com/image1.jpg'
          title='Test User'
          initials='TU'
        />
      </TestWrapper>,
    );

    // Initially should show image
    expect(screen.getByAltText("Test User's logo")).toBeInTheDocument();

    // Simulate image load error
    const img = screen.getByAltText("Test User's logo");
    img.dispatchEvent(new Event('error'));

    // Should show initials after error
    expect(screen.getByText('TU')).toBeInTheDocument();

    // Change imageUrl - should reset error state and show new image
    rerender(
      <TestWrapper>
        <Avatar
          imageUrl='https://example.com/image2.jpg'
          title='Test User'
          initials='TU'
        />
      </TestWrapper>,
    );

    // Should show image again (error state reset)
    expect(screen.getByAltText("Test User's logo")).toBeInTheDocument();
    expect(screen.queryByText('TU')).not.toBeInTheDocument();
  });

  it('should handle null imageUrl properly', () => {
    render(
      <TestWrapper>
        <Avatar
          imageUrl={null}
          title='Test User'
          initials='TU'
        />
      </TestWrapper>,
    );

    // Should show initials when no imageUrl
    expect(screen.getByText('TU')).toBeInTheDocument();
  });

  it('should handle empty imageUrl properly', () => {
    render(
      <TestWrapper>
        <Avatar
          imageUrl=''
          title='Test User'
          initials='TU'
        />
      </TestWrapper>,
    );

    // Should show initials when empty imageUrl
    expect(screen.getByText('TU')).toBeInTheDocument();
  });
});
