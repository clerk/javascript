import type { ComponentPropsWithoutRef } from 'react';

import type { IconComponent } from '../glyph';
import { MaFlag } from '../glyphs/flags/ma-flag';
import { McFlag } from '../glyphs/flags/mc-flag';
import { MdFlag } from '../glyphs/flags/md-flag';
import { MeFlag } from '../glyphs/flags/me-flag';
import { MfFlag } from '../glyphs/flags/mf-flag';
import { MgFlag } from '../glyphs/flags/mg-flag';
import { MhFlag } from '../glyphs/flags/mh-flag';
import { MkFlag } from '../glyphs/flags/mk-flag';
import { MlFlag } from '../glyphs/flags/ml-flag';
import { MmFlag } from '../glyphs/flags/mm-flag';
import { MnFlag } from '../glyphs/flags/mn-flag';
import { MoFlag } from '../glyphs/flags/mo-flag';
import { MpFlag } from '../glyphs/flags/mp-flag';
import { MqFlag } from '../glyphs/flags/mq-flag';
import { MrFlag } from '../glyphs/flags/mr-flag';
import { MsFlag } from '../glyphs/flags/ms-flag';
import { MtFlag } from '../glyphs/flags/mt-flag';
import { MuFlag } from '../glyphs/flags/mu-flag';
import { MvFlag } from '../glyphs/flags/mv-flag';
import { MwFlag } from '../glyphs/flags/mw-flag';
import { MxFlag } from '../glyphs/flags/mx-flag';
import { MyFlag } from '../glyphs/flags/my-flag';
import { MzFlag } from '../glyphs/flags/mz-flag';
import { NaFlag } from '../glyphs/flags/na-flag';
import { NcFlag } from '../glyphs/flags/nc-flag';
import { NeFlag } from '../glyphs/flags/ne-flag';
import { NfFlag } from '../glyphs/flags/nf-flag';
import { NgFlag } from '../glyphs/flags/ng-flag';
import { NiFlag } from '../glyphs/flags/ni-flag';
import { NlFlag } from '../glyphs/flags/nl-flag';
import { NoFlag } from '../glyphs/flags/no-flag';
import { NpFlag } from '../glyphs/flags/np-flag';
import { NrFlag } from '../glyphs/flags/nr-flag';
import { NuFlag } from '../glyphs/flags/nu-flag';
import { NzFlag } from '../glyphs/flags/nz-flag';
import { OmFlag } from '../glyphs/flags/om-flag';
import { PaFlag } from '../glyphs/flags/pa-flag';
import { PeFlag } from '../glyphs/flags/pe-flag';
import { PfFlag } from '../glyphs/flags/pf-flag';
import { PgFlag } from '../glyphs/flags/pg-flag';
import { PhFlag } from '../glyphs/flags/ph-flag';
import { PkFlag } from '../glyphs/flags/pk-flag';
import { PlFlag } from '../glyphs/flags/pl-flag';
import { PmFlag } from '../glyphs/flags/pm-flag';
import { PrFlag } from '../glyphs/flags/pr-flag';
import { PsFlag } from '../glyphs/flags/ps-flag';
import { PtFlag } from '../glyphs/flags/pt-flag';
import { PwFlag } from '../glyphs/flags/pw-flag';
import { PyFlag } from '../glyphs/flags/py-flag';

interface CountryFlagGroupProps extends ComponentPropsWithoutRef<'svg'> {
  iso: string;
}

const flags: ReadonlyMap<string, IconComponent> = new Map([
  ['ma', MaFlag],
  ['mc', McFlag],
  ['md', MdFlag],
  ['me', MeFlag],
  ['mf', MfFlag],
  ['mg', MgFlag],
  ['mh', MhFlag],
  ['mk', MkFlag],
  ['ml', MlFlag],
  ['mm', MmFlag],
  ['mn', MnFlag],
  ['mo', MoFlag],
  ['mp', MpFlag],
  ['mq', MqFlag],
  ['mr', MrFlag],
  ['ms', MsFlag],
  ['mt', MtFlag],
  ['mu', MuFlag],
  ['mv', MvFlag],
  ['mw', MwFlag],
  ['mx', MxFlag],
  ['my', MyFlag],
  ['mz', MzFlag],
  ['na', NaFlag],
  ['nc', NcFlag],
  ['ne', NeFlag],
  ['nf', NfFlag],
  ['ng', NgFlag],
  ['ni', NiFlag],
  ['nl', NlFlag],
  ['no', NoFlag],
  ['np', NpFlag],
  ['nr', NrFlag],
  ['nu', NuFlag],
  ['nz', NzFlag],
  ['om', OmFlag],
  ['pa', PaFlag],
  ['pe', PeFlag],
  ['pf', PfFlag],
  ['pg', PgFlag],
  ['ph', PhFlag],
  ['pk', PkFlag],
  ['pl', PlFlag],
  ['pm', PmFlag],
  ['pr', PrFlag],
  ['ps', PsFlag],
  ['pt', PtFlag],
  ['pw', PwFlag],
  ['py', PyFlag],
]);

export default function CountryFlagGroup({ iso, ...props }: CountryFlagGroupProps) {
  const Flag = flags.get(iso);
  return Flag ? <Flag {...props} /> : null;
}
