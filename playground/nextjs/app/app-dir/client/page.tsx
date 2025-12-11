'use client';
import { Show } from '@clerk/nextjs';

export default function Page() {
  return (
    <div>
      <Show when='signedIn'>Hello In</Show>
      <Show when='signedOut'>Hello Out</Show>
    </div>
  );
}
