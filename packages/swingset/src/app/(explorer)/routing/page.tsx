import Link from 'next/link';

import { routingDemos } from '@/components/routing-demo/demos';

export default function RoutingOverviewPage() {
  return (
    <div className='mx-auto flex w-full max-w-5xl flex-col gap-6 p-3 sm:p-8'>
      <div className='flex flex-col gap-1'>
        <h1 className='text-xl font-semibold'>Routing</h1>
        <p className='text-muted-foreground text-sm'>
          A Mosaic component owns one segment of the page&apos;s location and derives its page or step from it. Where
          that segment lives is the component&apos;s <code className='font-mono text-xs'>routing</code>:{' '}
          <code className='font-mono text-xs'>virtual</code> keeps it in memory,{' '}
          <code className='font-mono text-xs'>path</code> in the pathname under{' '}
          <code className='font-mono text-xs'>path</code>, <code className='font-mono text-xs'>hash</code> and{' '}
          <code className='font-mono text-xs'>query</code> in one param per component. These pages show each of them on
          components with nothing in them but routing, so nothing here needs a session.
        </p>
      </div>
      <ul className='flex flex-col gap-2 text-sm'>
        {routingDemos.slice(1).map(({ href, label }) => (
          <li key={href}>
            <Link
              href={href}
              className='text-foreground underline underline-offset-4'
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
      <p className='text-muted-foreground text-sm'>
        The URL modes read and write the page through the Next.js adapter in{' '}
        <code className='font-mono text-xs'>src/lib/mosaic-next-router-adapter.ts</code>, two hooks from{' '}
        <code className='font-mono text-xs'>next/navigation</code> and nothing else. Every page keeps its mode in a{' '}
        <code className='font-mono text-xs'>mode</code> query param of its own, which the carriers leave alone.
      </p>
    </div>
  );
}
