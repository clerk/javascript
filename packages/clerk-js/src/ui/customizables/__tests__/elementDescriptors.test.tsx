import { describe, expect, it } from 'vitest';

import { render, screen } from '@/test/utils';
import { Box, descriptors } from '@/ui/customizables';
import { AppearanceProvider } from '@/ui/customizables/AppearanceContext';

describe('Targetable classes', () => {
  it('default stable class is added to the element ', () => {
    render(
      <AppearanceProvider appearanceKey='signIn'>
        <Box
          data-testid='test'
          elementDescriptor={descriptors.socialButtonsIconButton}
        />
      </AppearanceProvider>,
    );

    expect(screen.getByTestId('test')).toHaveClass('cl-socialButtonsIconButton');
  });

  it('id related stable classname is added to the element', () => {
    render(
      <AppearanceProvider appearanceKey='signIn'>
        <Box
          data-testid='test'
          elementDescriptor={descriptors.socialButtonsIconButton}
          elementId={descriptors.socialButtonsIconButton.setId('google')}
        />
      </AppearanceProvider>,
    );

    expect(screen.getByTestId('test')).toHaveClass('cl-socialButtonsIconButton__google');
  });

  it('setting an undefined elementId should add no more classses', () => {
    const wrapper = ({ children }) => <AppearanceProvider appearanceKey='signIn'>{children}</AppearanceProvider>;

    const { rerender } = render(
      <Box
        data-testid='test'
        elementDescriptor={descriptors.socialButtonsIconButton}
      />,
      { wrapper },
    );

    const classes = screen.getByTestId('test').className;

    rerender(
      <Box
        data-testid='test'
        elementDescriptor={descriptors.socialButtonsIconButton}
        elementId={descriptors.socialButtonsIconButton.setId(undefined)}
      />,
    );

    const classesWithElementId = screen.getByTestId('test').className;

    expect(classes).toBe(classesWithElementId);
  });

  it('loading state related stable classname is added to the element', () => {
    render(
      <AppearanceProvider appearanceKey='signIn'>
        <Box
          data-testid='test'
          elementDescriptor={descriptors.socialButtonsIconButton}
          isLoading
        />
      </AppearanceProvider>,
    );

    expect(screen.getByTestId('test')).toHaveClass('cl-loading');
  });

  it('active state related stable classname is added to the element', () => {
    render(
      <AppearanceProvider appearanceKey='signIn'>
        <Box
          data-testid='test'
          elementDescriptor={descriptors.socialButtonsIconButton}
          isActive
        />
      </AppearanceProvider>,
    );

    expect(screen.getByTestId('test')).toHaveClass('cl-active');
  });

  it('error state related stable classname is added to the element', () => {
    render(
      <AppearanceProvider appearanceKey='signIn'>
        <Box
          data-testid='test'
          elementDescriptor={descriptors.socialButtonsIconButton}
          hasError
        />
      </AppearanceProvider>,
    );

    expect(screen.getByTestId('test')).toHaveClass('cl-error');
  });

  it('open state related stable classname is added to the element', () => {
    render(
      <AppearanceProvider appearanceKey='signIn'>
        <Box
          data-testid='test'
          elementDescriptor={descriptors.socialButtonsIconButton}
          isOpen
        />
      </AppearanceProvider>,
    );

    expect(screen.getByTestId('test')).toHaveClass('cl-open');
  });
});
