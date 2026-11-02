import * as stylex from '@stylexjs/stylex';
import React from 'react';

import type { MosaicElementProps } from '../../props';
import { mergeStyleProps, themeProps } from '../../props';
import { reset } from '../../styles/reset.styles';
import { ButtonContext } from '../button/button.context';
import { inlineGroupScope } from './provider-button.markers.stylex';
import { groupStyles } from './provider-button.styles';

export interface ProviderButtonGroupProps extends MosaicElementProps<'div'> {
  /**
   * `inline` balances the buttons into rows of up to five and picks each button's label from how
   * many there are: the long label for one, the short label for two, the icon alone for three or
   * more. `stacked` gives each button its own row with the long label.
   */
  layout?: 'inline' | 'stacked';
  /** Disables every button in the group. A pending button stays at full opacity. */
  disabled?: boolean;
  /** The provider the user signed in with last. It gets its own row above the others, with its long label. */
  lastUsed?: React.ReactNode;
}

/**
 * Lays out `ProviderButton`s, which must be its direct children. Only `lastUsed` sits outside them.
 *
 * @example
 * <ProviderButtonGroup disabled={isBusy}>
 *   <ProviderButton icon={<GoogleIcon />} longLabel='Continue with Google' shortLabel='Google' />
 *   <ProviderButton icon={<GitHubIcon />} longLabel='Continue with GitHub' shortLabel='GitHub' />
 * </ProviderButtonGroup>
 */
export const ProviderButtonGroup = React.forwardRef<HTMLDivElement, ProviderButtonGroupProps>(
  function MosaicProviderButtonGroup(
    { layout = 'inline', disabled = false, lastUsed, xstyle, children, ...rest },
    ref,
  ) {
    const parent = React.useContext(ButtonContext);
    const value = React.useMemo(() => ({ ...parent, disabled: parent.disabled || disabled }), [parent, disabled]);

    return (
      <ButtonContext.Provider value={value}>
        <div
          ref={ref}
          {...mergeStyleProps(
            themeProps('provider-button-group', { layout }),
            stylex.props(reset.base, groupStyles.root, xstyle),
            rest,
          )}
        >
          {lastUsed}
          {React.Children.toArray(children).length > 0 ? (
            <div
              {...mergeStyleProps(
                themeProps('provider-button-group-row'),
                stylex.props(
                  reset.base,
                  groupStyles.row,
                  layout === 'inline' && inlineGroupScope,
                  layout === 'stacked' && groupStyles.rowStacked,
                ),
              )}
            >
              {children}
            </div>
          ) : null}
        </div>
      </ButtonContext.Provider>
    );
  },
);
