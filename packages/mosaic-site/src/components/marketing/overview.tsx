'use client';

import { FeatureTabs } from '@/components/marketing/feature-tabs';
import { Container } from '@/components/ui/container';

export function OverviewSections() {
  return (
    <section aria-labelledby='overview-principles-heading'>
      <Container className='pt-16 md:pt-20'>
        <h2
          id='overview-principles-heading'
          className='heading-5 sm:heading-4 max-w-2xl text-balance text-gray-950 dark:text-white'
        >
          Built for agents,
          <br />
          ready for production.
        </h2>
        <FeatureTabs />
      </Container>
    </section>
  );
}
