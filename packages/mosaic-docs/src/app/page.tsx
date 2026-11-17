import { AgentPrompt } from '@/components/agent-prompt';
import { LandingFooter, LandingFooterLinks } from '@/components/landing-footer';
import { site } from '@/lib/site';

export default function HomePage() {
  return (
    <>
      <div className='flex min-h-[calc(100dvh-4rem)] flex-col'>
        <main
          id='content'
          className='flex-1'
        >
          <section className='pb-16 pt-16 sm:pb-20 sm:pt-24'>
            <div className='max-w-350 mx-auto px-6'>
              <h1 className='mt-6 max-w-3xl text-balance text-4xl font-medium sm:text-5xl lg:text-6xl'>Mosaic</h1>
              <p className='text-muted-foreground mt-4 max-w-xl text-balance text-lg'>{site.description}</p>
              <div className='mt-8'>
                <AgentPrompt />
              </div>
            </div>
          </section>
        </main>
        <LandingFooterLinks />
      </div>
      <LandingFooter />
    </>
  );
}
