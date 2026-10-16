import type { ReactNode } from 'react';

import { useReverificationFlow } from '../../reverification';
import { useUserProfilePasskeysSectionController } from './user-profile-passkeys-section.controller';
import type { UserProfilePasskeysModel } from './user-profile-passkeys-section.model';
import { useUserProfilePasskeysModel } from './user-profile-passkeys-section.model';
import { UserProfilePasskeysSectionView } from './user-profile-passkeys-section.view';

export interface UserProfilePasskeysSectionProps {
  fallback?: ReactNode;
}

export function UserProfilePasskeysSection(props: UserProfilePasskeysSectionProps = {}) {
  const model = useUserProfilePasskeysModel();
  return passkeysSectionNode(model, props.fallback);
}

export function passkeysSectionNode(model: UserProfilePasskeysModel, fallback: ReactNode = null): ReactNode {
  if (model.status === 'loading') {
    return fallback || null;
  }
  if (model.status === 'hidden') {
    return null;
  }
  return (
    <PasskeysEditor
      key={`passkeys:${model.userId}:${model.sessionId}`}
      model={model}
    />
  );
}

function PasskeysEditor({ model }: { model: Extract<UserProfilePasskeysModel, { status: 'ready' }> }) {
  const [remove, reverification] = useReverificationFlow(model.onRemove);
  const controller = useUserProfilePasskeysSectionController({ ...model, onRemove: remove, reverification });
  return <UserProfilePasskeysSectionView {...controller} />;
}
