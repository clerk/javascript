import { Show, UserButton } from '@clerk/react-router';
import type { Route } from './+types/home';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'New React Router App' }, { name: 'description', content: 'Welcome to React Router!' }];
}

export default function Home() {
  return (
    <div>
      <UserButton />
      <Show when='signed-in'>SignedIn</Show>
      <Show when='signed-out'>SignedOut</Show>
    </div>
  );
}
