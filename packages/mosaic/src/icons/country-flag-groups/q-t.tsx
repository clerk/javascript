import type { ComponentPropsWithoutRef } from 'react';

import type { IconComponent } from '../glyph';
import { QaFlag } from '../glyphs/flags/qa-flag';
import { ReFlag } from '../glyphs/flags/re-flag';
import { RoFlag } from '../glyphs/flags/ro-flag';
import { RsFlag } from '../glyphs/flags/rs-flag';
import { RuFlag } from '../glyphs/flags/ru-flag';
import { RwFlag } from '../glyphs/flags/rw-flag';
import { SaFlag } from '../glyphs/flags/sa-flag';
import { SbFlag } from '../glyphs/flags/sb-flag';
import { ScFlag } from '../glyphs/flags/sc-flag';
import { SdFlag } from '../glyphs/flags/sd-flag';
import { SeFlag } from '../glyphs/flags/se-flag';
import { SgFlag } from '../glyphs/flags/sg-flag';
import { ShFlag } from '../glyphs/flags/sh-flag';
import { SiFlag } from '../glyphs/flags/si-flag';
import { SkFlag } from '../glyphs/flags/sk-flag';
import { SlFlag } from '../glyphs/flags/sl-flag';
import { SmFlag } from '../glyphs/flags/sm-flag';
import { SnFlag } from '../glyphs/flags/sn-flag';
import { SoFlag } from '../glyphs/flags/so-flag';
import { SrFlag } from '../glyphs/flags/sr-flag';
import { SsFlag } from '../glyphs/flags/ss-flag';
import { StFlag } from '../glyphs/flags/st-flag';
import { SvFlag } from '../glyphs/flags/sv-flag';
import { SxFlag } from '../glyphs/flags/sx-flag';
import { SyFlag } from '../glyphs/flags/sy-flag';
import { SzFlag } from '../glyphs/flags/sz-flag';
import { TcFlag } from '../glyphs/flags/tc-flag';
import { TdFlag } from '../glyphs/flags/td-flag';
import { TgFlag } from '../glyphs/flags/tg-flag';
import { ThFlag } from '../glyphs/flags/th-flag';
import { TjFlag } from '../glyphs/flags/tj-flag';
import { TkFlag } from '../glyphs/flags/tk-flag';
import { TlFlag } from '../glyphs/flags/tl-flag';
import { TmFlag } from '../glyphs/flags/tm-flag';
import { TnFlag } from '../glyphs/flags/tn-flag';
import { ToFlag } from '../glyphs/flags/to-flag';
import { TrFlag } from '../glyphs/flags/tr-flag';
import { TtFlag } from '../glyphs/flags/tt-flag';
import { TvFlag } from '../glyphs/flags/tv-flag';
import { TwFlag } from '../glyphs/flags/tw-flag';
import { TzFlag } from '../glyphs/flags/tz-flag';

interface CountryFlagGroupProps extends ComponentPropsWithoutRef<'svg'> {
  iso: string;
}

const flags: ReadonlyMap<string, IconComponent> = new Map([
  ['qa', QaFlag],
  ['re', ReFlag],
  ['ro', RoFlag],
  ['rs', RsFlag],
  ['ru', RuFlag],
  ['rw', RwFlag],
  ['sa', SaFlag],
  ['sb', SbFlag],
  ['sc', ScFlag],
  ['sd', SdFlag],
  ['se', SeFlag],
  ['sg', SgFlag],
  ['sh', ShFlag],
  ['si', SiFlag],
  ['sk', SkFlag],
  ['sl', SlFlag],
  ['sm', SmFlag],
  ['sn', SnFlag],
  ['so', SoFlag],
  ['sr', SrFlag],
  ['ss', SsFlag],
  ['st', StFlag],
  ['sv', SvFlag],
  ['sx', SxFlag],
  ['sy', SyFlag],
  ['sz', SzFlag],
  ['tc', TcFlag],
  ['td', TdFlag],
  ['tg', TgFlag],
  ['th', ThFlag],
  ['tj', TjFlag],
  ['tk', TkFlag],
  ['tl', TlFlag],
  ['tm', TmFlag],
  ['tn', TnFlag],
  ['to', ToFlag],
  ['tr', TrFlag],
  ['tt', TtFlag],
  ['tv', TvFlag],
  ['tw', TwFlag],
  ['tz', TzFlag],
]);

export default function CountryFlagGroup({ iso, ...props }: CountryFlagGroupProps) {
  const Flag = flags.get(iso);
  return Flag ? <Flag {...props} /> : null;
}
