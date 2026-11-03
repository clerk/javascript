import * as stylex from '@stylexjs/stylex';

import { durationVars, easingVars, space } from '../../tokens.stylex';
import { avatarUploadDropzoneScope } from './avatar-upload.markers.stylex';

export const styles = stylex.create({
  dropzone: {
    alignItems: 'center',
    columnGap: space['3'],
    display: 'flex',
  },
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
      [stylex.when.ancestor('[data-dragging]', avatarUploadDropzoneScope)]: 1,
    },
    pointerEvents: 'none',
    position: 'absolute',
    transitionDuration: {
      default: durationVars['--cl-duration-fast'],
      [stylex.when.ancestor('[data-dragging]', avatarUploadDropzoneScope)]: durationVars['--cl-duration-base'],
    },
    transitionProperty: 'opacity',
    transitionTimingFunction: {
      default: easingVars['--cl-ease-exit'],
      [stylex.when.ancestor('[data-dragging]', avatarUploadDropzoneScope)]: easingVars['--cl-ease-enter'],
    },
  },
  acceptIcon: {
    display: {
      default: null,
      [stylex.when.ancestor('[data-drag-rejected]', avatarUploadDropzoneScope)]: 'none',
    },
  },
  rejectIcon: {
    display: {
      default: 'none',
      [stylex.when.ancestor('[data-drag-rejected]', avatarUploadDropzoneScope)]: 'inline-block',
    },
  },
});
