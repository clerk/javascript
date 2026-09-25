import type { ComponentPropsWithoutRef } from 'react';

import type { IconComponent } from '../glyph';
import { EcFlag } from '../glyphs/flags/ec-flag';
import { EeFlag } from '../glyphs/flags/ee-flag';
import { EgFlag } from '../glyphs/flags/eg-flag';
import { EhFlag } from '../glyphs/flags/eh-flag';
import { ErFlag } from '../glyphs/flags/er-flag';
import { EsFlag } from '../glyphs/flags/es-flag';
import { EtFlag } from '../glyphs/flags/et-flag';
import { FiFlag } from '../glyphs/flags/fi-flag';
import { FjFlag } from '../glyphs/flags/fj-flag';
import { FkFlag } from '../glyphs/flags/fk-flag';
import { FmFlag } from '../glyphs/flags/fm-flag';
import { FoFlag } from '../glyphs/flags/fo-flag';
import { FrFlag } from '../glyphs/flags/fr-flag';
import { GaFlag } from '../glyphs/flags/ga-flag';
import { GbFlag } from '../glyphs/flags/gb-flag';
import { GdFlag } from '../glyphs/flags/gd-flag';
import { GeFlag } from '../glyphs/flags/ge-flag';
import { GfFlag } from '../glyphs/flags/gf-flag';
import { GhFlag } from '../glyphs/flags/gh-flag';
import { GiFlag } from '../glyphs/flags/gi-flag';
import { GlFlag } from '../glyphs/flags/gl-flag';
import { GmFlag } from '../glyphs/flags/gm-flag';
import { GnFlag } from '../glyphs/flags/gn-flag';
import { GpFlag } from '../glyphs/flags/gp-flag';
import { GqFlag } from '../glyphs/flags/gq-flag';
import { GrFlag } from '../glyphs/flags/gr-flag';
import { GtFlag } from '../glyphs/flags/gt-flag';
import { GuFlag } from '../glyphs/flags/gu-flag';
import { GwFlag } from '../glyphs/flags/gw-flag';
import { GyFlag } from '../glyphs/flags/gy-flag';
import { HkFlag } from '../glyphs/flags/hk-flag';
import { HnFlag } from '../glyphs/flags/hn-flag';
import { HrFlag } from '../glyphs/flags/hr-flag';
import { HtFlag } from '../glyphs/flags/ht-flag';
import { HuFlag } from '../glyphs/flags/hu-flag';

interface CountryFlagGroupProps extends ComponentPropsWithoutRef<'svg'> {
  iso: string;
}

const flags: ReadonlyMap<string, IconComponent> = new Map([
  ['ec', EcFlag],
  ['ee', EeFlag],
  ['eg', EgFlag],
  ['eh', EhFlag],
  ['er', ErFlag],
  ['es', EsFlag],
  ['et', EtFlag],
  ['fi', FiFlag],
  ['fj', FjFlag],
  ['fk', FkFlag],
  ['fm', FmFlag],
  ['fo', FoFlag],
  ['fr', FrFlag],
  ['ga', GaFlag],
  ['gb', GbFlag],
  ['gd', GdFlag],
  ['ge', GeFlag],
  ['gf', GfFlag],
  ['gh', GhFlag],
  ['gi', GiFlag],
  ['gl', GlFlag],
  ['gm', GmFlag],
  ['gn', GnFlag],
  ['gp', GpFlag],
  ['gq', GqFlag],
  ['gr', GrFlag],
  ['gt', GtFlag],
  ['gu', GuFlag],
  ['gw', GwFlag],
  ['gy', GyFlag],
  ['hk', HkFlag],
  ['hn', HnFlag],
  ['hr', HrFlag],
  ['ht', HtFlag],
  ['hu', HuFlag],
]);

export default function CountryFlagGroup({ iso, ...props }: CountryFlagGroupProps) {
  const Flag = flags.get(iso);
  return Flag ? <Flag {...props} /> : null;
}
