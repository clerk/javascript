import { Show, SignIn, SignOutButton, UserButton } from '@clerk/tanstack-react-start';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: Home,
});

function Home() {
  return (
    <div>
      <h1>Index Route</h1>
      <Show when='signed-in'>
        <p>You are signed in!</p>
        <div>
          <p>View your profile here</p>
          <UserButton />
        </div>
        <div>
          <SignOutButton />
        </div>
      </Show>
      <Show when='signed-out'>
        <p>You are signed out</p>

        <SignIn />
      </Show>
    </div>
  );
}
