'use client';

import { notFound } from 'next/navigation';

import { getShowcase } from './showcases';
import { Studio, type StudioOptions } from './Studio';

export function StudioEntry({ slug, options }: { slug: string; options: StudioOptions }) {
  const showcase = getShowcase(slug);
  if (!showcase) {
    notFound();
  }
  return (
    <Studio
      showcase={showcase}
      options={options}
    />
  );
}
