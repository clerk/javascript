import { Show } from '@clerk/react';

export default function Page() {
  return (
    <div>
      <Show when='signed-in'>
        <div data-testid='protected'>Protected</div>
      </Show>
    </div>
  );
}
