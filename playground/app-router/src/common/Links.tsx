import Link from 'next/link';

export const Links = () => {
  return (
    <div style={{ display: 'flex', gap: '3rem' }}>
      <div>
        <h3>App router:</h3>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <Link href={'/'}>Home</Link>
          <Link href={'/sign-in' as any}>Sign in</Link>
          <Link href={'/sign-up' as any}>Sign up</Link>
          <Link href={'/protected' as any}>Protected (auth())</Link>
          <Link href={'/action' as any}>Server action</Link>
        </div>
      </div>
      <div>
        <h3>Pages:</h3>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <Link href={'/user' as any}>/user (SSR and gSSP) (getAuth())</Link>
          <Link href={'/profile' as any}>/profile (no SSR)</Link>
        </div>
      </div>
    </div>
  );
};
