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
import { useAccessManageConnectionController } from './access-manage-connection.controller';

interface SetupRequest {
  kind: ConnectionKind;
  attach: boolean;
}
interface AccessContext {
  request: SetupRequest | null;
  managedConnection: AccessConnection | null;
  direction: 1 | -1;
}
type AccessEvent =
  | { type: 'EDIT' }
  | { type: 'BACK' }
  | { type: 'SETUP'; request: SetupRequest }
  | { type: 'MANAGE'; connection: AccessConnection }
  | { type: 'CLOSE_SETUP' };
const { createMachine, assign } = setup<AccessContext, AccessEvent>();
const requestSetup = assign((_: AccessContext, event: Extract<AccessEvent, { type: 'SETUP' }>) => ({
  request: event.request,
}));
const manageConnection = assign((_: AccessContext, event: Extract<AccessEvent, { type: 'MANAGE' }>) => ({
  managedConnection: event.connection,
  direction: 1,
}));
const closeSetup = assign(() => ({ request: null, managedConnection: null, direction: -1 }));
export const accessMachine = createMachine({
  initial: 'list',
  context: { request: null, managedConnection: null, direction: 1 },
  states: {
    list: {
      on: {
        EDIT: { target: 'editor', actions: assign(() => ({ direction: 1 })) },
        SETUP: { actions: requestSetup },
        MANAGE: { actions: manageConnection },
        CLOSE_SETUP: { actions: closeSetup },
      },
    },
    editor: {
      on: {
        BACK: { target: 'list', actions: assign(() => ({ direction: -1, request: null })) },
        SETUP: { actions: requestSetup },
        MANAGE: { actions: manageConnection },
        CLOSE_SETUP: { actions: closeSetup },
      },
    },
  },
});

export function useAccessController(data: AccessData) {
  const m = useMessages('organizationProfile').access;
  const [state, send] = useMachine(accessMachine);
  const [tab, setTab] = useState('policies');
  const canActivate = (values: AccessPolicy) =>
    data.live
      ? values.domains.length > 0 &&
        (values.authentication !== 'sso' ||
          (values.domains.every(domain => domain.verified) &&
            values.ssoConnectionIds.length > 0 &&
            values.ssoConnectionIds.every(id =>
              data.connections.some(connection => connection.id === id && connection.status === 'active'),
            ) &&
            (values.enrollment !== 'directory' || Boolean(values.directoryConnectionId))))
      : canActivatePolicy(values, data.connections);
  const form = useForm<AccessPolicy>({
    initialValues: newPolicy(),
    canSubmit: values =>
      (!data.live || values.domains.length > 0) && (values.status !== 'active' || canActivate(values)),
    onSubmit: data.onSavePolicy,
    onSuccess: () => {
      data.onSelectPolicy?.(null);
      send({ type: 'BACK' });
    },
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
  const [dnsRecord, setDnsRecord] = useState<{ name: string; value: string } | null>(null);
  const policyLoad = usePendingAction({ errorFallback: m.loadPolicyError });
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
  const markVerified = (name: string) => {
    form.setValue(
      'domains',
      form.values.domains.map(domain => (domain.name === name ? { ...domain, verified: true } : domain)),
    );
    setVerifyingDomain(null);
  };
  const request = state.context.request;
  const onBack = () => {
    if (!form.isSubmitting) {
      data.onSelectPolicy?.(null);
      send({ type: 'BACK' });
    }
  };
  const openEditor = (policy: AccessPolicy) => {
    form.reset(policy);
    send({ type: 'EDIT' });
  };
  const onEdit = (policy?: AccessPolicy) => {
    const load = data.loadPolicy;
    if (policy && load) {
      void policyLoad.run(policy.id, async () => {
        const loaded = await load(policy.id);
        data.onSelectPolicy?.(loaded.id);
        openEditor(loaded);
      });
      return;
    }
    policyLoad.reset();
    data.onSelectPolicy?.(null);
    openEditor(policy ?? newPolicy());
  };
  const onSetup = (kind: ConnectionKind) => {
    if ((kind === 'sso' ? data.canCreateSso : data.canCreateDirectory) === false) {
      return;
    }
    wizard.open(kind);
    send({ type: 'SETUP', request: { kind, attach: state.value === 'editor' } });
  };
  const onManage = (id: string) => {
    const connection = data.connections.find(item => item.id === id);
    if (connection && connection.canManage !== false) {
      data.onManageDirectory?.(connection.kind === 'directory' ? connection.configuration.ssoConnectionId : null);
      manager.open(connection);
      send({ type: 'MANAGE', connection });
    }
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
  const managedConnection = state.context.managedConnection;
  const manager = useAccessManageConnectionController(data, managedConnection, () => send({ type: 'CLOSE_SETUP' }));
  const manageKind = managedConnection?.kind;
  const pageStep = manageKind ? 'manage' : request?.kind === 'directory' ? 'directory' : state.value;
  const pageTitle = manageKind
    ? manageKind === 'sso'
      ? m.manageSso
      : m.manageDirectory
    : pageStep === 'directory'
      ? m.directoryTitle
      : pageStep === 'editor'
        ? form.values.id
          ? m.managePolicy
          : m.addPolicy
        : m.title;
  return {
    wizard,
    manager,
    manageKind,
    manageServiceProvider: getManageServiceProvider(data, managedConnection),
    pageStep,
    pageTitle,
    data,
    form,
    tab,
    onTabChange: setTab,
    step: state.value,
    direction: state.context.direction,
    request,
    onBack,
    onEdit,
    policyLoad,
    onSetup,
    onManage,
    availableSsoConnections: data.connections.filter(
      connection => connection.kind === 'sso' && !form.values.ssoConnectionIds.includes(connection.id),
    ),
    onAttachSso: (id: string) => form.setValue('ssoConnectionIds', [...new Set([...form.values.ssoConnectionIds, id])]),
    canActivate: form.values.status === 'inactive' || canActivate(form.values),
    canVerifyDomain: Boolean(data.onVerifyDomain),
    dnsRecord,
    canCheckDomain: !data.onPrepareDomain || dnsRecord !== null,
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
      setDnsRecord(null);
      if (data.onPrepareDomain) {
        const prepare = data.onPrepareDomain;
        void verification.run(name, async () => {
          const record = await prepare(name);
          if (record) {
            setDnsRecord(record);
          } else {
            markVerified(name);
          }
        });
      }
    },
    onVerifyOpenChange: (open: boolean) => {
      if (!open && !verification.isPending) {
        setVerifyingDomain(null);
      }
    },
    onCheckDomain: () => {
      const name = verifyingDomain;
      const verify = data.onVerifyDomain;
      if (!name || !verify) {
        return;
      }
      void verification.run(name, async () => {
        const verified = await verify(name);
        setVerificationMissing(!verified);
        if (verified) {
          markVerified(name);
        }
      });
    },
  };
}
export type AccessController = ReturnType<typeof useAccessController>;

function getManageServiceProvider(
  data: AccessData,
  connection: AccessConnection | null,
): AccessData['serviceProvider'] {
  if (!connection || !data.live) {
    return data.serviceProvider;
  }
  return {
    signOnUrl: connection.signOnUrl ?? '',
    audience: connection.audience ?? '',
    redirectUri: connection.redirectUri ?? '',
    scimUrl: connection.endpointUrl ?? '',
    token: '',
    dnsValue: '',
    testUrl: '',
  };
}
