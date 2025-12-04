import { Waitlist } from '@clerk/react';

export default function Page() {
  return (
    <div>
      <Waitlist fallback={<>Loading waitlist</>} />
    </div>
  );
}
