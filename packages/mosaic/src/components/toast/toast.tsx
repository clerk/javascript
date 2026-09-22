import * as stylex from '@stylexjs/stylex';
import React from 'react';

import type { IconName } from '../../icons/registry';
import type { ToastObject } from '../../primitives/toast';
import { Toast as Primitive } from '../../primitives/toast';
import { mergeStyleProps, themeProps } from '../../props';
import { reset } from '../../utils/reset.styles';
import { tooltipSurface } from '../../utils/tooltip-surface.styles';
import { Icon } from '../icon';
import { Spinner } from '../spinner';
import { iconColors, styles } from './toast.styles';

export type ToastType = 'success' | 'error' | 'loading';

const TOAST_TYPES: readonly ToastType[] = ['success', 'error', 'loading'];

function toToastType(type: string | undefined): ToastType | undefined {
  return TOAST_TYPES.find(t => t === type);
}

type Indicator = {
  icons: Record<Exclude<ToastType, 'loading'>, IconName>;
  iconSize: 'sm' | 'md';
  spinnerSize: 'sm' | 'md';
};

const DEFAULT_INDICATOR: Indicator = {
  icons: { success: 'checkmark-circle', error: 'exclamation-circle' },
  iconSize: 'md',
  spinnerSize: 'md',
};

const ANCHORED_INDICATOR: Indicator = {
  icons: { success: 'checkmark', error: 'exclamation-circle' },
  iconSize: 'sm',
  spinnerSize: 'sm',
};

function ToastIndicator(props: { type: ToastType; indicator: Indicator }) {
  const { type, indicator } = props;
  return type === 'loading' ? (
    <Spinner size={indicator.spinnerSize} />
  ) : (
    <Icon
      name={indicator.icons[type]}
      size={indicator.iconSize}
    />
  );
}

function StackedToast(props: { toast: ToastObject; zIndex: number }) {
  const { toast, zIndex } = props;
  const type = toToastType(toast.type);

  return (
    <Primitive.Root
      toast={toast}
      {...mergeStyleProps(themeProps('toast-root'), stylex.props(reset.base, styles.root, styles.stackOrder(zIndex)))}
    >
      <Primitive.Content {...mergeStyleProps(themeProps('toast-content'), stylex.props(reset.base, styles.content))}>
        {type && (
          <span
            aria-hidden='true'
            {...mergeStyleProps(themeProps('toast-icon', { type }), stylex.props(styles.icon, iconColors[type]))}
          >
            <ToastIndicator
              type={type}
              indicator={DEFAULT_INDICATOR}
            />
          </span>
        )}
        <div {...mergeStyleProps(themeProps('toast-text'), stylex.props(reset.base, styles.text))}>
          <Primitive.Title {...mergeStyleProps(themeProps('toast-title'), stylex.props(reset.base, styles.title))} />
          <Primitive.Description
            {...mergeStyleProps(themeProps('toast-description'), stylex.props(reset.base, styles.description))}
          />
        </div>
      </Primitive.Content>
    </Primitive.Root>
  );
}

function AnchoredToast(props: { toast: ToastObject }) {
  const { toast } = props;
  const type = toToastType(toast.type);

  return (
    <Primitive.Positioner
      toast={toast}
      sideOffset={4}
      {...mergeStyleProps(themeProps('toast-anchored-positioner'), stylex.props(reset.base, styles.anchoredPositioner))}
    >
      <Primitive.Root
        toast={toast}
        {...mergeStyleProps(
          themeProps('toast-anchored-root'),
          stylex.props(reset.base, tooltipSurface.base, styles.anchoredRoot),
        )}
      >
        <Primitive.Title {...mergeStyleProps(themeProps('toast-title'), stylex.props(reset.base))} />
        <Primitive.Description {...mergeStyleProps(themeProps('toast-description'), stylex.props(reset.base))} />
        {type && (
          <span
            aria-hidden='true'
            {...mergeStyleProps(themeProps('toast-icon', { type }), stylex.props(styles.anchoredIcon))}
          >
            <ToastIndicator
              type={type}
              indicator={ANCHORED_INDICATOR}
            />
          </span>
        )}
      </Primitive.Root>
    </Primitive.Positioner>
  );
}

function ToastViewport() {
  const { toasts } = Primitive.useToastManager();
  const stacked = toasts.filter(toast => !Primitive.isAnchored(toast));
  const anchored = toasts.filter(Primitive.isAnchored);

  return (
    <Primitive.Portal>
      <Primitive.Viewport {...mergeStyleProps(themeProps('toast-viewport'), stylex.props(reset.base, styles.viewport))}>
        {stacked.map((toast, index) => (
          <StackedToast
            key={toast.id}
            toast={toast}
            zIndex={stacked.length - index}
          />
        ))}
      </Primitive.Viewport>
      {anchored.map(toast => (
        <AnchoredToast
          key={toast.id}
          toast={toast}
        />
      ))}
    </Primitive.Portal>
  );
}

export function ToastProvider(props: { children: React.ReactNode }): React.ReactElement {
  return (
    <Primitive.Provider>
      {props.children}
      <ToastViewport />
    </Primitive.Provider>
  );
}

export const useToastManager = Primitive.useToastManager;
