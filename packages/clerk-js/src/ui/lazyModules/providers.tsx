import { deprecated } from '@clerk/shared/deprecated';
import { PortalProvider } from '@clerk/shared/react';
import type { Appearance } from '@clerk/shared/types';
import React, { lazy, Suspense } from 'react';

import type { FlowMetadata } from '../elements/contexts';
import type { Drawer } from '../elements/Drawer';
import type { ThemableCssProp } from '../styledSystem';
import type { AvailableComponentCtx } from '../types';
import type { ClerkComponentName } from './components';
import { ClerkComponents } from './components';

const CoreClerkContextWrapper = lazy(() => import('../contexts').then(m => ({ default: m.CoreClerkContextWrapper })));
const EnvironmentProvider = lazy(() => import('../contexts').then(m => ({ default: m.EnvironmentProvider })));
const OptionsProvider = lazy(() => import('../contexts').then(m => ({ default: m.OptionsProvider })));
const AppearanceProvider = lazy(() => import('../customizables').then(m => ({ default: m.AppearanceProvider })));
const VirtualRouter = lazy(() => import('../router').then(m => ({ default: m.VirtualRouter })));
const InternalThemeProvider = lazy(() => import('../styledSystem').then(m => ({ default: m.InternalThemeProvider })));
const StyleCacheProvider = lazy(() =>
  import('../styledSystem/StyleCacheProvider').then(m => ({ default: m.StyleCacheProvider })),
);
const Portal = lazy(() => import('./../portal').then(m => ({ default: m.Portal })));
const VirtualBodyRootPortal = lazy(() => import('./../portal').then(m => ({ default: m.VirtualBodyRootPortal })));
const FlowMetadataProvider = lazy(() =>
  import('./../elements/contexts').then(m => ({ default: m.FlowMetadataProvider })),
);
const Modal = lazy(() => import('./../elements/Modal').then(m => ({ default: m.Modal })));
const DrawerRoot = lazy(() => import('./../elements/Drawer').then(m => ({ default: m.Drawer.Root })));
const DrawerOverlay = lazy(() => import('./../elements/Drawer').then(m => ({ default: m.Drawer.Overlay })));
const OrganizationSwitcherPrefetch = lazy(() =>
  import(/* webpackChunkName: "prefetchorganizationlist" */ '../components/prefetch-organization-list').then(m => ({
    default: m.OrganizationSwitcherPrefetch,
  })),
);

type LazyProvidersProps = React.PropsWithChildren<{ clerk: any; environment: any; options: any; children: any }>;

export const LazyProviders = (props: LazyProvidersProps) => {
  return (
    <StyleCacheProvider
      nonce={props.options.nonce}
      cssLayerName={props.options.appearance?.cssLayerName}
    >
      <CoreClerkContextWrapper clerk={props.clerk}>
        <EnvironmentProvider value={props.environment}>
          <OptionsProvider value={props.options}>{props.children}</OptionsProvider>
        </EnvironmentProvider>
      </CoreClerkContextWrapper>
    </StyleCacheProvider>
  );
};

type _AppearanceProviderProps = Parameters<typeof AppearanceProvider>[0];
type AppearanceProviderProps = {
  globalAppearance?: _AppearanceProviderProps['globalAppearance'];
  appearanceKey: _AppearanceProviderProps['appearanceKey'];
  componentAppearance?: _AppearanceProviderProps['appearance'];
};
type LazyComponentRendererProps = React.PropsWithChildren<
  {
    node: PortalProps['node'];
    componentName: any;
    componentProps: any;
  } & AppearanceProviderProps
>;

type PortalProps = Parameters<typeof Portal>[0];

export const LazyComponentRenderer = (props: LazyComponentRendererProps) => {
  if (props?.componentProps?.routing === 'virtual') {
    deprecated('routing="virtual"', 'Use routing="hash" instead.');
  }
  return (
    <AppearanceProvider
      globalAppearance={props.globalAppearance}
      appearanceKey={props.appearanceKey}
      appearance={props.componentAppearance}
    >
      <PortalProvider getContainer={() => props?.componentProps?.portalRoot}>
        <Portal
          node={props.node}
          component={
            ClerkComponents[props.componentName as ClerkComponentName] as React.ComponentType<
              Omit<AvailableComponentCtx, 'componentName'>
            >
          }
          props={props.componentProps}
          componentName={props.componentName}
        />
      </PortalProvider>
    </AppearanceProvider>
  );
};

type ModalProps = Parameters<typeof Modal>[0];

type LazyModalRendererProps = React.PropsWithChildren<
  {
    componentName: ClerkComponentName;
    flowName?: FlowMetadata['flow'];
    startPath?: string;
    onClose?: ModalProps['handleClose'];
    onExternalNavigate?: () => void;
    modalContainerSx?: ThemableCssProp;
    modalContentSx?: ThemableCssProp;
    canCloseModal?: boolean;
    modalId?: string;
    modalStyle?: React.CSSProperties;
  } & AppearanceProviderProps
>;

export const LazyModalRenderer = (props: LazyModalRendererProps) => {
  return (
    <Suspense fallback={''}>
      <AppearanceProvider
        globalAppearance={props.globalAppearance}
        appearanceKey={props.appearanceKey}
        appearance={props.componentAppearance}
      >
        <FlowMetadataProvider flow={props.flowName || ('' as any)}>
          <InternalThemeProvider>
            <Modal
              id={props.modalId}
              style={props.modalStyle}
              handleClose={props.onClose}
              containerSx={props.modalContainerSx}
              contentSx={props.modalContentSx}
              canCloseModal={props.canCloseModal}
            >
              {props.startPath ? (
                <Suspense>
                  <VirtualRouter
                    startPath={props.startPath}
                    onExternalNavigate={props.onExternalNavigate}
                  >
                    {props.children}
                  </VirtualRouter>
                </Suspense>
              ) : (
                props.children
              )}
            </Modal>
          </InternalThemeProvider>
        </FlowMetadataProvider>
      </AppearanceProvider>
    </Suspense>
  );
};

type DrawerProps = Parameters<typeof Drawer.Root>[0];

type LazyDrawerRendererProps = React.PropsWithChildren<
  {
    componentName: ClerkComponentName;
    flowName?: FlowMetadata['flow'];
    open: DrawerProps['open'];
    onOpenChange: DrawerProps['onOpenChange'];
    portalId?: string;
    portalRoot?: HTMLElement | null | undefined;
  } & AppearanceProviderProps
>;

export const LazyDrawerRenderer = (props: LazyDrawerRendererProps) => {
  return (
    <Suspense fallback={''}>
      <VirtualRouter startPath=''>
        <AppearanceProvider
          globalAppearance={props.globalAppearance}
          appearanceKey={props.appearanceKey}
          appearance={props.componentAppearance}
        >
          <FlowMetadataProvider flow={props.flowName || ('' as any)}>
            <InternalThemeProvider>
              <DrawerRoot
                open={props.open}
                onOpenChange={props.onOpenChange}
                strategy={props.portalId || props.portalRoot ? 'absolute' : 'fixed'}
                portalProps={{
                  id: props.portalId ? props.portalId : undefined,
                  root: props.portalRoot ? props.portalRoot : undefined,
                }}
              >
                <DrawerOverlay />
                {props.children}
              </DrawerRoot>
            </InternalThemeProvider>
          </FlowMetadataProvider>
        </AppearanceProvider>
      </VirtualRouter>
    </Suspense>
  );
};

/**
 * This component automatically mounts when impersonating, without a user action.
 * We want to hotload the /ui dependencies only if we're actually impersonating.
 */
export const LazyImpersonationFabProvider = (
  props: React.PropsWithChildren<{ globalAppearance: Appearance | undefined }>,
) => {
  return (
    <Suspense>
      <VirtualRouter startPath=''>
        <AppearanceProvider
          globalAppearance={props.globalAppearance}
          appearanceKey={'impersonationFab'}
        >
          {props.children}
        </AppearanceProvider>
      </VirtualRouter>
    </Suspense>
  );
};

export const LazyEnableOrganizationsPromptProvider = (
  props: React.PropsWithChildren<{ globalAppearance: Appearance | undefined }>,
) => {
  return (
    <Suspense>
      <VirtualRouter startPath=''>
        <AppearanceProvider
          globalAppearance={props.globalAppearance}
          appearanceKey={'enableOrganizationsPrompt'}
        >
          {props.children}
        </AppearanceProvider>
      </VirtualRouter>
    </Suspense>
  );
};

type LazyOneTapRendererProps = React.PropsWithChildren<
  {
    componentProps: any;
    startPath: string;
  } & Omit<AppearanceProviderProps, 'appearanceKey'>
>;

export const LazyOneTapRenderer = (props: LazyOneTapRendererProps) => {
  return (
    <AppearanceProvider
      globalAppearance={props.globalAppearance}
      appearanceKey={'oneTap'}
      appearance={props.componentAppearance}
    >
      <VirtualBodyRootPortal
        startPath={props.startPath}
        component={ClerkComponents['GoogleOneTap']}
        props={props.componentProps}
        componentName={'GoogleOneTap'}
      />
    </AppearanceProvider>
  );
};

export { OrganizationSwitcherPrefetch };
