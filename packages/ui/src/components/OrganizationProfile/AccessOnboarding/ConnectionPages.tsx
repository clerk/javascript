import { useState } from 'react';

import { ClipboardInput } from '@/ui/elements/ClipboardInput';
import { ProfileCard } from '@/ui/elements/ProfileCard';

import {
  Badge,
  Box,
  Button,
  Col,
  descriptors,
  Flex,
  Icon,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from '../../../customizables';
import { ChevronDown, Link, RotateLeftRight, ShieldCheck } from '../../../icons';
import { useAccessNavigation } from './navigation';
import {
  borderSx,
  ContinueButton,
  InfoTooltip,
  Labelled,
  PageFooter,
  smallSx,
  StepCounter,
  SubPageHeader,
  TextInput,
  WarningLine,
  xsSx,
} from './parts';
import type { ProtoConnection, ProtoConnectionKind, ProtoProvider, ProtoTestLog } from './prototypeState';
import { generateToken, protoKey, PROVIDER_LABELS, simulateRequest, useAccessPrototype } from './prototypeState';
import { ProviderIcon, ProviderMark } from './ProviderMark';

/*
 * The SSO and Directory Sync setup wizards (three steps, "Step 1 of 3"
 * footer) and the Manage pages the Connections tab opens, built to the
 * Oct 2026 "MVP" Figma. Fixture-backed: nothing reaches an identity
 * provider; "Open test URL" and token generation are simulated.
 */

const SCIM_ENDPOINT = 'https://clerkstage.dev/api/scim/v2';
const acsUrlFor = (connection: ProtoConnection) =>
  `https://summary-man-99.clerk.accountsstage.dev/v1/saml/${connection.id}`;
const entityIdFor = (connection: ProtoConnection) =>
  `https://summary-man-99.clerk.accountsstage.dev/saml/${connection.id}`;

const ATTRIBUTES: [string, string][] = [
  ['Email address', 'emails[0].value'],
  ['First name', 'name.givenName'],
  ['Last name', 'name.familyName'],
  ['Username', 'userName'],
  ['Role', 'roles[0].value'],
];

/* --------------------------------------------------------------- wizards */

export const SetupWizard = ({ kind, policyId }: { kind: ProtoConnectionKind; policyId: string }) => {
  const store = useAccessPrototype();
  const nav = useAccessNavigation();
  const [step, setStep] = useState(1);
  const [provider, setProvider] = useState<ProtoProvider | null>(kind === 'directory' ? 'saml_okta' : null);
  const [name, setName] = useState('');
  const [connectionId, setConnectionId] = useState<string | null>(null);
  const [isWorking, setIsWorking] = useState(false);
  const connection = store.connections.find(entry => entry.id === connectionId) ?? null;
  const backToPolicy = () => nav.toPolicy(policyId);

  const defaultName = provider
    ? kind === 'sso'
      ? `Custom ${PROVIDER_LABELS[provider].label}`
      : `${PROVIDER_LABELS[provider].label.split(' ')[0]} Directory`
    : '';

  const createConnection = () => {
    if (!provider) {
      return;
    }
    setIsWorking(true);
    void simulateRequest().then(() => {
      const created = store.addConnection({
        kind,
        provider,
        name: name.trim() || defaultName,
        status: kind === 'directory' ? 'active' : 'pending',
        token: kind === 'directory' ? generateToken() : undefined,
      });
      setConnectionId(created.id);
      setIsWorking(false);
      setStep(2);
    });
  };

  // The new connection goes straight onto the policy form waiting for it.
  const finish = () => {
    if (connection) {
      store.setDraft(previous =>
        previous.policyId !== policyId
          ? previous
          : kind === 'sso'
            ? { ...previous, signIn: 'sso', connectionIds: [...previous.connectionIds, connection.id] }
            : { ...previous, enrollment: 'directory_sync', directoryId: connection.id },
      );
    }
    backToPolicy();
  };

  const savedTitle = kind === 'sso' ? 'SSO connection saved' : 'Directory Sync saved';

  return (
    <ProfileCard.Page sx={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      <Col
        elementDescriptor={descriptors.page}
        sx={t => ({ flex: 1, gap: t.space.$5 })}
      >
        {step === 3 ? (
          <>
            <SubPageHeader
              backLabel='Policy'
              title=''
              onBack={backToPolicy}
            />
            <Col
              align='center'
              sx={t => ({ flex: 1, justifyContent: 'center', gap: t.space.$2, textAlign: 'center' })}
            >
              <Icon
                icon={ShieldCheck}
                sx={t => ({ width: t.sizes.$7, height: t.sizes.$7, color: t.colors.$colorMutedForeground })}
              />
              <Text variant='h3'>{savedTitle}</Text>
              <Text
                colorScheme='secondary'
                sx={t => ({ ...smallSx(t), maxWidth: '18rem' })}
              >
                This connection is configured and can be managed under{' '}
                <Text
                  as='span'
                  sx={smallSx}
                >
                  Access &gt; Connections
                </Text>
                .
              </Text>
            </Col>
          </>
        ) : kind === 'sso' && step === 1 ? (
          <>
            <SubPageHeader
              backLabel='Policy'
              title='Configure your identity provider'
              onBack={backToPolicy}
            />
            <Labelled label='Name'>
              <TextInput
                ariaLabel='Name'
                value={name}
                placeholder={defaultName || 'My connection'}
                onChange={setName}
              />
            </Labelled>
            <ProviderGrid
              value={provider}
              onChange={setProvider}
            />
          </>
        ) : kind === 'sso' && connection ? (
          <>
            <SubPageHeader
              backLabel='Policy'
              title='Test your SSO connection'
              onBack={backToPolicy}
            />
            <TestPanel connection={connection} />
          </>
        ) : kind === 'directory' && step === 1 ? (
          <>
            <SubPageHeader
              backLabel='Policy'
              title='Configure'
              description='Add these credentials to your identity provider to configure Directory Sync'
              onBack={backToPolicy}
            />
            <DirectoryFields
              provider={provider ?? 'saml_okta'}
              onProviderChange={setProvider}
              name={name}
              namePlaceholder={defaultName}
              onNameChange={setName}
              token={null}
            />
          </>
        ) : (
          <>
            <SubPageHeader
              backLabel='Policy'
              title='Map attributes'
              description='Choose which SCIM attributes fill each Clerk user field'
              onBack={backToPolicy}
            />
            <AttributesTable />
          </>
        )}
      </Col>

      <PageFooter
        start={
          <StepCounter
            step={step}
            total={3}
          />
        }
      >
        <ContinueButton
          isDisabled={step === 1 && !provider}
          isLoading={isWorking}
          onClick={step === 1 ? createConnection : step === 2 ? () => setStep(3) : finish}
        />
      </PageFooter>
    </ProfileCard.Page>
  );
};

/** Providers as large cards, grouped SAML / OIDC like the dashboard's picker. */
const ProviderGrid = ({
  value,
  onChange,
  only,
}: {
  value: ProtoProvider | null;
  onChange: (provider: ProtoProvider) => void;
  only?: 'saml';
}) => {
  const groups: { title: string; providers: ProtoProvider[] }[] = [
    { title: 'SAML', providers: ['saml_okta', 'saml_microsoft', 'saml_google', 'saml_custom'] },
    ...(only ? [] : [{ title: 'OpenID Connect (OIDC)', providers: ['oidc'] as ProtoProvider[] }]),
  ];
  return (
    <Col sx={t => ({ gap: t.space.$5 })}>
      {groups.map(group => (
        <Col
          key={group.title}
          sx={t => ({ gap: t.space.$2 })}
        >
          <Text variant='subtitle'>{group.title}</Text>
          <Box sx={t => ({ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: t.space.$3 })}>
            {group.providers.map(provider => {
              const isSelected = value === provider;
              return (
                <Button
                  key={provider}
                  variant='unstyled'
                  aria-pressed={isSelected}
                  onClick={() => onChange(provider)}
                  sx={t => ({
                    ...borderSx(t),
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    height: 'auto',
                    gap: t.space.$2,
                    padding: `${t.space.$5} ${t.space.$3}`,
                    cursor: 'pointer',
                    backgroundColor: isSelected ? t.colors.$neutralAlpha50 : t.colors.$colorBackground,
                    borderColor: isSelected ? t.colors.$borderAlpha300 : t.colors.$borderAlpha100,
                    '&:hover': { backgroundColor: t.colors.$neutralAlpha50 },
                  })}
                >
                  <ProviderIcon
                    provider={provider}
                    size={20}
                  />
                  <Text sx={smallSx}>{PROVIDER_LABELS[provider].label}</Text>
                </Button>
              );
            })}
          </Box>
        </Col>
      ))}
    </Col>
  );
};

/** "Okta Workforce [Change]" with the setup instructions folded under it. */
const ProviderCard = ({
  provider,
  actionLabel,
  onChange,
  instructions,
}: {
  provider: ProtoProvider;
  actionLabel: string;
  onChange: (provider: ProtoProvider) => void;
  instructions?: string;
}) => {
  const [isPicking, setIsPicking] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  return (
    <Col sx={t => ({ ...borderSx(t), overflow: 'hidden' })}>
      <Flex
        justify='between'
        align='center'
        sx={t => ({ padding: `${t.space.$3} ${t.space.$4}` })}
      >
        <ProviderMark
          provider={provider}
          name={PROVIDER_LABELS[provider].label}
        />
        <Button
          variant='outline'
          size='xs'
          textVariant='buttonSmall'
          block={false}
          onClick={() => setIsPicking(value => !value)}
          localizationKey={protoKey(isPicking ? 'Cancel' : actionLabel)}
        />
      </Flex>
      {isPicking ? (
        <Box sx={t => ({ padding: t.space.$4, paddingTop: 0 })}>
          <ProviderGrid
            value={provider}
            only='saml'
            onChange={next => {
              onChange(next);
              setIsPicking(false);
            }}
          />
        </Box>
      ) : null}
      {instructions ? (
        <Col sx={t => ({ backgroundColor: t.colors.$neutralAlpha50, padding: `${t.space.$2} ${t.space.$4}` })}>
          <Button
            variant='unstyled'
            onClick={() => setShowInstructions(value => !value)}
            sx={t => ({ ...xsSx(t), display: 'inline-flex', alignItems: 'center', gap: t.space.$1, padding: 0 })}
          >
            View instructions
            <Icon
              icon={ChevronDown}
              sx={t => ({
                width: t.sizes.$3,
                height: t.sizes.$3,
                transform: showInstructions ? 'rotate(180deg)' : undefined,
              })}
            />
          </Button>
          {showInstructions ? (
            <Text
              colorScheme='secondary'
              sx={t => ({ ...smallSx(t), paddingBlock: t.space.$2 })}
            >
              {instructions}
            </Text>
          ) : null}
        </Col>
      ) : null}
    </Col>
  );
};

const DirectoryFields = ({
  provider,
  onProviderChange,
  name,
  namePlaceholder,
  onNameChange,
  token,
  onGenerate,
  isGenerating,
  actionLabel = 'Change',
}: {
  provider: ProtoProvider;
  onProviderChange: (provider: ProtoProvider) => void;
  name: string;
  namePlaceholder: string;
  onNameChange: (name: string) => void;
  /** null = not created yet: the token shows once Continue creates the directory. */
  token: string | null;
  onGenerate?: () => void;
  isGenerating?: boolean;
  actionLabel?: string;
}) => (
  <Col sx={t => ({ gap: t.space.$5 })}>
    <ProviderCard
      provider={provider}
      actionLabel={actionLabel}
      onChange={onProviderChange}
      instructions={`In ${PROVIDER_LABELS[provider].label}, open your application’s Provisioning settings, enable SCIM, and paste the endpoint URL and bearer token below. Assign the groups you want synced.`}
    />
    <Labelled label='Name'>
      <TextInput
        ariaLabel='Name'
        value={name}
        placeholder={namePlaceholder}
        onChange={onNameChange}
      />
    </Labelled>
    <Labelled label='SCIM endpoint URL'>
      <ClipboardInput
        value={SCIM_ENDPOINT}
        readOnly
      />
    </Labelled>
    <Labelled label='Bearer token'>
      <Flex
        gap={2}
        align='center'
      >
        <Box sx={{ flex: 1 }}>
          <ClipboardInput
            value={token ?? 'Generated when you continue'}
            readOnly
          />
        </Box>
        {onGenerate ? (
          <Button
            variant='outline'
            textVariant='buttonSmall'
            block={false}
            isLoading={isGenerating}
            onClick={onGenerate}
            localizationKey={protoKey('Generate new token')}
          />
        ) : null}
      </Flex>
      <WarningLine>This token is only shown once. Generate a new token if you lose it.</WarningLine>
    </Labelled>
  </Col>
);

const AttributesTable = () => (
  <Box sx={t => ({ ...borderSx(t), overflow: 'hidden' })}>
    <Table>
      <Thead>
        <Tr>
          <Th localizationKey={protoKey('Clerk attribute')} />
          <Th localizationKey={protoKey('SCIM attribute')} />
        </Tr>
      </Thead>
      <Tbody>
        {ATTRIBUTES.map(([clerk, scim]) => (
          <Tr key={clerk}>
            <Td>
              <Text sx={smallSx}>{clerk}</Text>
            </Td>
            <Td>
              <Text sx={t => ({ ...smallSx(t), fontFamily: t.fonts.$main, fontVariantNumeric: 'tabular-nums' })}>
                <code>{scim}</code>
              </Text>
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  </Box>
);

/* ----------------------------------------------------------- SSO testing */

const LOG_STATUS: Record<ProtoTestLog['status'], { label: string; colorScheme: 'warning' | 'success' | 'danger' }> = {
  pending: { label: 'Pending', colorScheme: 'warning' },
  success: { label: 'Success', colorScheme: 'success' },
  failed: { label: 'Failed', colorScheme: 'danger' },
};

const formatLogTime = (iso: string) => {
  const date = new Date(iso);
  const time = date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit', second: '2-digit' });
  const day = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  return `${time} ${day}`;
};

/* The prototype's handshake: a pending row that resolves to success and activates the connection. */
const useTestConnection = (connection: ProtoConnection) => {
  const { updateConnection } = useAccessPrototype();
  const [isTesting, setIsTesting] = useState(false);
  const test = () => {
    setIsTesting(true);
    const id = `log_${Date.now()}`;
    updateConnection(connection.id, current => ({
      logs: [{ id, at: new Date().toISOString(), detail: '—', status: 'pending' }, ...current.logs],
    }));
    void simulateRequest(1400).then(() => {
      updateConnection(connection.id, current => ({
        status: 'active',
        logs: current.logs.map(log =>
          log.id === id ? { ...log, detail: 'Signed in as it-admin@acmedev.org', status: 'success' } : log,
        ),
      }));
      setIsTesting(false);
    });
  };
  return { test, isTesting };
};

const TestPanel = ({ connection }: { connection: ProtoConnection }) => {
  const { test, isTesting } = useTestConnection(connection);
  const [isRefreshing, setIsRefreshing] = useState(false);
  return (
    <Col sx={t => ({ gap: t.space.$6 })}>
      <Col sx={t => ({ gap: t.space.$3, alignItems: 'flex-start' })}>
        <Text
          colorScheme='secondary'
          sx={smallSx}
        >
          Sign in through the test URL to verify your SSO connection is configured correctly.
        </Text>
        <IconButtonText
          icon={Link}
          label='Open test URL'
          isLoading={isTesting}
          onClick={test}
        />
      </Col>
      <Col sx={t => ({ gap: t.space.$3 })}>
        <Flex
          justify='between'
          align='center'
        >
          <Text variant='subtitle'>Your test results</Text>
          <IconButtonText
            icon={RotateLeftRight}
            label='Refresh logs'
            isLoading={isRefreshing}
            onClick={() => {
              setIsRefreshing(true);
              void simulateRequest(500).then(() => setIsRefreshing(false));
            }}
          />
        </Flex>
        {connection.logs.length === 0 ? (
          <Flex
            justify='center'
            sx={t => ({ ...borderSx(t), padding: t.space.$10 })}
          >
            <Text sx={smallSx}>No test results</Text>
          </Flex>
        ) : (
          <LogsTable logs={connection.logs} />
        )}
      </Col>
    </Col>
  );
};

const LogsTable = ({ logs }: { logs: ProtoTestLog[] }) => (
  <Table>
    <Thead>
      <Tr>
        <Th localizationKey={protoKey('Timestamp')} />
        <Th localizationKey={protoKey('Run details')} />
        <Th localizationKey={protoKey('Status')} />
      </Tr>
    </Thead>
    <Tbody>
      {logs.map(log => (
        <Tr key={log.id}>
          <Td>
            <Text sx={smallSx}>{formatLogTime(log.at)}</Text>
          </Td>
          <Td>
            <Text
              colorScheme='secondary'
              sx={smallSx}
            >
              {log.detail}
            </Text>
          </Td>
          <Td>
            <Badge colorScheme={LOG_STATUS[log.status].colorScheme}>{LOG_STATUS[log.status].label}</Badge>
          </Td>
        </Tr>
      ))}
    </Tbody>
  </Table>
);

const IconButtonText = ({
  icon,
  label,
  isLoading,
  onClick,
}: {
  icon: React.ComponentType;
  label: string;
  isLoading?: boolean;
  onClick: () => void;
}) => (
  <Button
    variant='outline'
    textVariant='buttonSmall'
    block={false}
    isLoading={isLoading}
    onClick={onClick}
  >
    <Icon
      icon={icon}
      sx={t => ({ width: t.sizes.$3x5, height: t.sizes.$3x5, marginInlineEnd: t.space.$1x5 })}
    />
    {label}
  </Button>
);

/* ---------------------------------------------------------- manage pages */

export const ManageConnectionPage = ({ connectionId, fromPolicy }: { connectionId: string; fromPolicy?: string }) => {
  const store = useAccessPrototype();
  const nav = useAccessNavigation();
  const connection = store.connections.find(entry => entry.id === connectionId);
  const [name, setName] = useState(connection?.name ?? '');
  const [provider, setProvider] = useState<ProtoProvider>(connection?.provider ?? 'saml_okta');
  const [token, setToken] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [logsOpen, setLogsOpen] = useState(true);
  const back = () => (fromPolicy ? nav.toPolicy(fromPolicy) : nav.toConnections());

  if (!connection) {
    return null;
  }
  const isDirty = name.trim() !== connection.name || provider !== connection.provider;
  const save = () => {
    setIsSaving(true);
    void simulateRequest().then(() => {
      store.updateConnection(connection.id, { name: name.trim() || connection.name, provider });
      setIsSaving(false);
      back();
    });
  };

  return (
    <ProfileCard.Page sx={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      <Col
        elementDescriptor={descriptors.page}
        sx={t => ({ flex: 1, gap: t.space.$5 })}
      >
        <SubPageHeader
          backLabel={fromPolicy ? 'Policy' : 'Connections'}
          title={connection.kind === 'sso' ? 'Manage SSO connection' : 'Manage Directory Sync'}
          onBack={back}
        />
        {connection.kind === 'sso' ? (
          <>
            <ProviderCard
              provider={provider}
              actionLabel='Edit'
              onChange={setProvider}
            />
            <Labelled label='Name'>
              <TextInput
                ariaLabel='Name'
                value={name}
                onChange={setName}
              />
            </Labelled>
            <Text variant='subtitle'>Connect</Text>
            <Labelled label='Assertion consumer service (ACS)'>
              <ClipboardInput
                value={acsUrlFor(connection)}
                readOnly
              />
            </Labelled>
            <Labelled label='Entity ID'>
              <ClipboardInput
                value={entityIdFor(connection)}
                readOnly
              />
            </Labelled>
            <ManageTest
              connection={connection}
              logsOpen={logsOpen}
              onToggleLogs={() => setLogsOpen(value => !value)}
            />
          </>
        ) : (
          <>
            <DirectoryFields
              provider={provider}
              onProviderChange={setProvider}
              name={name}
              namePlaceholder={connection.name}
              onNameChange={setName}
              token={token}
              actionLabel='Edit'
              isGenerating={isGenerating}
              onGenerate={() => {
                setIsGenerating(true);
                void simulateRequest().then(() => {
                  const next = generateToken();
                  store.updateConnection(connection.id, { token: next });
                  setToken(next);
                  setIsGenerating(false);
                });
              }}
            />
            <Col
              sx={t => ({
                gap: t.space.$3,
                paddingTop: t.space.$5,
                borderTopWidth: t.borderWidths.$normal,
                borderTopStyle: t.borderStyles.$solid,
                borderTopColor: t.colors.$borderAlpha100,
              })}
            >
              <Flex
                align='center'
                gap={1}
              >
                <Text variant='subtitle'>Map attributes</Text>
                <InfoTooltip text='Which SCIM attribute fills each Clerk user field.' />
              </Flex>
              <AttributesTable />
            </Col>
          </>
        )}
      </Col>
      {store.access.canManage ? (
        <PageFooter>
          <Button
            textVariant='buttonSmall'
            block={false}
            isDisabled={!isDirty}
            isLoading={isSaving}
            onClick={save}
            localizationKey={protoKey('Save')}
          />
        </PageFooter>
      ) : null}
    </ProfileCard.Page>
  );
};

const ManageTest = ({
  connection,
  logsOpen,
  onToggleLogs,
}: {
  connection: ProtoConnection;
  logsOpen: boolean;
  onToggleLogs: () => void;
}) => {
  const { test, isTesting } = useTestConnection(connection);
  const [isRefreshing, setIsRefreshing] = useState(false);
  return (
    <Col sx={t => ({ gap: t.space.$3 })}>
      <Flex
        justify='between'
        align='center'
        gap={3}
      >
        <Col sx={t => ({ gap: t.space.$0x5 })}>
          <Text variant='subtitle'>Test connection</Text>
          <Text
            colorScheme='secondary'
            sx={smallSx}
          >
            Sign in with your provider to confirm SSO is configured.
          </Text>
        </Col>
        <Button
          variant='outline'
          textVariant='buttonSmall'
          block={false}
          isLoading={isTesting}
          onClick={test}
          localizationKey={protoKey('Test connection')}
        />
      </Flex>
      <Col sx={t => ({ ...borderSx(t), overflow: 'hidden' })}>
        <Flex
          justify='between'
          align='center'
          sx={t => ({ padding: `${t.space.$2} ${t.space.$4}` })}
        >
          <Flex
            align='center'
            gap={2}
          >
            <Text variant='subtitle'>Logs</Text>
            <Badge colorScheme='primary'>{String(connection.logs.length)}</Badge>
          </Flex>
          <Flex
            align='center'
            gap={2}
          >
            <Button
              variant='outline'
              aria-label='Refresh logs'
              isLoading={isRefreshing}
              onClick={() => {
                setIsRefreshing(true);
                void simulateRequest(500).then(() => setIsRefreshing(false));
              }}
              sx={t => ({ padding: t.space.$1x5 })}
            >
              <Icon
                icon={RotateLeftRight}
                sx={t => ({ width: t.sizes.$3x5, height: t.sizes.$3x5 })}
              />
            </Button>
            <Button
              variant='ghost'
              aria-label={logsOpen ? 'Hide logs' : 'Show logs'}
              onClick={onToggleLogs}
              sx={t => ({ padding: t.space.$1x5 })}
            >
              <Icon
                icon={ChevronDown}
                sx={t => ({
                  width: t.sizes.$3x5,
                  height: t.sizes.$3x5,
                  transform: logsOpen ? 'rotate(180deg)' : undefined,
                })}
              />
            </Button>
          </Flex>
        </Flex>
        {logsOpen ? (
          connection.logs.length === 0 ? (
            <Text
              colorScheme='secondary'
              sx={t => ({ ...smallSx(t), padding: t.space.$4 })}
            >
              No sign-ins through this connection yet.
            </Text>
          ) : (
            <LogsTable logs={connection.logs} />
          )
        ) : null}
      </Col>
    </Col>
  );
};
