import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Container } from '@/components/ui/container';

export function BetaBanner() {
  return (
    <div className='relative z-30 bg-yellow-500 text-gray-950'>
      <Container className='label-3 flex min-h-9 flex-wrap items-center justify-center gap-x-3 gap-y-1 py-2 text-center'>
        <Badge>Beta</Badge>
        <span className='trim-cap'>Clerk UI is in beta. APIs can change between minor releases.</span>
        <Link
          href='/changelog'
          className='trim-cap focus-visible:outline-focus underline decoration-gray-950/40 underline-offset-2 hover:decoration-gray-950'
        >
          What’s new →
        </Link>
      </Container>
    </div>
  );
}
