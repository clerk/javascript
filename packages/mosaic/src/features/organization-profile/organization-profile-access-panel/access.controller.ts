import { useRef, useState } from 'react';

import { useForm } from '../../../components/form';
import { useListRemovalFocus } from '../../../hooks/use-list-removal-focus';
import { usePendingAction } from '../../../hooks/use-pending-action';
import { useMessages } from '../../../localization';
import { setup } from '../../../machine/setup';
import { useMachine } from '../../../machine/use-machine';
import type { AccessConnection, AccessData, AccessPolicy, ConnectionKind } from './access.types';
import { attachConnection, canActivatePolicy, isDomain, newPolicy } from './access.utils';
import { useAccessConnectionController } from './access-connection.controller';

interface SetupRequest {
  kind: ConnectionKind;
  connection?: AccessConnection;
  attach: boolean;
}
interface AccessContext {
  request: SetupRequest | null;
  direction: 1 | -1;
}
type AccessEvent =
  | { type: 'EDIT' }
  | { type: 'BACK' }
  | { type: 'SETUP'; request: SetupRequest }
  | { type: 'CLOSE_SETUP' };
const { createMachine, assign } = setup<AccessContext, AccessEvent>();
const requestSetup = assign((_: AccessContext, event: Extract<AccessEvent, { type: 'SETUP' }>) => ({
  request: event.request,
}));
const closeSetup = assign(() => ({ request: null, direction: -1 }));
export const accessMachine = createMachine({
  initial: 'list',
  context: { request: null, direction: 1 },
  states: {
    list: {
      on: {
        EDIT: { target: 'editor', actions: assign(() => ({ direction: 1 })) },
        SETUP: { actions: requestSetup },
        CLOSE_SETUP: { actions: closeSetup },
      },
    },
    editor: {
      on: {
        BACK: { target: 'list', actions: assign(() => ({ direction: -1, request: null })) },
        SETUP: { actions: requestSetup },
        CLOSE_SETUP: { actions: closeSetup },
      },
    },
  },
});

export function useAccessController(data: AccessData) {
  const m = useMessages('organizationProfile').access;
  const [state, send] = useMachine(accessMachine);
  const [tab, setTab] = useState('policies');
  const form = useForm<AccessPolicy>({
    initialValues: newPolicy(),
    canSubmit: values => values.status !== 'active' || canActivatePolicy(values, data.connections),
    onSubmit: data.onSavePolicy,
    onSuccess: () => send({ type: 'BACK' }),
    errorFallback: m.saveError,
  });
  const domainForm = useForm({
    initialValues: { name: '' },
    fields: {
      name: {
        validate: value => {
          const name = value.trim().toLowerCase();
          if (!isDomain(name)) {
            return { type: 'error', message: m.invalidDomain };
          }
          if (
            form.values.domains.some(domain => domain.name === name) ||
            data.policies.some(
              policy => policy.id !== form.values.id && policy.domains.some(domain => domain.name === name),
            )
          ) {
            return { type: 'error', message: m.duplicateDomain };
          }
          return undefined;
        },
      },
    },
    onSubmit: ({ name }) => {
      form.setValue('domains', [...form.values.domains, { name: name.trim().toLowerCase(), verified: false }]);
      return Promise.resolve();
    },
    onSuccess: () => setAddingDomain(false),
  });
  const [addingDomain, setAddingDomain] = useState(false);
  const [verifyingDomain, setVerifyingDomain] = useState<string | null>(null);
  const [verificationMissing, setVerificationMissing] = useState(false);
  const verification = usePendingAction({ errorFallback: m.verifyError });
  const addDomainRef = useRef<HTMLButtonElement | null>(null);
  const domainRemoval = useListRemovalFocus({
    ids: form.values.domains.map(d => d.name),
    fallback: () => addDomainRef.current,
    onRemove: name =>
      form.setValue(
        'domains',
        form.values.domains.filter(d => d.name !== name),
      ),
  });
  const addSsoRef = useRef<HTMLButtonElement | null>(null);
  const ssoRemoval = useListRemovalFocus({
    ids: form.values.ssoConnectionIds,
    fallback: () => addSsoRef.current,
    onRemove: id =>
      form.setValue(
        'ssoConnectionIds',
        form.values.ssoConnectionIds.filter(value => value !== id),
      ),
  });
  const request = state.context.request;
  const onBack = () => {
    if (!form.isSubmitting) {
      send({ type: 'BACK' });
    }
  };
  const onEdit = (policy?: AccessPolicy) => {
    form.reset(policy ?? newPolicy());
    send({ type: 'EDIT' });
  };
  const onSetup = (kind: ConnectionKind, connection?: AccessConnection) => {
    wizard.open(kind, connection);
    send({ type: 'SETUP', request: { kind, connection, attach: state.value === 'editor' } });
  };
  const onComplete = (connection: AccessConnection) => {
    if (request?.attach && state.value === 'editor') {
      const next = attachConnection(form.values, connection);
      form.setValue('ssoConnectionIds', next.ssoConnectionIds);
      form.setValue('directoryConnectionId', next.directoryConnectionId);
    }
    send({ type: 'CLOSE_SETUP' });
  };
  const wizard = useAccessConnectionController(data, onComplete, () => send({ type: 'CLOSE_SETUP' }));
  return {
    wizard,
    data,
    form,
    tab,
    onTabChange: setTab,
    step: state.value,
    direction: state.context.direction,
    request,
    onBack,
    onEdit,
    onSetup,
    availableSsoConnections: data.connections.filter(
      connection => connection.kind === 'sso' && !form.values.ssoConnectionIds.includes(connection.id),
    ),
    onAttachSso: (id: string) => form.setValue('ssoConnectionIds', [...new Set([...form.values.ssoConnectionIds, id])]),
    onComplete,
    onCloseSetup: () => send({ type: 'CLOSE_SETUP' }),
    canActivate: form.values.status === 'inactive' || canActivatePolicy(form.values, data.connections),
    onSaveDraft: () => {
      form.setValue('status', 'draft');
      form.submit();
    },
    onActivate: () => {
      form.setValue('status', form.values.status === 'inactive' ? 'inactive' : 'active');
      form.submit();
    },
    addingDomain,
    domainForm,
    registerAddDomain: (element: HTMLButtonElement | null) => {
      addDomainRef.current = element;
    },
    registerAddSso: (element: HTMLButtonElement | null) => {
      addSsoRef.current = element;
    },
    onAuthenticationChange: (value: string) => {
      if (value === 'default' || value === 'sso') {
        form.setValue('authentication', value);
      }
    },
    onMfaChange: (value: string) => {
      if (value === 'optional' || value === 'required') {
        form.setValue('mfa', value);
      }
    },
    onEnrollmentChange: (value: string) => {
      if (value === 'invitation' || value === 'automatic' || value === 'request' || value === 'directory') {
        form.setValue('enrollment', value);
      }
    },
    onAddDomain: () => {
      domainForm.reset();
      setAddingDomain(true);
    },
    onDomainOpenChange: (open: boolean) => {
      if (!domainForm.isSubmitting) {
        setAddingDomain(open);
      }
    },
    domainRemoval,
    ssoRemoval,
    verifyingDomain,
    verification,
    verificationMissing,
    onVerifyDomain: (name: string) => {
      verification.reset();
      setVerificationMissing(false);
      setVerifyingDomain(name);
    },
    onVerifyOpenChange: (open: boolean) => {
      if (!open && !verification.isPending) {
        setVerifyingDomain(null);
      }
    },
    onCheckDomain: () => {
      const name = verifyingDomain;
      if (!name) {
        return;
      }
      void verification.run(name, async () => {
        const verified = await data.onVerifyDomain(name);
        setVerificationMissing(!verified);
        if (verified) {
          form.setValue(
            'domains',
            form.values.domains.map(domain => (domain.name === name ? { ...domain, verified: true } : domain)),
          );
          setVerifyingDomain(null);
        }
      });
    },
  };
}
export type AccessController = ReturnType<typeof useAccessController>;
