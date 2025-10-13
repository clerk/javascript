/**
 * APPROACH 5 EXAMPLE: Generic Modal Renderer
 *
 * This component replaces 141 lines of repetitive modal mounting code
 * with a single, reusable factory function.
 */

import React from 'react';
import { buildVirtualRouterUrl } from '../../utils';
import { LazyModalRenderer } from '../lazyModules/providers';
import { MODAL_REGISTRY, getModalConfig, getModalComponentName, type ModalName } from './modalRegistry';
import type { GeneratedModalState } from './createModalState';
import type { ComponentControls } from '../Components';

interface ModalRendererProps {
  modalName: ModalName;
  state: GeneratedModalState;
  urlStateParam: any;
  componentsControls: ComponentControls;
}

/**
 * 🎯 FACTORY FUNCTION: Render any modal based on registry config
 *
 * This single function replaces all the repetitive modal mounting code.
 * It reads the configuration from the registry and applies it.
 */
export function ModalRendererFactory({
  modalName,
  state,
  urlStateParam,
  componentsControls,
}: ModalRendererProps): JSX.Element | null {
  // Get config from registry
  const config = getModalConfig(modalName);
  if (!config) {
    console.warn(`Modal config not found for: ${modalName}`);
    return null;
  }

  // Get modal props from state
  const modalStateKey = `${modalName}Modal` as keyof GeneratedModalState;
  const modalProps = state[modalStateKey];

  // Don't render if props are null
  if (!modalProps) {
    return null;
  }

  // Resolve start path
  const startPath = buildVirtualRouterUrl({
    base: config.basePath,
    path: config.startPathResolver ? config.startPathResolver(modalProps, urlStateParam) : urlStateParam?.path,
  });

  // Get the lazy component
  const ModalComponent = config.component as React.LazyExoticComponent<any>;

  return (
    <LazyModalRenderer
      globalAppearance={state.appearance}
      appearanceKey={config.appearanceKey}
      componentAppearance={modalProps?.appearance}
      flowName={config.name}
      onClose={() => componentsControls.closeModal(config.name as any)}
      onExternalNavigate={
        config.disableExternalNavigationClose ? undefined : () => componentsControls.closeModal(config.name as any)
      }
      startPath={startPath}
      componentName={getModalComponentName(modalName)}
      // Apply custom modal styles if provided
      modalContainerSx={config.modalStyles?.containerSx}
      modalContentSx={config.modalStyles?.contentSx}
      canCloseModal={config.modalStyles?.canCloseModal}
      modalId={config.modalStyles?.modalId}
      modalStyle={config.modalStyles?.modalStyle}
    >
      {/* Render main modal component */}
      <React.Suspense fallback={null}>
        <ModalComponent {...modalProps} />
      </React.Suspense>

      {/* 🎯 CONVENTION: Auto-render child modals */}
      {config.children?.map(child => {
        const childConfig = getModalConfig(child.modalName as ModalName);
        if (!childConfig) return null;

        const childStateKey = `${child.modalName}Modal` as keyof GeneratedModalState;
        let childProps = state[childStateKey];

        // Apply props transformation if specified
        if (child.propsTransform && childProps) {
          childProps = child.propsTransform(modalProps);
        }

        const ChildComponent = childConfig.component as React.LazyExoticComponent<any>;

        return (
          <React.Suspense
            key={child.modalName}
            fallback={null}
          >
            <ChildComponent {...childProps} />
          </React.Suspense>
        );
      })}
    </LazyModalRenderer>
  );
}

/**
 * 🎯 BATCH RENDERER: Render all modals from registry
 *
 * Usage in Components.tsx:
 * ```typescript
 * <ModalBatchRenderer
 *   state={state}
 *   urlStateParam={urlStateParam}
 *   componentsControls={componentsControls}
 * />
 * ```
 */
interface ModalBatchRendererProps {
  state: GeneratedModalState;
  urlStateParam: any;
  componentsControls: ComponentControls;
}

export function ModalBatchRenderer(props: ModalBatchRendererProps): JSX.Element {
  return (
    <>
      {MODAL_REGISTRY.map(config => (
        <ModalRendererFactory
          key={config.name}
          modalName={config.name as ModalName}
          {...props}
        />
      ))}
    </>
  );
}

/**
 * Example: How Components.tsx changes
 *
 * BEFORE (141 lines):
 * ```typescript
 * const mountedSignInModal = ( ... 15 lines ... );
 * const mountedSignUpModal = ( ... 15 lines ... );
 * const mountedUserProfileModal = ( ... 18 lines ... );
 * // ... 8 more modals ...
 *
 * return (
 *   <>
 *     {signInModal && mountedSignInModal}
 *     {signUpModal && mountedSignUpModal}
 *     {userProfileModal && mountedUserProfileModal}
 *     // ... 6 more conditionals ...
 *   </>
 * );
 * ```
 *
 * AFTER (2 lines):
 * ```typescript
 * return (
 *   <ModalBatchRenderer
 *     state={state}
 *     urlStateParam={urlStateParam}
 *     componentsControls={componentsControls}
 *   />
 * );
 * ```
 */
