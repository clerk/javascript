import * as stylex from '@stylexjs/stylex';

import {
  colorVars,
  durationVars,
  easingVars,
  focusVars,
  fontWeightVars,
  radiusVars,
  space,
  typeScaleVars,
} from '../../tokens.stylex';
import { sectionAnimatedSlotMarker, sectionNestedItemMarker } from './section.markers.stylex';

const compact = '@container cl-section (width < 26rem)';
const ring = `calc(${focusVars['--cl-focus-outline-width']} + ${focusVars['--cl-focus-outline-offset']})`;
const transitioning = ':where([data-starting-style], [data-ending-style])';
const ending = ':where([data-ending-style])';

export const styles = stylex.create({
  root: {
    display: 'flex',
    flexDirection: 'column',
    rowGap: space['8'],
    width: '100%',
  },
  group: {
    containerName: 'cl-section',
    containerType: 'inline-size',
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
  header: {
    alignItems: 'center',
    columnGap: space['3'],
    display: 'flex',
    flexWrap: 'wrap',
    marginBlockEnd: space['3'],
    rowGap: space['3'],
    width: '100%',
  },
  title: {
    color: colorVars['--cl-color-foreground'],
    fontWeight: fontWeightVars['--cl-font-medium'],
  },
  headerContent: {
    flexBasis: '50%',
    flexGrow: 9999,
  },
  headerActions: {
    flexBasis: 'auto',
    flexGrow: 1,
    flexShrink: 1,
    justifyContent: 'start',
    maxWidth: 'none',
  },
  body: {
    borderColor: colorVars['--cl-color-border'],
    borderRadius: radiusVars['--cl-radius-xl'],
    borderStyle: 'solid',
    borderWidth: '1px',
    paddingInline: space['4'],
    backgroundColor: colorVars['--cl-color-background'],
    display: 'flex',
    flexDirection: 'column',
    width: 'auto',
  },
  row: {
    paddingBlock: space['4'],
    borderBlockStartColor: colorVars['--cl-color-border'],
    borderBlockStartStyle: 'solid',
    borderBlockStartWidth: {
      default: '1px',
      ':first-child': '0px',
    },
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    rowGap: space['2'],
    minHeight: `calc(${space['18.5']} + 1px)`,
    width: '100%',
  },
  items: {
    listStyle: 'none',
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
  item: {
    alignItems: 'center',
    columnGap: space['3'],
    display: 'flex',
    flexWrap: 'nowrap',
    justifyContent: 'space-between',
    width: '100%',
  },
  itemWrap: {
    flexWrap: { [compact]: 'wrap', default: 'nowrap' },
    rowGap: { [compact]: space['3'], default: null },
  },
  nestedItem: {
    paddingBlock: space['4'],
    borderBlockStartColor: colorVars['--cl-color-border'],
    borderBlockStartStyle: 'solid',
    borderBlockStartWidth: {
      default: '0px',
      [stylex.when.siblingBefore(':where(*)', sectionNestedItemMarker)]: '1px',
    },
  },
  animatedSlot: {
    display: 'grid',
    gridTemplateRows: {
      default: 'auto 1fr',
      [transitioning]: 'auto 0fr',
    },
    transitionDelay: durationVars['--cl-duration-base'],
    transitionDuration: durationVars['--cl-duration-slower'],
    transitionProperty: {
      default: 'grid-template-rows',
      '@media (prefers-reduced-motion: reduce)': 'none',
    },
    transitionTimingFunction: easingVars['--cl-ease-in-out'],
  },
  animatedClip: {
    marginInline: `calc(-1 * ${ring})`,
    overflow: 'clip',
    paddingInline: ring,
    alignContent: 'start',
    display: 'grid',
    gridColumnStart: '1',
    gridRowEnd: 'span 2',
    gridRowStart: '1',
    maskImage: `linear-gradient(to top, transparent, black calc(${space['4']} - ${ring}))`,
    position: 'relative',
    minHeight: 0,
    '::before': {
      insetInline: ring,
      borderBlockStartColor: colorVars['--cl-color-border'],
      borderBlockStartStyle: 'solid',
      borderBlockStartWidth: {
        default: '0px',
        [stylex.when.ancestor(':where([data-open] ~ *)', sectionAnimatedSlotMarker)]: '1px',
      },
      content: '""',
      insetBlockStart: 0,
      position: 'absolute',
    },
  },
  animatedEmpty: {
    gridColumnStart: '1',
    gridRowStart: '1',
    opacity: {
      default: 0,
      [stylex.when.ancestor(transitioning, sectionAnimatedSlotMarker)]: 1,
      '@media (prefers-reduced-motion: reduce)': {
        default: 0,
        [stylex.when.ancestor(transitioning, sectionAnimatedSlotMarker)]: 1,
      },
    },
    transitionDelay: {
      default: durationVars['--cl-duration-instant'],
      [stylex.when.ancestor(ending, sectionAnimatedSlotMarker)]:
        `calc(${durationVars['--cl-duration-base']} + ${durationVars['--cl-duration-fast']})`,
    },
    transitionDuration: {
      default: durationVars['--cl-duration-fast'],
      [stylex.when.ancestor(ending, sectionAnimatedSlotMarker)]: durationVars['--cl-duration-base'],
    },
    transitionProperty: {
      default: 'opacity',
      '@media (prefers-reduced-motion: reduce)': 'none',
    },
    transitionTimingFunction: {
      default: easingVars['--cl-ease-exit'],
      [stylex.when.ancestor(ending, sectionAnimatedSlotMarker)]: easingVars['--cl-ease-enter'],
    },
  },
  animatedRow: {
    opacity: {
      default: 1,
      [transitioning]: 0,
      '@media (prefers-reduced-motion: reduce)': {
        default: 1,
        [transitioning]: 1,
      },
    },
    transitionDelay: {
      default: `calc(${durationVars['--cl-duration-base']} + ${durationVars['--cl-duration-slow']})`,
      [ending]: durationVars['--cl-duration-base'],
    },
    transitionDuration: {
      default: durationVars['--cl-duration-base'],
      [ending]: durationVars['--cl-duration-fast'],
    },
    transitionProperty: {
      default: 'opacity',
      '@media (prefers-reduced-motion: reduce)': 'none',
    },
    transitionTimingFunction: {
      default: easingVars['--cl-ease-enter'],
      [ending]: easingVars['--cl-ease-exit'],
    },
  },
  mediaBase: {
    alignItems: 'center',
    alignSelf: 'center',
    aspectRatio: '1/1',
    display: 'flex',
    flexShrink: 0,
    justifyContent: 'center',
  },
  mediaSm: {
    height: space['4'],
    width: space['4'],
  },
  mediaMd: {
    height: space['6'],
    width: space['6'],
  },
  mediaLg: {
    height: space['10'],
    width: space['10'],
  },
  mediaXl: {
    height: space['12'],
    width: space['12'],
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    justifyContent: 'center',
    rowGap: space['0.5'],
    minWidth: 0,
  },
  label: {
    alignItems: 'center',
    color: colorVars['--cl-color-foreground'],
    columnGap: space['2'],
    display: 'flex',
    fontSize: typeScaleVars['--cl-text-sm-size'],
    fontWeight: fontWeightVars['--cl-font-medium'],
    lineHeight: typeScaleVars['--cl-text-sm-leading'],
    minWidth: 0,
  },
  description: {
    color: colorVars['--cl-color-foreground-secondary'],
    fontSize: typeScaleVars['--cl-text-sm-size'],
    fontWeight: fontWeightVars['--cl-font-normal'],
    lineHeight: typeScaleVars['--cl-text-sm-leading'],
    overflowWrap: 'anywhere',
    textWrap: 'balance',
  },
  actions: {
    alignItems: 'center',
    display: 'grid',
    flexShrink: 0,
    gridAutoColumns: 'minmax(0, max-content)',
    gridAutoFlow: 'column',
    justifyContent: 'end',
    maxWidth: '50%',
    minWidth: 0,
  },
  note: {
    alignItems: 'center',
    color: colorVars['--cl-color-foreground-secondary'],
    columnGap: space['1'],
    display: 'flex',
    flexShrink: 0,
    fontSize: typeScaleVars['--cl-text-xs-size'],
    fontWeight: fontWeightVars['--cl-font-normal'],
    lineHeight: typeScaleVars['--cl-text-xs-leading'],
    maxWidth: '50%',
    minWidth: 0,
  },
  noteIcon: {
    alignItems: 'center',
    display: 'flex',
    flexShrink: 0,
    justifyContent: 'center',
    height: space['4'],
    width: space['4'],
  },
  truncate: {
    minWidth: 0,
  },
  actionsWrap: {
    justifyContent: { [compact]: 'start', default: 'end' },
    maxWidth: { [compact]: '100%', default: '50%' },
    width: { [compact]: '100%', default: null },
  },
  // Sits under the row's item rather than inside its content, so a message never shifts the
  // media and actions off the center line they share.
  error: {
    width: '100%',
  },
});

export const sectionCompactStyles = stylex.create({
  hidden: {
    display: { [compact]: 'none', default: null },
  },
  only: {
    display: { [compact]: 'inline', default: 'none' },
  },
});
