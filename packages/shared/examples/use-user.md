<!-- #region nextjs-01 -->

```tsx {{ filename: 'app/page.tsx' }}
'use client';

import { useUser } from '@clerk/nextjs';

export default function HomePage() {
  const { isLoaded, user } = useUser();

  if (!isLoaded) {
    // Handle loading state
    return null;
  }

  if (!user) return null;

  const updateUser = async () => {
    await user.update({
      firstName: 'John',
      lastName: 'Doe',
    });
  };

  return (
    <>
      <button onClick={updateUser}>Update your name</button>
      <p>user.firstName: {user?.firstName}</p>
      <p>user.lastName: {user?.lastName}</p>
    </>
  );
}
```

<!-- #endregion nextjs-01 -->

<!-- #region nextjs-02 -->

```tsx {{ filename: 'app/page.tsx' }}
'use client';

import { useUser } from '@clerk/nextjs';

export default function HomePage() {
  const { isLoaded, user } = useUser();

  if (!isLoaded) {
    // Handle loading state
    return null;
  }

  if (!user) return null;

  const updateUser = async () => {
    // Update data via an API endpoint
    const updateMetadata = await fetch('/api/updateMetadata');

    // Check if the update was successful
    if (updateMetadata.message !== 'success') {
      throw new Error('Error updating');
    }

    // If the update was successful, reload the user data
    await user.reload();
  };

  return (
    <>
      <button onClick={updateUser}>Update your metadata</button>
      <p>user role: {user?.publicMetadata.role}</p>
    </>
  );
}
```

<!-- #endregion nextjs-02 -->
