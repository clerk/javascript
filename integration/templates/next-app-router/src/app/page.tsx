import { Show, SignIn, UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import { ClientId } from './client-id';

export default function Home() {
  return (
    <main>
      <UserButton fallback={<>Loading user button</>} />
      <ClientId />
      <Show when='signedIn'>SignedIn</Show>
      <Show when='signedOut'>SignedOut</Show>
      <Show
        fallback={'SignedOut from protect'}
        when='signedIn'
      >
        SignedIn from protect
      </Show>
      <Show when={{ plan: 'free_user' }}>
        <p>user in free</p>
      </Show>
      <Show when={{ plan: 'pro' }}>
        <p>user in pro</p>
      </Show>
      <Show when={{ plan: 'plus' }}>
        <p>user in plus</p>
      </Show>
      <SignIn
        routing='hash'
        signUpUrl={'/sign-up'}
      />
      <ul>
        <li>
          <Link href='/page-protected'>Page Protected</Link>
          <Link href='/protected'>Protected</Link>
        </li>
      </ul>
    </main>
  );
}
