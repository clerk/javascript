import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/react-router';
import './App.css';

function App() {
  return (
    <header>
      <SignedOut>
        <SignInButton />
      </SignedOut>
      <SignedIn>
        <UserButton />
      </SignedIn>
    </header>
  );
}

export default App;
