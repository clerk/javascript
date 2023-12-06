import { useEffect, useState } from 'react';
import { useAuth, useUser } from "@clerk/chrome-extension";

export function CurrentUser() {
  const [sessionToken, setSessionToken] = useState("");
  const { isSignedIn, user } = useUser();
  const { getToken, signOut } = useAuth();

  useEffect(() => {
    const scheduler = setInterval(async () => {
      const token = await getToken();
      setSessionToken(token as string);
    }, 1000);

    return () => clearInterval(scheduler);
  }, []);

  if (!isSignedIn) {
    return null;
  }

  const email = user.primaryEmailAddress?.emailAddress;

  return (
    <div className="content">
      <h2>Hi, {email ? `${email}!` : ''}</h2>

      <div>
        <p>Clerk Session Token:</p>
        <pre>{sessionToken}</pre>
      </div>

      <button type="button" onClick={() => signOut()} style={{ alignSelf: 'end'}}>Sign out</button>
    </div>
  );
}
