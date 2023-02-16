import React, { lazy, Suspense } from 'react';

import type { FlowMetadata } from '../elements';
import type { ClerkComponentName } from './components';
import { ClerkComponents } from './components';

const CoreClerkContextWrapper = lazy(() =>
  import(/* webpackChunkName: "CoreClerkContextWrapper" */ '../contexts').then(m => ({
    default: m.CoreClerkContextWrapper,
  })),
);
const EnvironmentProvider = lazy(() =>
  import(/* webpackChunkName: "EnvironmentProvider" */ '../contexts').then(m => ({ default: m.EnvironmentProvider })),
);
const OptionsProvider = lazy(() =>
  import(/* webpackChunkName: "OptionsProvider" */ '../contexts').then(m => ({ default: m.OptionsProvider })),
);
const AppearanceProvider = lazy(() =>
  import(/* webpackChunkName: "AppearanceProvider" */ '../customizables').then(m => ({
    default: m.AppearanceProvider,
  })),
);
const VirtualRouter = lazy(() =>
  import(/* webpackChunkName: "VirtualRouter" */ '../router').then(m => ({ default: m.VirtualRouter })),
);
const InternalThemeProvider = lazy(() =>
  import(/* webpackChunkName: "InternalThemeProvider" */ '../styledSystem').then(m => ({
    default: m.InternalThemeProvider,
  })),
);
const Portal = lazy(() => import(/* webpackChunkName: "Portal" */ './../portal').then(m => ({ default: m.default })));
const FlowMetadataProvider = lazy(() =>
  import(/* webpackChunkName: "FlowMetadataProvider" */ './../elements').then(m => ({
    default: m.FlowMetadataProvider,
  })),
);
const Modal = lazy(() => import(/* webpackChunkName: "Modal" */ './../elements').then(m => ({ default: m.Modal })));

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

type LazyComponentRendererProps = React.PropsWithChildren<{
  globalAppearance: any;
  appearanceKey: any;
  componentAppearance: any;
  node: any;
  componentName: any;
  componentProps: any;
}>;

export const LazyComponentRenderer = (props: LazyComponentRendererProps) => {
  return (
    <AppearanceProvider
      globalAppearance={props.globalAppearance}
      appearanceKey={props.appearanceKey}
      appearance={props.componentAppearance}
    >
      <Portal
        node={props.node}
        component={ClerkComponents[props.componentName as keyof typeof ClerkComponents]}
        props={props.componentProps}
        componentName={props.componentName}
      />
    </AppearanceProvider>
  );
};

type LazyModalRendererProps = React.PropsWithChildren<{
  componentName: ClerkComponentName;
  flowName?: FlowMetadata['flow'];
  globalAppearance: any;
  componentAppearance?: any;
  appearanceKey: any;
  startPath?: string;
  onClose?: any;
  onExternalNavigate?: any;
  modalContainerSx?: any;
  modalContentSx?: any;
}>;

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
                <VirtualRouter
                  startPath={props.startPath}
                  onExternalNavigate={props.onExternalNavigate}
                >
                  {props.children}
                </VirtualRouter>
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
