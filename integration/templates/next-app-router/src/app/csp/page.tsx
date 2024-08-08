import { headers } from 'next/headers';
import { ClerkLoaded } from '@clerk/nextjs';

export default function CSPPage() {
  return (
    <div>
      CSP: <pre>{headers().get('Content-Security-Policy')}</pre>
      <ClerkLoaded>
        <p>clerk loaded</p>
      </ClerkLoaded>
    </div>
  );
}
