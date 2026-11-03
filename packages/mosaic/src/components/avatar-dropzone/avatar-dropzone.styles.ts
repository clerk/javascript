import * as stylex from '@stylexjs/stylex';

import { durationVars, easingVars } from '../../tokens.stylex';
import { avatarDropzoneScope } from './avatar-dropzone.markers.stylex';

export const styles = stylex.create({
  overlay: {
    inset: 0,
    borderRadius: 'inherit',
    alignItems: 'center',
    backgroundColor: 'color-mix(in oklab, oklch(0 0 0) 50%, transparent)',
    color: 'oklch(1 0 0)',
    display: 'flex',
    justifyContent: 'center',
    opacity: {
      default: 0,
      [stylex.when.ancestor('[data-dragging]', avatarDropzoneScope)]: 1,
    },
    pointerEvents: 'none',
    position: 'absolute',
    transitionDuration: {
      default: durationVars['--cl-duration-fast'],
      [stylex.when.ancestor('[data-dragging]', avatarDropzoneScope)]: durationVars['--cl-duration-base'],
    },
    transitionProperty: 'opacity',
    transitionTimingFunction: {
      default: easingVars['--cl-ease-exit'],
      [stylex.when.ancestor('[data-dragging]', avatarDropzoneScope)]: easingVars['--cl-ease-enter'],
    },
  },
});
