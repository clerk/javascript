import * as stylex from '@stylexjs/stylex';

import { colorVars, durationVars, easingVars, radiusVars, shadowVars, space } from '../../tokens.stylex';
import { avatarUploadDropzoneScope } from './avatar-upload.markers.stylex';

const SCRIM = 'color-mix(in oklab, oklch(0 0 0) 55%, transparent)';
const RING = 'oklch(1 0 0 / 0.85)';
const THUMB = '16px';
const TRACK = '4px';

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
  cropContent: {
    display: 'flex',
    flexDirection: 'column',
    rowGap: space['4'],
  },
  frame: {
    borderRadius: radiusVars['--cl-radius-lg'],
    overflow: 'hidden',
    aspectRatio: '1',
    backgroundColor: colorVars['--cl-color-surface-subtle'],
    cursor: {
      default: 'grab',
      ':where([data-disabled])': 'default',
      ':where([data-dragging])': 'grabbing',
    },
    position: 'relative',
    userSelect: 'none',
    width: '100%',
  },
  area: {
    inset: '7%',
    position: 'absolute',
  },
  mask: {
    inset: 0,
    boxShadow: `0 0 0 100vmax ${SCRIM}, inset 0 0 0 2px ${RING}`,
    pointerEvents: 'none',
    position: 'absolute',
  },
  circleMask: {
    borderRadius: '50%',
  },
  zoomRow: {
    alignItems: 'center',
    columnGap: space['2'],
    display: 'flex',
  },
  zoom: {
    margin: 0,
    borderRadius: radiusVars['--cl-radius-full'],
    appearance: 'none',
    backgroundColor: 'transparent',
    cursor: {
      default: 'pointer',
      ':disabled': 'default',
    },
    flexGrow: 1,
    opacity: {
      default: 1,
      ':disabled': 0.5,
    },
    height: THUMB,
    minWidth: 0,
    '::-moz-range-thumb': {
      borderColor: colorVars['--cl-color-border'],
      borderRadius: radiusVars['--cl-radius-full'],
      borderStyle: 'solid',
      borderWidth: '1px',
      backgroundColor: 'oklch(1 0 0)',
      boxShadow: shadowVars['--cl-shadow-sm'],
      height: THUMB,
      width: THUMB,
    },
    '::-moz-range-track': {
      borderRadius: radiusVars['--cl-radius-full'],
      backgroundColor: colorVars['--cl-color-neutral-alpha-300'],
      height: TRACK,
    },
    '::-webkit-slider-runnable-track': {
      borderRadius: radiusVars['--cl-radius-full'],
      backgroundColor: colorVars['--cl-color-neutral-alpha-300'],
      height: TRACK,
    },
    '::-webkit-slider-thumb': {
      borderColor: colorVars['--cl-color-border'],
      borderRadius: radiusVars['--cl-radius-full'],
      borderStyle: 'solid',
      borderWidth: '1px',
      appearance: 'none',
      backgroundColor: 'oklch(1 0 0)',
      boxShadow: shadowVars['--cl-shadow-sm'],
      height: THUMB,
      marginTop: `calc((${TRACK} - ${THUMB}) / 2)`,
      width: THUMB,
    },
  },
  footerActions: {
    columnGap: space['2'],
    display: 'flex',
  },
});
