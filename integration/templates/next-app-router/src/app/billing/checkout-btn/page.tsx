import { CheckoutButton, SignedIn } from '@clerk/nextjs';

export default function Home() {
  return (
    <main>
      <SignedIn>
        <CheckoutButton
          planId='cplan_2wMjqdlza0hTJc4HLCoBwAiExhF'
          planPeriod='month'
        >
          Checkout Now
        </CheckoutButton>
      </SignedIn>
    </main>
  );
}
