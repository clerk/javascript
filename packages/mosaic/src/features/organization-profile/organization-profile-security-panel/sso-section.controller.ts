import type { Ref } from 'react';
import { useRef, useState } from 'react';

import type { ConfirmController } from '../../../blocks/confirm';
import { useConfirmController } from '../../../blocks/confirm';
import type { DialogFocusTarget } from '../../../components/dialog';
import { useListRemovalFocus } from '../../../hooks/use-list-removal-focus';
import { usePendingAction } from '../../../hooks/use-pending-action';
import { useMessages } from '../../../localization';
import type { SSOConnectionsModel } from './sso-connections.model';
import type { SSOConnection } from './sso-connections.types';

export type SSOConnectionRow = SSOConnection & {
  isPending: boolean;
  error: string | undefined;
};

export interface SSOSectionController {
  rows: SSOConnectionRow[];
  organizationName: string;
  isDisabled: boolean;
  isError: boolean;
  onRetry: () => void;
  enrollmentRoleName: string | undefined;
  onManage: (id: string) => void;
  onSetActive: (id: string, active: boolean) => void;
  remove: ConfirmController<SSOConnectionRow>;
  registerTrigger: (id: string) => Ref<HTMLButtonElement>;
  removalFinalFocus: DialogFocusTarget;
  sectionRef: Ref<HTMLElement>;
  managed: SSOConnection | undefined;
  onManagedOpenChange: (open: boolean) => void;
  managedFinalFocus: DialogFocusTarget;
}

export function useSSOSectionController(model: SSOConnectionsModel): SSOSectionController {
  const m = useMessages('organizationProfile').security;
  const roleNames = useMessages('roles');
  const [managedId, setManagedId] = useState<string>();
  const sectionRef = useRef<HTMLElement>(null);
  const actions = usePendingAction({ errorFallback: m.errorFallback });
  const removalFocus = useListRemovalFocus({
    ids: model.connections.map(connection => connection.id),
    onRemove: model.remove,
    fallback: () => sectionRef.current,
  });
  const remove = useConfirmController<SSOConnectionRow>({
    onConfirm: connection => removalFocus.remove(connection.id),
    errorFallback: m.errorFallback,
  });
  const role = model.enrollmentRole;

  return {
    rows: model.connections.map(connection => ({
      ...connection,
      isPending: actions.pendingKey === connection.id,
      error: actions.errorKey === connection.id ? actions.error : undefined,
    })),
    organizationName: model.organizationName,
    isDisabled: actions.isPending || remove.isPending,
    isError: model.isError,
    onRetry: model.retry,
    enrollmentRoleName: role ? (roleNames[role.key] ?? role.name ?? humanizeRoleKey(role.key)) : undefined,
    onManage: setManagedId,
    onSetActive: (id, active) => void actions.run(id, () => model.setActive(id, active)),
    remove,
    registerTrigger: removalFocus.registerTrigger,
    removalFinalFocus: () => removalFocus.finalFocus(),
    sectionRef,
    managed: model.connections.find(connection => connection.id === managedId),
    onManagedOpenChange: open => {
      if (!open) {
        setManagedId(undefined);
      }
    },
    managedFinalFocus: () => (managedId ? removalFocus.trigger(managedId) : null),
  };
}

function humanizeRoleKey(roleKey: string): string {
  const lastSegment = roleKey.split(':').pop() ?? roleKey;
  return lastSegment.replace(/[_-]+/g, ' ').trim() || roleKey;
}
