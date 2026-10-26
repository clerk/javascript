'use client';

import { MosaicProvider } from '@clerk/mosaic';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { Activity, startTransition, Suspense, use, useRef, useState } from 'react';

type HarnessPage = { label: string; path: string; content: ReactNode };

export function ConcurrencyHarness({
  extra,
  children,
}: {
  extra: string | undefined;
  children: (customPages: HarnessPage[]) => ReactNode;
}) {
  const pathname = usePathname();
  const [hidden, setHidden] = useState(false);
  const [transitions, setTransitions] = useState(0);
  const [customPageShown, setCustomPageShown] = useState(true);
  const [suspension, setSuspension] = useState<Promise<void> | null>(null);
  const resume = useRef<() => void>(() => {});

  function suspendHost() {
    setSuspension(
      new Promise<void>(resolve => {
        resume.current = resolve;
      }),
    );
  }

  const customPages = [
    ...(customPageShown
      ? [
          {
            label: 'Custom page',
            path: 'custom-page',
            content: (
              <>
                <p>profile-transitions-{transitions}</p>
                <Link href='/custom/link-target'>Leave profile</Link>
              </>
            ),
          },
        ]
      : []),
    ...(extra
      ? [{ label: 'Extra page', path: 'extra-page', content: <Link href={pathname}>Drop extra page</Link> }]
      : []),
  ];

  return (
    <MosaicProvider>
      <button onClick={() => setHidden(value => !value)}>{hidden ? 'Show surface' : 'Hide surface'}</button>
      <button onClick={() => startTransition(() => setTransitions(count => count + 1))}>Host transition</button>
      <button onClick={() => setCustomPageShown(false)}>Drop custom page</button>
      <button onClick={() => setCustomPageShown(true)}>Restore custom page</button>
      <button onClick={() => startTransition(() => setCustomPageShown(true))}>Restore custom page in transition</button>
      <Link href={`${pathname}?extra=1`}>Restore extra page</Link>
      <button onClick={suspendHost}>Suspend host</button>
      <button onClick={() => resume.current()}>Resume host</button>
      <p>host-transitions-{transitions}</p>
      <p>{customPageShown ? 'custom-page-shown' : 'custom-page-dropped'}</p>
      <p>{extra ? 'extra-page-shown' : 'extra-page-dropped'}</p>
      <Suspense fallback={<p>host-suspended</p>}>
        <SuspendOn promise={suspension} />
        <Activity mode={hidden ? 'hidden' : 'visible'}>{children(customPages)}</Activity>
      </Suspense>
    </MosaicProvider>
  );
}

function SuspendOn({ promise }: { promise: Promise<void> | null }) {
  if (promise) {
    use(promise);
  }
  return null;
}
