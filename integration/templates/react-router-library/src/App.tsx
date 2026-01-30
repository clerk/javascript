import { Show, SignInButton, UserButton } from '@clerk/react-router';
import './App.css';

function App() {
  return (
    <header>
      <Show when='signed-out'>
        <SignInButton />
      </Show>
      <Show when='signed-in'>
        <UserButton />
      </Show>
    </header>
  );
}

export default App;
