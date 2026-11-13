import { FeatureTabs } from '@/components/marketing/feature-tabs';
import { Container } from '@/components/ui/container';

export function OverviewSections() {
  return (
    <section
      aria-label='Overview'
      className='relative z-10'
    >
      <Container className='relative pb-40'>
        <FeatureTabs />
      </Container>
    </section>
  );
}
