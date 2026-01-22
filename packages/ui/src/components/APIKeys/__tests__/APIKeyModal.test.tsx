import { UNSAFE_PortalProvider } from '@clerk/shared/react';
import { render } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { AppearanceProvider } from '@/ui/customizables';
import { InternalThemeProvider } from '@/ui/styledSystem';

import { APIKeyModal } from '../APIKeyModal';

describe('APIKeyModal modalRoot behavior', () => {
  it('renders modal inside modalRoot when provided', () => {
    const modalRoot = React.createRef<HTMLDivElement>();
    const container = document.createElement('div');
    modalRoot.current = container;
    document.body.appendChild(container);

    const { container: testContainer } = render(
      <AppearanceProvider appearanceKey='signIn'>
        <InternalThemeProvider>
          <APIKeyModal
            modalRoot={modalRoot}
            handleOpen={() => {}}
            handleClose={() => {}}
            canCloseModal
          >
            <div data-testid='modal-content'>Test Content</div>
          </APIKeyModal>
        </InternalThemeProvider>
      </AppearanceProvider>,
    );

    // The modal should render inside the modalRoot container, not document.body
    // We can verify this by checking that the modal content is within the container
    expect(container.querySelector('[data-testid="modal-content"]')).toBeInTheDocument();

    document.body.removeChild(container);
  });

  it('applies scoped portal container styles when modalRoot provided', () => {
    const modalRoot = React.createRef<HTMLDivElement>();
    const container = document.createElement('div');
    modalRoot.current = container;
    document.body.appendChild(container);

    const { container: testContainer } = render(
      <AppearanceProvider appearanceKey='signIn'>
        <InternalThemeProvider>
          <APIKeyModal
            modalRoot={modalRoot}
            handleOpen={() => {}}
            handleClose={() => {}}
            canCloseModal
          >
            <div>Test</div>
          </APIKeyModal>
        </InternalThemeProvider>
      </AppearanceProvider>,
    );

    // The modal should have scoped styles (position: absolute) when modalRoot is provided
    // The backdrop element should be rendered with the modalBackdrop class
    const modalElement = container.querySelector('.cl-modalBackdrop');
    expect(modalElement).toBeTruthy();

    document.body.removeChild(container);
  });

  it('modalRoot takes precedence over PortalProvider context', () => {
    const modalRoot = React.createRef<HTMLDivElement>();
    const container1 = document.createElement('div');
    const container2 = document.createElement('div');
    modalRoot.current = container1;
    document.body.appendChild(container1);
    document.body.appendChild(container2);

    const getContainer = () => container2;

    const { container: testContainer } = render(
      <AppearanceProvider appearanceKey='signIn'>
        <InternalThemeProvider>
          <UNSAFE_PortalProvider getContainer={getContainer}>
            <APIKeyModal
              modalRoot={modalRoot}
              handleOpen={() => {}}
              handleClose={() => {}}
              canCloseModal
            >
              <div data-testid='modal-content'>Test Content</div>
            </APIKeyModal>
          </UNSAFE_PortalProvider>
        </InternalThemeProvider>
      </AppearanceProvider>,
    );

    // The modal should render in container1 (modalRoot), not container2 (PortalProvider)
    expect(container1.querySelector('[data-testid="modal-content"]')).toBeInTheDocument();
    expect(container2.querySelector('[data-testid="modal-content"]')).not.toBeInTheDocument();

    document.body.removeChild(container1);
    document.body.removeChild(container2);
  });
});
