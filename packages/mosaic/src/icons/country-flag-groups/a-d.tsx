import type { ComponentPropsWithoutRef } from 'react';

import type { IconComponent } from '../glyph';
import { AcFlag } from '../glyphs/flags/ac-flag';
import { AdFlag } from '../glyphs/flags/ad-flag';
import { AeFlag } from '../glyphs/flags/ae-flag';
import { AfFlag } from '../glyphs/flags/af-flag';
import { AgFlag } from '../glyphs/flags/ag-flag';
import { AiFlag } from '../glyphs/flags/ai-flag';
import { AlFlag } from '../glyphs/flags/al-flag';
import { AmFlag } from '../glyphs/flags/am-flag';
import { AoFlag } from '../glyphs/flags/ao-flag';
import { ArFlag } from '../glyphs/flags/ar-flag';
import { AsFlag } from '../glyphs/flags/as-flag';
import { AtFlag } from '../glyphs/flags/at-flag';
import { AuFlag } from '../glyphs/flags/au-flag';
import { AwFlag } from '../glyphs/flags/aw-flag';
import { AxFlag } from '../glyphs/flags/ax-flag';
import { AzFlag } from '../glyphs/flags/az-flag';
import { BaFlag } from '../glyphs/flags/ba-flag';
import { BbFlag } from '../glyphs/flags/bb-flag';
import { BdFlag } from '../glyphs/flags/bd-flag';
import { BeFlag } from '../glyphs/flags/be-flag';
import { BfFlag } from '../glyphs/flags/bf-flag';
import { BgFlag } from '../glyphs/flags/bg-flag';
import { BhFlag } from '../glyphs/flags/bh-flag';
import { BiFlag } from '../glyphs/flags/bi-flag';
import { BjFlag } from '../glyphs/flags/bj-flag';
import { BlFlag } from '../glyphs/flags/bl-flag';
import { BmFlag } from '../glyphs/flags/bm-flag';
import { BnFlag } from '../glyphs/flags/bn-flag';
import { BoFlag } from '../glyphs/flags/bo-flag';
import { BqFlag } from '../glyphs/flags/bq-flag';
import { BrFlag } from '../glyphs/flags/br-flag';
import { BsFlag } from '../glyphs/flags/bs-flag';
import { BtFlag } from '../glyphs/flags/bt-flag';
import { BwFlag } from '../glyphs/flags/bw-flag';
import { ByFlag } from '../glyphs/flags/by-flag';
import { BzFlag } from '../glyphs/flags/bz-flag';
import { CaFlag } from '../glyphs/flags/ca-flag';
import { CdFlag } from '../glyphs/flags/cd-flag';
import { CfFlag } from '../glyphs/flags/cf-flag';
import { CgFlag } from '../glyphs/flags/cg-flag';
import { ChFlag } from '../glyphs/flags/ch-flag';
import { CiFlag } from '../glyphs/flags/ci-flag';
import { CkFlag } from '../glyphs/flags/ck-flag';
import { ClFlag } from '../glyphs/flags/cl-flag';
import { CmFlag } from '../glyphs/flags/cm-flag';
import { CnFlag } from '../glyphs/flags/cn-flag';
import { CoFlag } from '../glyphs/flags/co-flag';
import { CrFlag } from '../glyphs/flags/cr-flag';
import { CuFlag } from '../glyphs/flags/cu-flag';
import { CvFlag } from '../glyphs/flags/cv-flag';
import { CwFlag } from '../glyphs/flags/cw-flag';
import { CyFlag } from '../glyphs/flags/cy-flag';
import { CzFlag } from '../glyphs/flags/cz-flag';
import { DeFlag } from '../glyphs/flags/de-flag';
import { DjFlag } from '../glyphs/flags/dj-flag';
import { DkFlag } from '../glyphs/flags/dk-flag';
import { DmFlag } from '../glyphs/flags/dm-flag';
import { DoFlag } from '../glyphs/flags/do-flag';
import { DzFlag } from '../glyphs/flags/dz-flag';

interface CountryFlagGroupProps extends ComponentPropsWithoutRef<'svg'> {
  iso: string;
}

const flags: ReadonlyMap<string, IconComponent> = new Map([
  ['ac', AcFlag],
  ['ad', AdFlag],
  ['ae', AeFlag],
  ['af', AfFlag],
  ['ag', AgFlag],
  ['ai', AiFlag],
  ['al', AlFlag],
  ['am', AmFlag],
  ['ao', AoFlag],
  ['ar', ArFlag],
  ['as', AsFlag],
  ['at', AtFlag],
  ['au', AuFlag],
  ['aw', AwFlag],
  ['ax', AxFlag],
  ['az', AzFlag],
  ['ba', BaFlag],
  ['bb', BbFlag],
  ['bd', BdFlag],
  ['be', BeFlag],
  ['bf', BfFlag],
  ['bg', BgFlag],
  ['bh', BhFlag],
  ['bi', BiFlag],
  ['bj', BjFlag],
  ['bl', BlFlag],
  ['bm', BmFlag],
  ['bn', BnFlag],
  ['bo', BoFlag],
  ['bq', BqFlag],
  ['br', BrFlag],
  ['bs', BsFlag],
  ['bt', BtFlag],
  ['bw', BwFlag],
  ['by', ByFlag],
  ['bz', BzFlag],
  ['ca', CaFlag],
  ['cd', CdFlag],
  ['cf', CfFlag],
  ['cg', CgFlag],
  ['ch', ChFlag],
  ['ci', CiFlag],
  ['ck', CkFlag],
  ['cl', ClFlag],
  ['cm', CmFlag],
  ['cn', CnFlag],
  ['co', CoFlag],
  ['cr', CrFlag],
  ['cu', CuFlag],
  ['cv', CvFlag],
  ['cw', CwFlag],
  ['cy', CyFlag],
  ['cz', CzFlag],
  ['de', DeFlag],
  ['dj', DjFlag],
  ['dk', DkFlag],
  ['dm', DmFlag],
  ['do', DoFlag],
  ['dz', DzFlag],
]);

export default function CountryFlagGroup({ iso, ...props }: CountryFlagGroupProps) {
  const Flag = flags.get(iso);
  return Flag ? <Flag {...props} /> : null;
}
