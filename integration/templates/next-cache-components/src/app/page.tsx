import Link from 'next/link';

export default function Home() {
  return (
    <main>
      <h1>Next.js Cache Components Test App</h1>
      <p>Test scenarios for cache components with Clerk integration.</p>

      <nav style={{ marginTop: '2rem' }}>
        <h2>Test Scenarios</h2>
        <ul>
          <li>
            <Link href='/auth-server-component'>auth() in Server Component</Link>
          </li>
          <li>
            <Link href='/current-user-server-component'>currentUser() in Server Component</Link>
          </li>
          <li>
            <Link href='/auth-server-action'>auth() in Server Action</Link>
          </li>
          <li>
            <Link href='/api/auth-check'>auth() in API Route</Link>
          </li>
          <li>
            <Link href='/use-cache-error'>use cache with auth() (documentation)</Link>
          </li>
          <li>
            <Link href='/use-cache-error-trigger'>use cache error trigger (actual error)</Link>
          </li>
          <li>
            <Link href='/use-cache-correct'>&quot;use cache&quot; correct pattern (auth)</Link>
          </li>
          <li>
            <Link href='/current-user-cache-correct'>&quot;use cache&quot; correct pattern (currentUser)</Link>
          </li>
          <li>
            <Link href='/ppr-auth'>PPR with auth()</Link>
          </li>
          <li>
            <Link href='/protected'>Protected Route (middleware)</Link>
          </li>
          <li>
            <Link href='/sign-in'>Sign In</Link>
          </li>
        </ul>
      </nav>
    </main>
  );
}
