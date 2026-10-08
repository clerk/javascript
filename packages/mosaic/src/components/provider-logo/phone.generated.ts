import { whatsapp } from './glyphs/whatsapp.generated';
import type { ProviderLogoGlyph } from './provider-logo.types';

export const phoneLogos = {
  whatsapp,
} satisfies Record<string, ProviderLogoGlyph>;

export type PhoneLogoId = keyof typeof phoneLogos;

const lookup: ReadonlyMap<string, ProviderLogoGlyph> = new Map(Object.entries(phoneLogos));

export function getPhoneLogo(id: string): ProviderLogoGlyph | undefined {
  return lookup.get(id);
}
