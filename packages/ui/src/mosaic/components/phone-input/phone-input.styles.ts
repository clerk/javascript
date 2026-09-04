import * as stylex from '@stylexjs/stylex';

import { colorVars, radiusVars, space, typeScaleVars } from '../../tokens.stylex';

export const styles = stylex.create({
  trigger: {
    paddingInlineEnd: 0,
    paddingInlineStart: space['2.5'],
  },
  triggerContent: {
    alignItems: 'center',
    display: 'flex',
    gap: space['0.5'],
  },
  flag: {
    fontSize: typeScaleVars['--cl-text-sm-size'],
    lineHeight: 1,
  },
  divider: {
    backgroundColor: colorVars['--cl-color-border'],
    flexShrink: 0,
    height: space['3.5'],
    width: '1px',
  },
  prefix: {
    gap: space['2'],
    fontVariantNumeric: 'tabular-nums',
    paddingInlineEnd: 0,
    paddingInlineStart: space['2'],
  },
  control: {
    fontVariantNumeric: 'tabular-nums',
    paddingInlineStart: space['2'],
  },
  popup: {
    borderRadius: radiusVars['--cl-radius-lg'],
    overflow: 'hidden',
    backgroundColor: colorVars['--cl-color-card'],
    boxShadow: `0 12px 12px -7px light-dark(oklch(0.2046 0 0 / 12%), transparent),
                0 24px 24px -10px light-dark(oklch(0.2046 0 0 / 4%), transparent),
                0 0 0 1px light-dark(oklch(0.2046 0 0 / 4%), oklch(1 0 0 / 10%))`,
    color: colorVars['--cl-color-card-foreground'],
    width: '100%',
  },
  countrySearch: {
    marginInline: space['2'],
    flexShrink: 0,
    marginBlockEnd: space['1'],
    marginBlockStart: space['2'],
  },
  optionName: {
    overflow: 'hidden',
    flexGrow: 1,
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    minWidth: 0,
  },
  optionCode: {
    color: colorVars['--cl-color-neutral-faded'],
    fontVariantNumeric: 'tabular-nums',
  },
  checkHidden: {
    visibility: 'hidden',
  },
});
