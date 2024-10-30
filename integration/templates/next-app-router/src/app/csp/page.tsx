import { header } from 'ezheaders';
import { ClerkLoaded } from '@clerk/nextjs';

export default async function CSPPage() {
  const cspHeader = await header('Content-Security-Policy');

  return (
    <div>
      CSP: <pre>{cspHeader}</pre>
      <ClerkLoaded>
        <p>clerk loaded</p>
      </ClerkLoaded>
    </div>
  );
}
