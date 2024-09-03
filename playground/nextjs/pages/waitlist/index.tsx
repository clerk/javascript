import type {  NextPage } from 'next';
import { __experimental_Waitlist, useClerk } from '@clerk/nextjs';

const WailistPage: NextPage = () => {
  const clerk = useClerk();

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <__experimental_Waitlist />
      </div>
      <div style={{ textAlign: 'center' , marginTop: '1rem' }}>
        <button type='button' onClick={() => clerk.__experimental_openWaitlist()}>open waitlist</button>
      </div>
    </>
  )
}

export default WailistPage;