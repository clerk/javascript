"use client"

import styles from './page.module.css';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';

declare global {
  interface UserPublicMetadata {
    spotifyToken?: string;
    isNewUser?: boolean;
  }
}

export default function Home() {
  const { getToken } = useAuth();

  // Fetching on `useEffect` works
  // useEffect(() => {
  //   async function test() {
  //     console.log('testttt', await getToken())
  //   }

  //   test()
  // }, [getToken])

  const organizationSettings = useSuspenseQuery({
    queryFn: async () => {
      console.log(await getToken())

      return fetch('https://api.github.com/users/octocat')
    },
    queryKey: ["organizationSettings"],
  });

  console.log({ organizationSettings })

  return (
    <main className={styles.main}>
    </main>
  );
}
