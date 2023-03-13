import React, { lazy, Suspense } from 'react';

import type { FlowMetadata } from '../elements';
import type { ThemableCssProp } from '../styledSystem';
import type { ClerkComponentName } from './components';
import { ClerkComponents } from './components';

export const CoreClerkContextWrapper = lazy(() =>
  import('../contexts').then(m => ({ default: m.CoreClerkContextWrapper })),
);
export const EnvironmentProvider = lazy(() => import('../contexts').then(m => ({ default: m.EnvironmentProvider })));
export const OptionsProvider = lazy(() => import('../contexts').then(m => ({ default: m.OptionsProvider })));
export const AppearanceProvider = lazy(() => import('../customizables').then(m => ({ default: m.AppearanceProvider })));
export const VirtualRouter = lazy(() => import('../router').then(m => ({ default: m.VirtualRouter })));
export const InternalThemeProvider = lazy(() =>
  import('../styledSystem').then(m => ({ default: m.InternalThemeProvider })),
);
export const Portal = lazy(() => import('./../portal'));
export const FlowMetadataProvider = lazy(() =>
  import('./../elements').then(m => ({ default: m.FlowMetadataProvider })),
);
export const Modal = lazy(() => import('./../elements').then(m => ({ default: m.Modal })));

type LazyProvidersProps = React.PropsWithChildren<{ clerk: any; environment: any; options: any; children: any }>;

export const LazyProviders = (props: LazyProvidersProps) => {
  return (
    <CoreClerkContextWrapper clerk={props.clerk}>
      <EnvironmentProvider value={props.environment}>
        <OptionsProvider value={props.options}>{props.children}</OptionsProvider>
      </EnvironmentProvider>
    </CoreClerkContextWrapper>
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
  return (
    <AppearanceProvider
      globalAppearance={props.globalAppearance}
      appearanceKey={props.appearanceKey}
      appearance={props.componentAppearance}
    >
      <Portal
        node={props.node}
        component={ClerkComponents[props.componentName as ClerkComponentName]}
        props={props.componentProps}
        componentName={props.componentName}
      />
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
    onExternalNavigate?: () => any;
    modalContainerSx?: ThemableCssProp;
    modalContentSx?: ThemableCssProp;
  } & AppearanceProviderProps
>;

export const LazyModalRenderer = (props: LazyModalRendererProps) => {
  return (
    <Suspense fallback={'Loading...'}>
      <AppearanceProvider
        globalAppearance={props.globalAppearance}
        appearanceKey={props.appearanceKey}
        appearance={props.componentAppearance}
      >
        <FlowMetadataProvider flow={props.flowName || ('' as any)}>
          <InternalThemeProvider>
            <Modal
              handleClose={props.onClose}
              containerSx={props.modalContainerSx}
              contentSx={props.modalContentSx}
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
