import { useRender } from '@clerk/headless/utils';
import * as stylex from '@stylexjs/stylex';
import React from 'react';

import type { IconName } from '../../icons/registry';
import type { MosaicComponentProps } from '../../props';
import { mergeStyleProps, themeProps } from '../../props';
import { reset } from '../../utils/reset.styles';
import { Icon } from '../icon';
import { descriptionColors, rootColors, styles } from './banner.styles';

type BannerColor = 'neutral' | 'warning' | 'negative';

const DEFAULT_COLOR: BannerColor = 'neutral';

const ICONS: Record<BannerColor, IconName> = {
  neutral: 'info-circle',
  warning: 'alert-circle',
  negative: 'alert-circle',
};

const BannerColorContext = React.createContext<BannerColor>(DEFAULT_COLOR);

/** Props for the banner surface, including native `div` props and the Mosaic `render` escape hatch. */
export interface BannerRootProps extends MosaicComponentProps<'div'> {
  /** Semantic colour of the fill, border, icon, and copy. @default 'neutral' */
  color?: BannerColor;
}

const Root = React.forwardRef<HTMLDivElement, BannerRootProps>(function MosaicBannerRoot(
  { color = DEFAULT_COLOR, render, className, style, children, ...rest },
  ref,
) {
  const element = useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: {
      ...mergeStyleProps(
        themeProps('banner-root', { color }),
        stylex.props(reset.base, styles.root, rootColors[color]),
        className,
        style,
      ),
      ...rest,
      children: (
        <>
          <Icon
            name={ICONS[color]}
            aria-hidden='true'
            {...stylex.props(styles.icon)}
          />
          <div {...mergeStyleProps(themeProps('banner-content'), stylex.props(reset.base, styles.content))}>
            {children}
          </div>
        </>
      ),
    },
  });

  return <BannerColorContext.Provider value={color}>{element}</BannerColorContext.Provider>;
});

/** Props for the banner's headline. */
export type BannerLabelProps = MosaicComponentProps<'span'>;

const Label = React.forwardRef<HTMLSpanElement, BannerLabelProps>(function MosaicBannerLabel(
  { render, className, style, ...rest },
  ref,
) {
  const color = React.useContext(BannerColorContext);
  return useRender({
    defaultTagName: 'span',
    render,
    ref,
    props: {
      ...mergeStyleProps(
        themeProps('banner-label', { color }),
        stylex.props(reset.base, styles.label),
        className,
        style,
      ),
      ...rest,
    },
  });
});

/** Props for the banner's supporting copy. */
export type BannerDescriptionProps = MosaicComponentProps<'p'>;

const Description = React.forwardRef<HTMLParagraphElement, BannerDescriptionProps>(function MosaicBannerDescription(
  { render, className, style, ...rest },
  ref,
) {
  const color = React.useContext(BannerColorContext);
  return useRender({
    defaultTagName: 'p',
    render,
    ref,
    props: {
      ...mergeStyleProps(
        themeProps('banner-description', { color }),
        stylex.props(reset.base, styles.description, descriptionColors[color]),
        className,
        style,
      ),
      ...rest,
    },
  });
});

/**
 * A tinted strip that annotates the surface it sits on with a status message. Composed through
 * `Banner.Root`, `Banner.Label`, and `Banner.Description`; every part accepts the Mosaic `render`
 * prop and forwards its ref. `Banner.Root` renders the icon for its `color` itself.
 *
 * `Banner.Root` sets no ARIA role. A banner that appears in response to something the user did
 * should be given `role='status'` (or `role='alert'` for an error) so it is announced.
 *
 * @example
 * <Banner.Root color='negative'>
 *   <Banner.Label>Error banner</Banner.Label>
 *   <Banner.Description>Renew now to avoid service interruption.</Banner.Description>
 * </Banner.Root>
 */
export const Banner = { Root, Label, Description };
