import { FeatureTabs } from '@/components/marketing/feature-tabs';
import { Container } from '@/components/ui/container';

export function OverviewSections() {
  return (
    <section
      aria-labelledby='overview-heading'
      className='relative z-10'
    >
      <h2
        id='overview-heading'
        className='sr-only'
      >
        Overview
      </h2>
      <Container className='relative pb-40'>
        <FeatureTabs />
      </Container>
    </section>
  );
}
