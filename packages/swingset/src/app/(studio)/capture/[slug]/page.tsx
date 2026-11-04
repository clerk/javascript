import type { StudioOptions } from '@/studio/Studio';
import { StudioEntry } from '@/studio/StudioEntry';
import type { StudioBadges, StudioFormat, StudioScheme } from '@/studio/types';

type SearchParams = Record<string, string | string[] | undefined>;

function toOptions(params: SearchParams): StudioOptions {
  const read = (key: string) => (typeof params[key] === 'string' ? params[key] : undefined);
  return {
    step: Number(read('step')) || undefined,
    hold: params.hold !== undefined,
    autoplay: read('autoplay') !== '0',
    loop: read('loop') !== '0',
    cursor: read('cursor') !== '0',
    badges: read('badges') as StudioBadges | undefined,
    format: read('format') as StudioFormat | undefined,
    scheme: read('scheme') as StudioScheme | undefined,
  };
}

export default async function CapturePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { slug } = await params;
  return (
    <StudioEntry
      slug={slug}
      options={toOptions(await searchParams)}
    />
  );
}
