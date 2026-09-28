import type { MosaicLocalization } from '@clerk/mosaic/localization';
import { mosaicMessages } from '@clerk/mosaic/localization';

const CHAOS_SUFFIX = 'Ŵïţħ ëẍţŕą łöñğ ţêẍţ ţħąţ ẅŕąṗṡ Pneumonoultramicroscopicsilicovolcanoconiosis';

const CHAOS_NAMES = [
  'Maximiliana-Alexandrina Wolfeschlegelsteinhausenbergerdorff-Montgomery',
  'X',
  'محمد بن عبد الرحمن آل سعود',
  '李小龍',
  'Zoë Ångström-Ñúñez',
  "Seán O'Brien-Smith 🦄🚀",
  'Z̴̢a̷̛l̸̨g̵̢o̶̧ ̷̨T̵̛e̸̢x̴̨t̶̛',
  'ALLCAPSNAMEWITHOUTANYSPACESTHATJUSTKEEPSGOINGANDGOINGANDGOING',
  '<b>Not Bold</b> & "Quoted"',
];

const CHAOS_EMAILS = [
  'maximiliana.alexandrina.wolfeschlegelsteinhausenbergerdorff+notifications@engineering.eu-west.very-long-company-name.example.com',
  'x@y.co',
  'first.last+tag+another-tag@xn--80ak6aa92e.com',
  '"quoted local part"@example.com',
  '用户@例子.广告',
  'ALL.CAPS.ADDRESS@EXAMPLE.COM',
];

export function chaosText(text: string): string;
export function chaosText(text: string | undefined): string | undefined;
export function chaosText(text: string | undefined) {
  return text === undefined ? undefined : `${text} ${CHAOS_SUFFIX}`;
}

export function chaosName(index: number) {
  return CHAOS_NAMES[index % CHAOS_NAMES.length];
}

export function chaosEmail(index: number) {
  return CHAOS_EMAILS[index % CHAOS_EMAILS.length];
}

export function chaosRows<T extends { id: string }>(items: readonly T[], count = 60) {
  if (items.length === 0) {
    return [];
  }
  return Array.from({ length: Math.max(count, items.length) }, (_, index) => {
    const item = items[index % items.length];
    return index < items.length ? item : { ...item, id: `${item.id}-chaos-${index}` };
  });
}

type Stretched<T> = { [K in keyof T]: T[K] extends string ? string : Stretched<T[K]> };

function stretch<T extends object>(tree: T): Stretched<T> {
  const entries = Object.entries(tree).map(([key, value]) => [
    key,
    typeof value === 'string' ? chaosText(value) : stretch(value),
  ]);
  return Object.fromEntries(entries) as Stretched<T>;
}

export const chaosLocalization: MosaicLocalization = { messages: stretch(mosaicMessages) };
