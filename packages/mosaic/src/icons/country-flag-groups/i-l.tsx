import type { ComponentPropsWithoutRef } from 'react';

import type { IconComponent } from '../glyph';
import { IdFlag } from '../glyphs/flags/id-flag';
import { IeFlag } from '../glyphs/flags/ie-flag';
import { IlFlag } from '../glyphs/flags/il-flag';
import { InFlag } from '../glyphs/flags/in-flag';
import { IoFlag } from '../glyphs/flags/io-flag';
import { IqFlag } from '../glyphs/flags/iq-flag';
import { IrFlag } from '../glyphs/flags/ir-flag';
import { IsFlag } from '../glyphs/flags/is-flag';
import { ItFlag } from '../glyphs/flags/it-flag';
import { JmFlag } from '../glyphs/flags/jm-flag';
import { JoFlag } from '../glyphs/flags/jo-flag';
import { JpFlag } from '../glyphs/flags/jp-flag';
import { KeFlag } from '../glyphs/flags/ke-flag';
import { KgFlag } from '../glyphs/flags/kg-flag';
import { KhFlag } from '../glyphs/flags/kh-flag';
import { KiFlag } from '../glyphs/flags/ki-flag';
import { KmFlag } from '../glyphs/flags/km-flag';
import { KnFlag } from '../glyphs/flags/kn-flag';
import { KpFlag } from '../glyphs/flags/kp-flag';
import { KrFlag } from '../glyphs/flags/kr-flag';
import { KwFlag } from '../glyphs/flags/kw-flag';
import { KyFlag } from '../glyphs/flags/ky-flag';
import { KzFlag } from '../glyphs/flags/kz-flag';
import { LaFlag } from '../glyphs/flags/la-flag';
import { LbFlag } from '../glyphs/flags/lb-flag';
import { LcFlag } from '../glyphs/flags/lc-flag';
import { LiFlag } from '../glyphs/flags/li-flag';
import { LkFlag } from '../glyphs/flags/lk-flag';
import { LrFlag } from '../glyphs/flags/lr-flag';
import { LsFlag } from '../glyphs/flags/ls-flag';
import { LtFlag } from '../glyphs/flags/lt-flag';
import { LuFlag } from '../glyphs/flags/lu-flag';
import { LvFlag } from '../glyphs/flags/lv-flag';
import { LyFlag } from '../glyphs/flags/ly-flag';

interface CountryFlagGroupProps extends ComponentPropsWithoutRef<'svg'> {
  iso: string;
}

const flags: ReadonlyMap<string, IconComponent> = new Map([
  ['id', IdFlag],
  ['ie', IeFlag],
  ['il', IlFlag],
  ['in', InFlag],
  ['io', IoFlag],
  ['iq', IqFlag],
  ['ir', IrFlag],
  ['is', IsFlag],
  ['it', ItFlag],
  ['jm', JmFlag],
  ['jo', JoFlag],
  ['jp', JpFlag],
  ['ke', KeFlag],
  ['kg', KgFlag],
  ['kh', KhFlag],
  ['ki', KiFlag],
  ['km', KmFlag],
  ['kn', KnFlag],
  ['kp', KpFlag],
  ['kr', KrFlag],
  ['kw', KwFlag],
  ['ky', KyFlag],
  ['kz', KzFlag],
  ['la', LaFlag],
  ['lb', LbFlag],
  ['lc', LcFlag],
  ['li', LiFlag],
  ['lk', LkFlag],
  ['lr', LrFlag],
  ['ls', LsFlag],
  ['lt', LtFlag],
  ['lu', LuFlag],
  ['lv', LvFlag],
  ['ly', LyFlag],
]);

export default function CountryFlagGroup({ iso, ...props }: CountryFlagGroupProps) {
  const Flag = flags.get(iso);
  return Flag ? <Flag {...props} /> : null;
}
