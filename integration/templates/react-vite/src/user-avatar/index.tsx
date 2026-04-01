import { UserAvatar } from '@clerk/react';
import React from 'react';

export default function UserAvatarPage() {
  return (
    <div>
      <h1>UserAvatar</h1>
      <UserAvatar fallback={<>Loading user avatar</>} />
    </div>
  );
}
