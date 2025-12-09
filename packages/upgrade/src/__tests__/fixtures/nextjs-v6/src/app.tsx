import { ClerkProvider, useAuth } from '@clerk/nextjs';
import { useUser } from '@clerk/clerk-react';

export default function App({ children }) {
  return <ClerkProvider>{children}</ClerkProvider>;
}

export function UserProfile() {
  const { isSignedIn } = useAuth();
  const { user } = useUser();

  if (!isSignedIn) {
    return <div>Not signed in</div>;
  }

  return <div>Hello, {user?.firstName}</div>;
}
