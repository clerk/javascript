import * as React from 'react';
import { useAuth, useUser } from "@clerk/chrome-extension";

export function CurrentUser() {
  const [sessionToken, setSessionToken] = React.useState("");
  const { isSignedIn, user } = useUser();
  const { getToken, signOut } = useAuth();

  React.useEffect(() => {
    const scheduler = setInterval(async () => {
      const token = await getToken();
      console.log("Getting token", token)
      setSessionToken(token as string);
    }, 1000);

    return () => clearInterval(scheduler);
  }, []);

  if (!isSignedIn) {
    return null;
  }

  const email = user.primaryEmailAddress?.emailAddress;

  return (
    <div className="flex">
      <h2>Hi, {email ? `${email}!` : ''}</h2>
      <p>Clerk Session Token:</p>
      <pre className="Clerk-session-token">{sessionToken}</pre>

      <button onClick={() => signOut()}>Sign out</button>
    </div>
  );
}
