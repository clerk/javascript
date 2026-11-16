import { readFileSync } from 'node:fs';
import path from 'node:path';

// Generated from ../swingset by scripts/generate.mts (runs before dev and build). Don't edit by hand.
const CONTENT_DIR = path.join(process.cwd(), '.content');

export const SECTIONS = [
  { slug: 'components', title: 'Components', description: 'Styled building blocks for Clerk interfaces.' },
  { slug: 'primitives', title: 'Primitives', description: 'Headless, unstyled behavior and accessibility parts.' },
  { slug: 'hooks', title: 'Hooks', description: 'State and logic for building with Mosaic.' },
] as const;

type SectionSlug = (typeof SECTIONS)[number]['slug'];

type ManifestEntry = { slug: string; title: string; description?: string };
export type Manifest = Record<SectionSlug, Array<ManifestEntry>>;

export type Prop = { name: string; type: string; default?: string };

export type MosaicItem = {
  section: SectionSlug;
  slug: string;
  title: string;
  description?: string;
  source?: string;
  body: string;
  examples: Record<string, string>;
  props: Array<Prop> | null;
};

export function getManifest(): Manifest {
  return JSON.parse(readFileSync(path.join(CONTENT_DIR, 'manifest.json'), 'utf8'));
}

export function getItem(section: string, slug: string): MosaicItem | null {
  if (!SECTIONS.some(s => s.slug === section) || !/^[a-z0-9-]+$/.test(slug)) {
    return null;
  }
  try {
    return JSON.parse(readFileSync(path.join(CONTENT_DIR, section, `${slug}.json`), 'utf8'));
  } catch {
    return null;
  }
}

export function getSection(slug: string) {
  return SECTIONS.find(s => s.slug === slug) ?? null;
}

/** The first sentence of a lede, for index cards. */
export function summarize(description?: string) {
  if (!description) {
    return undefined;
  }
  const text = description.replace(/\s+/g, ' ').replace(/\*\*/g, '').trim();
  const match = text.match(/^.+?[.!?](?=\s|$)/);
  return (match ? match[0] : text).replace(/`/g, '');
}

/** Flat list in sidebar order, for previous/next links. */
export function getOrderedEntries() {
  const manifest = getManifest();
  return SECTIONS.flatMap(section =>
    (manifest[section.slug] ?? []).map(entry => ({
      ...entry,
      section: section.slug,
      href: itemHref(section.slug, entry.slug),
    })),
  );
}

export function itemHref(section: string, slug: string) {
  return `/${section}/${slug}`;
}

export const SOURCE_REPO = 'https://github.com/clerk/javascript/blob/main/';
