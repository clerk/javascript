'use client';
import { Show } from '@clerk/nextjs';

export default function Page() {
  return (
    <div>
      {/* @ts-ignore */}
      <Show when='signedIn'>Hello In</Show>
      {/* @ts-ignore */}
      <Show when='signedOut'>Hello Out</Show>
    </div>
  );
}
