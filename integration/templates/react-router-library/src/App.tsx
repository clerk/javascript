import { Show, SignInButton, UserButton } from '@clerk/react-router';
import './App.css';

function App() {
  return (
    <header>
      <Show when='signedOut'>
        <SignInButton />
      </Show>
      <Show when='signedIn'>
        <UserButton />
      </Show>
    </header>
  );
}

export default App;
