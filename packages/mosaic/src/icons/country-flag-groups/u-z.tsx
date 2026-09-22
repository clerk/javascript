import type { ComponentPropsWithoutRef } from 'react';

import type { IconComponent } from '../glyph';
import { UaFlag } from '../glyphs/flags/ua-flag';
import { UgFlag } from '../glyphs/flags/ug-flag';
import { UsFlag } from '../glyphs/flags/us-flag';
import { UyFlag } from '../glyphs/flags/uy-flag';
import { UzFlag } from '../glyphs/flags/uz-flag';
import { VaFlag } from '../glyphs/flags/va-flag';
import { VcFlag } from '../glyphs/flags/vc-flag';
import { VeFlag } from '../glyphs/flags/ve-flag';
import { VgFlag } from '../glyphs/flags/vg-flag';
import { ViFlag } from '../glyphs/flags/vi-flag';
import { VnFlag } from '../glyphs/flags/vn-flag';
import { VuFlag } from '../glyphs/flags/vu-flag';
import { WfFlag } from '../glyphs/flags/wf-flag';
import { WsFlag } from '../glyphs/flags/ws-flag';
import { XkFlag } from '../glyphs/flags/xk-flag';
import { YeFlag } from '../glyphs/flags/ye-flag';
import { YtFlag } from '../glyphs/flags/yt-flag';
import { ZaFlag } from '../glyphs/flags/za-flag';
import { ZmFlag } from '../glyphs/flags/zm-flag';
import { ZwFlag } from '../glyphs/flags/zw-flag';

interface CountryFlagGroupProps extends ComponentPropsWithoutRef<'svg'> {
  iso: string;
}

const flags: ReadonlyMap<string, IconComponent> = new Map([
  ['ua', UaFlag],
  ['ug', UgFlag],
  ['us', UsFlag],
  ['uy', UyFlag],
  ['uz', UzFlag],
  ['va', VaFlag],
  ['vc', VcFlag],
  ['ve', VeFlag],
  ['vg', VgFlag],
  ['vi', ViFlag],
  ['vn', VnFlag],
  ['vu', VuFlag],
  ['wf', WfFlag],
  ['ws', WsFlag],
  ['xk', XkFlag],
  ['ye', YeFlag],
  ['yt', YtFlag],
  ['za', ZaFlag],
  ['zm', ZmFlag],
  ['zw', ZwFlag],
]);

export default function CountryFlagGroup({ iso, ...props }: CountryFlagGroupProps) {
  const Flag = flags.get(iso);
  return Flag ? <Flag {...props} /> : null;
}
