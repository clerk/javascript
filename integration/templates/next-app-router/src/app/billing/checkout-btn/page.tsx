import { Show } from '@clerk/nextjs';
import { CheckoutButton } from '@clerk/nextjs/experimental';

export default function Home() {
  return (
    <main>
      <Show when='signedIn'>
        <CheckoutButton
          planId='cplan_2wMjqdlza0hTJc4HLCoBwAiExhF'
          planPeriod='month'
        >
          Checkout Now
        </CheckoutButton>
      </Show>
    </main>
  );
}
