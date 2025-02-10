import { UserProfile } from '@clerk/nextjs';

export default function Page() {
  return <UserProfile path='/app-dir/user' />;
}
