import type * as React from 'react';

import { HeroGrid } from '@/components/marketing/hero-grid';
import { HeroMicrographic } from '@/components/marketing/hero-micrographic';
import { SkillUrl } from '@/components/marketing/skill-url';
import { PromptBar } from '@/components/prompt-bar/prompt-bar';
import { INSTALL_COMMAND } from '@/lib/agent-prompt';

export function HeroQuilt({ scene, anchor }: { scene: React.ReactNode; anchor?: React.ReactNode }) {
  return (
    <section className='bg-background text-foreground pt-(--hero-pt) relative isolate -mt-14 flex flex-col items-center overflow-hidden px-6 pb-28 text-center [--hero-anchor:10rem] [--hero-pt:104px] sm:[--hero-anchor:13rem] sm:[--hero-pt:240px] 2xl:[--hero-anchor:16rem] 2xl:[--hero-pt:280px]'>
      <HeroGrid />
      {scene}
      <div
        data-mosaic-focus
        className='size-(--hero-anchor) relative'
      >
        {anchor}
      </div>
      <HeroMicrographic />
      <h1 className='heading-3 sm:heading-2 2xl:heading-1 mt-2 max-w-3xl text-balance'>
        Prebuilt auth UI
        <br />
        that doesn&apos;t box you in
      </h1>
      <p className='body-2 mt-2 max-w-xl text-balance text-neutral-600 dark:text-neutral-400'>
        Sign-in, account, and organization screens on Clerk. <br className='max-sm:hidden' />
        Change the layout, styles, or fields yourself, or ask your agent.
      </p>
      <div
        data-hero-end
        className='mt-8 flex w-full max-w-xl flex-col items-center gap-3'
      >
        <PromptBar
          command={INSTALL_COMMAND}
          align='center'
          tone={{ light: 'gray-50', dark: 'gray-800' }}
        />
        <SkillUrl />
      </div>
    </section>
  );
}
