import { ClerkProvider, useAuth, useUser } from '@clerk/nextjs';
import { dark } from '@clerk/nextjs/themes';

export default function App({ children }) {
  return <ClerkProvider appearance={{ baseTheme: dark }}>{children}</ClerkProvider>;
}

export function UserProfile() {
  const { isSignedIn } = useAuth();
  const { user } = useUser();

  if (!isSignedIn) {
    return <div>Not signed in</div>;
  }

  return <div>Hello, {user?.firstName}</div>;
}
