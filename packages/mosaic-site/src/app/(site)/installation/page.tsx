import type { Metadata } from 'next';

import { CodeBlock } from '@/components/gallery/docs';
import { DocsShell } from '@/components/marketing/docs-shell';
import { PromptBar } from '@/components/prompt-bar/prompt-bar';
import { AGENT_PROMPT } from '@/lib/agent-prompt';
export const metadata: Metadata = {
  title: 'Installation · Clerk Components',
  description: 'Install @clerk/mosaic, import its styles and render your first component.',
};
const copy = 'text-[17px] leading-[1.7] text-neutral-600 dark:text-neutral-400 mt-5';
const heading = { fontFamily: 'var(--font-heading)' };
const STEPS = [
  {
    title: 'Install the package',
    body: 'Mosaic is published as @clerk/mosaic. It is experimental, so pin an exact version.',
    code: `pnpm add --save-exact @clerk/mosaic
npm install --save-exact @clerk/mosaic
yarn add --exact @clerk/mosaic`,
  },
  {
    title: 'Import the styles',
    body: 'Import the stylesheet once, at the root of your app.',
    code: `import '@clerk/mosaic/styles.css';`,
  },
  {
    title: 'Render a component',
    body: 'Mosaic components read from your existing Clerk session, so render them beneath the ClerkProvider of your SDK.',
    code: `import { ClerkProvider } from '@clerk/react';
import { UserButton } from '@clerk/mosaic';
import '@clerk/mosaic/styles.css';

export function App({ children }) {
  return (
    <ClerkProvider publishableKey={process.env.CLERK_PUBLISHABLE_KEY}>
      <UserButton />
      {children}
    </ClerkProvider>
  );
}`,
  },
  {
    title: 'Make your styles win',
    body: 'To theme the components with your own CSS, import the stylesheet into a cascade layer. Your unlayered CSS then takes priority.',
    code: `@import '@clerk/mosaic/styles.css' layer(components);`,
  },
];
const REQUIREMENTS = [
  'Node.js 20.9 or later',
  'React 18 or 19',
  '@clerk/react 6 or later, or @clerk/nextjs 7 or later, rendering a ClerkProvider',
];
export default function Page() {
  return (
    <DocsShell title='Installation'>
      <main className='mx-auto w-full max-w-[760px] px-6 pb-32 pt-16'>
        <h1
          className='text-[clamp(40px,6vw,64px)] font-semibold leading-[1] tracking-[-0.045em]'
          style={heading}
        >
          Installation
        </h1>
        <p className={copy}>
          Add Clerk&apos;s next generation of components to your project, or hand the whole thing to your coding agent.
        </p>
        <h2
          className='mt-16 text-[34px] font-medium leading-[1.1] tracking-[-0.03em]'
          style={heading}
        >
          Let your agent do it
        </h2>
        <p className={copy}>Paste this prompt into your coding agent and it will wire Mosaic into your app.</p>
        <div className='mt-6'>
          <PromptBar command={AGENT_PROMPT} />
        </div>
        <h2
          className='mt-16 text-[34px] font-medium leading-[1.1] tracking-[-0.03em]'
          style={heading}
        >
          Requirements
        </h2>
        <ul className='mt-5 flex flex-col gap-3'>
          {REQUIREMENTS.map(item => (
            <li
              key={item}
              className='relative pl-7 text-[17px] leading-[1.7] text-neutral-600 dark:text-neutral-400'
            >
              <span className='absolute left-1.5 top-[0.8em] size-1.5 rounded-full bg-neutral-400/60' />
              {item}
            </li>
          ))}
        </ul>
        <h2
          className='mt-16 text-[34px] font-medium leading-[1.1] tracking-[-0.03em]'
          style={heading}
        >
          Or do it yourself
        </h2>
        {STEPS.map((step, index) => (
          <section
            key={step.title}
            className='mt-12'
          >
            <h3
              className='text-[24px] font-medium leading-[1.2] tracking-[-0.02em]'
              style={heading}
            >
              <span className='mr-3 font-mono text-[15px] font-normal text-neutral-400'>0{index + 1}</span>
              {step.title}
            </h3>
            <p className={copy}>{step.body}</p>
            <CodeBlock code={step.code} />
          </section>
        ))}
        <h2
          className='mt-16 text-[34px] font-medium leading-[1.1] tracking-[-0.03em]'
          style={heading}
        >
          Next
        </h2>
        <p className={copy}>
          Browse the components to find one to start with, or see the brand colors Mosaic is built from.
        </p>
      </main>
    </DocsShell>
  );
}
