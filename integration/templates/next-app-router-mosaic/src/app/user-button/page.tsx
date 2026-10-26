'use client';

import { UserButton } from '@clerk/mosaic';
import { use } from 'react';

import { ConcurrencyHarness } from '../concurrency-harness';

export default function Page({ searchParams }: { searchParams: Promise<{ extra?: string }> }) {
  const { extra } = use(searchParams);
  return <ConcurrencyHarness extra={extra}>{() => <UserButton />}</ConcurrencyHarness>;
}
