import { Waitlist } from '@clerk/nextjs';

export default function Page() {
  return (
    <div>
      <Waitlist fallback={<>Loading waitlist</>} />
    </div>
  );
}
