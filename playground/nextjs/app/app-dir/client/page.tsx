'use client';
import { Show } from '@clerk/nextjs';

export default function Page() {
  return (
    <div>
      <Show when='signed-in'>Hello In</Show>
      <Show when='signed-out'>Hello Out</Show>
    </div>
  );
}
