'use client';
import { useAuth } from '@clerk/nextjs';

export default function Page() {
  const { has, isLoaded } = useAuth();
  if (!isLoaded) {
    return <p>Loading</p>;
  }
  if (!has({ role: 'org:admin' })) {
    return <p>User is not admin</p>;
  }
  return <p>User has access</p>;
}
