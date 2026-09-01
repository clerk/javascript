import { Card } from '@clerk/ui/mosaic/components/card';
import type { ReactNode } from 'react';

export function ReverificationStoryCard({ children }: { children: ReactNode }) {
  return <Card.Root>{children}</Card.Root>;
}
