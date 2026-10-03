import type { ReactNode } from 'react';

import { UserProfilePasskeysSectionView } from '../user-profile-passkeys-section.view';
import { useUserProfilePasskeysSectionController } from './user-profile-passkeys-section.controller';
import type { UserProfilePasskeysModel } from './user-profile-passkeys-section.model';
import { useUserProfilePasskeysModel } from './user-profile-passkeys-section.model';
import type { UserProfilePasskeysSlot } from './user-profile-passkeys-section.types';

export interface UserProfilePasskeysSectionProps {
  fallback?: ReactNode;
}

export function UserProfilePasskeysSection(props: UserProfilePasskeysSectionProps = {}) {
  return useUserProfilePasskeysSlot(props)?.content ?? null;
}

export function useUserProfilePasskeysSlot({
  fallback = null,
}: UserProfilePasskeysSectionProps = {}): UserProfilePasskeysSlot | null {
  const model = useUserProfilePasskeysModel();
  if (model.status === 'loading') {
    return fallback ? { content: fallback } : null;
  }
  if (model.status === 'hidden') {
    return null;
  }
  return {
    content: (
      <PasskeysEditor
        key={`passkeys:${model.userId}:${model.sessionId}`}
        model={model}
      />
    ),
  };
}

function PasskeysEditor({ model }: { model: Extract<UserProfilePasskeysModel, { status: 'ready' }> }) {
  const controller = useUserProfilePasskeysSectionController({ onAdd: model.onAdd });
  return (
    <UserProfilePasskeysSectionView
      passkeys={model.passkeys}
      {...controller}
      onRename={model.onRename}
      validateName={model.validateName}
      onRemove={model.onRemove}
    />
  );
}
