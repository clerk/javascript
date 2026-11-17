'use client';

import * as stylex from '@stylexjs/stylex';
import type { ReactElement, ReactNode } from 'react';
import React from 'react';

import { ChevronDown } from '../../icons/glyphs/chevron-down';
import type { MosaicElementProps } from '../../props';
import { mergeStyleProps, themeProps } from '../../props';
import { focusOutline } from '../../styles/focus-outline.styles';
import { reset } from '../../styles/reset.styles';
import { truncationStyles } from '../../styles/typography.styles';
import { Badge } from '../badge';
import { Icon } from '../icon';
import { useSlot } from './switcher.context';
import { styles } from './switcher-trigger.styles';

export function triggerStyles(showLabel: boolean, shape: 'circle' | 'square') {
  return [
    focusOutline.visible,
    styles.trigger,
    showLabel ? styles.triggerLabelled : styles.triggerAvatarOnly,
    !showLabel && shape === 'circle' ? styles.triggerRound : null,
  ];
}

export function SwitcherTriggerContent({
  avatar,
  showLabel,
  name,
  badge,
  badgeId,
}: {
  avatar: ReactNode;
  showLabel: boolean;
  name?: string;
  badge?: string;
  badgeId?: string;
}): ReactElement {
  const slot = useSlot();
  return (
    <>
      {avatar}
      {showLabel ? (
        <>
          <span
            {...mergeStyleProps(
              themeProps(slot('trigger-label')),
              stylex.props(styles.triggerName, truncationStyles.singleLine),
            )}
          >
            {name}
          </span>
          {typeof badge === 'string' ? (
            <Badge
              color='neutral'
              data-badge-id={badgeId}
            >
              {badge}
            </Badge>
          ) : null}
          <Icon
            glyph={ChevronDown}
            size='md'
            xstyle={styles.triggerCaret}
          />
        </>
      ) : null}
    </>
  );
}

export interface SwitcherTriggerProps extends Omit<MosaicElementProps<'button'>, 'children'> {
  /** The lead's mark, such as a `Switcher.BadgedAvatar`. */
  avatar: ReactNode;
  /** The lead's name. Leave it out for the avatar-only trigger. */
  name?: string;
  /** A plan or status label beside the name. */
  badge?: string;
  /** Rounds the avatar-only trigger to match a circular avatar. */
  shape?: 'circle' | 'square';
  /**
   * Which mark the trigger carries, set as `data-variant`: `full` for a `Switcher.BadgedAvatar`,
   * `condensed` for a `Switcher.Avatar`.
   *
   * @default 'condensed'
   */
  variant?: SwitcherTriggerVariant;
}

export type SwitcherTriggerVariant = 'full' | 'condensed';

/** The trigger's look on a plain button, without the popover it opens. */
export const SwitcherTriggerButton = React.forwardRef<HTMLButtonElement, SwitcherTriggerProps>(
  function SwitcherTriggerButton(
    { avatar, name, badge, shape = 'square', variant = 'condensed', xstyle, ...rest },
    ref,
  ) {
    const slot = useSlot();
    const showLabel = name !== undefined;
    return (
      <button
        ref={ref}
        type='button'
        {...mergeStyleProps(
          themeProps(slot('trigger'), { variant }),
          stylex.props(reset.base, ...triggerStyles(showLabel, shape), xstyle),
          rest,
        )}
      >
        <SwitcherTriggerContent
          avatar={avatar}
          showLabel={showLabel}
          name={name}
          badge={badge}
        />
      </button>
    );
  },
);
