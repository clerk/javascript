import { notFound } from 'next/navigation';
import type React from 'react';

export default function BrandLayout({ children }: { children: React.ReactNode }) {
  if (process.env.NODE_ENV !== 'development' && process.env.MOSAIC_BRAND !== '1') {
    notFound();
  }
  return children;
}
