import { Otp } from '@clerk/headless/otp';

import type { StoryMeta } from '@/lib/types';

// Headless primitives ship no styles. This single demo renders the primitive raw —
// unstyled — so it faithfully reflects what `@clerk/headless` provides: per-character
// slots, focus advancing as you type, paste distribution, and the `data-*` attributes
// each part emits, with zero appearance. It is embedded once into the overview via
// `<Story>` in the MDX (the one thing prose can't convey: that typing, deleting, and
// pasting actually move focus across the slots). There is no interactive knob canvas for
// headless primitives.

export const meta: StoryMeta = {
  group: 'Primitives',
  title: 'OTP',
  source: 'packages/headless/src/primitives/otp/index.ts',
};

function Slots() {
  const { slots } = Otp.useOtp();
  return slots.map(slot => (
    <Otp.Input
      key={slot.index}
      index={slot.index}
    />
  ));
}

export function Default() {
  return (
    <Otp.Root
      length={6}
      aria-label='Verification code'
    >
      <Slots />
    </Otp.Root>
  );
}
