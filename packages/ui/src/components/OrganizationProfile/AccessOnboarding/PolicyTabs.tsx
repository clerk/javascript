import { useState } from 'react';

import { ClipboardInput } from '@/ui/elements/ClipboardInput';
import { FormButtonContainer } from '@/ui/elements/FormButtons';

import { Badge, Box, Button, Col, Flex, Icon, Table, Tbody, Td, Text, Th, Thead, Tr } from '../../../customizables';
import { ChevronDown, Link, RotateLeftRight } from '../../../icons';
import { DnsProof, ProofLine, smallSx, WarningLine } from './DomainProof';
import type { ProtoConnection, ProtoPolicy, ProtoProvider, ProtoTestLog } from './prototypeState';
import {
  policiesForConnection,
  protoKey,
  PROVIDER_LABELS,
  simulateRequest,
  useAccessPrototype,
} from './prototypeState';
import { ProviderMark } from './ProviderMark';

/*
 * The SSO and Directory Sync tabs of the Configure policy page, built to
 * the Sept 2026 Figma. Both are the "credentials + check" shape: values to
 * paste into the identity provider, then a way to confirm it worked. The
 * provider-picker and attributes/roles steppers are placeholders for now.
 */

const xsSx = (t: { fontSizes: { $xs: string } }) => ({ fontSize: t.fontSizes.$xs });

const Panel = ({ children }: { children: React.ReactNode }) => (
  <Col
    sx={t => ({
      gap: t.space.$4,
      padding: t.space.$4,
      borderWidth: t.borderWidths.$normal,
      borderStyle: t.borderStyles.$solid,
      borderColor: t.colors.$borderAlpha100,
      borderRadius: t.radii.$lg,
    })}
  >
    {children}
  </Col>
);

const Labelled = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <Col sx={t => ({ gap: t.space.$1x5 })}>
    <Text variant='subtitle'>{label}</Text>
    {children}
  </Col>
);

const formatLogTime = (iso: string) => {
  const date = new Date(iso);
  const time = date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit', second: '2-digit' });
  const day = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  return { time, day };
};

const LOG_STATUS: Record<ProtoTestLog['status'], { label: string; colorScheme: 'warning' | 'success' | 'danger' }> = {
  pending: { label: 'Pending', colorScheme: 'warning' },
  success: { label: 'Success', colorScheme: 'success' },
  failed: { label: 'Failed', colorScheme: 'danger' },
};

/* -------------------------------------------------------------------- SSO */

/*
 * Single sign-on as one straight line: prove you own the domain, choose a
 * provider, connect and test it, activate. Each step persists as it
 * completes, so leaving and coming back lands on the first step that is
 * still open, and nothing changes for end users until Activate.
 */
export const SsoTab = ({
  policy,
  connection,
  onDone,
  onContinueToDirectory,
}: {
  policy: ProtoPolicy;
  connection: ProtoConnection | null;
  onDone: () => void;
  onContinueToDirectory?: () => void;
}) => {
  const { access, updatePolicy, addConnection, updateConnection } = useAccessPrototype();
  const [isActivating, setIsActivating] = useState(false);
  const [isMocking, setIsMocking] = useState(false);
  const owned = policy.domains.every(domain => {
    const proof = policy.proofs[domain];
    return proof?.ownership === 'verified' || proof?.ownership === 'waived';
  });
  const isConnected = connection?.status === 'active';
  const isLive = policy.signIn === 'sso' && isConnected;

  const activate = () => {
    setIsActivating(true);
    void simulateRequest().then(() => {
      updatePolicy(policy.id, { signIn: 'sso', mfaRequired: false, connectionId: connection?.id });
      setIsActivating(false);
      (onContinueToDirectory ?? onDone)();
    });
  };

  // Prototype shortcut: completes the three steps (ownership, an Okta
  // connection, a passing test) so the routing after Activate can be walked
  // through without doing the setup.
  const mock = () => {
    setIsMocking(true);
    void simulateRequest(600).then(() => {
      const connectionId = connection?.id ?? addConnection('saml_okta', 'Okta').id;
      updateConnection(connectionId, current => ({
        status: 'active',
        logs: [
          { id: `log_${Date.now()}`, at: new Date().toISOString(), detail: 'Mocked sign-in', status: 'success' },
          ...current.logs,
        ],
      }));
      updatePolicy(policy.id, current => ({
        connectionId,
        proofs: Object.fromEntries(
          current.domains.map(domain => [
            domain,
            { ...(current.proofs[domain] ?? { affiliation: false }), ownership: 'verified' as const },
          ]),
        ),
      }));
      setIsMocking(false);
    });
  };

  return (
    <Col sx={t => ({ gap: t.space.$5, paddingTop: t.space.$4, width: '100%' })}>
      {!isLive ? (
        <Text
          colorScheme='secondary'
          sx={smallSx}
        >
          {`Sign in for this policy is ${policy.signIn === 'sso' ? 'single sign-on' : policy.mfaRequired ? 'Default with multi-factor' : 'Default'} today. It changes to single sign-on only when you activate it below; leaving before then changes nothing.`}
        </Text>
      ) : null}

      <Step
        number={1}
        title='Verify domain ownership'
        done={owned}
        summary={owned ? policy.domains.join(', ') : undefined}
      >
        <Col sx={t => ({ gap: t.space.$4 })}>
          {policy.domains.map(domain => {
            const proof = policy.proofs[domain];
            const isOwned = proof?.ownership === 'verified' || proof?.ownership === 'waived';
            return isOwned ? (
              <ProofLine
                key={domain}
                domain={domain}
              >
                <Badge colorScheme={proof?.ownership === 'waived' ? 'secondary' : 'success'}>
                  {proof?.ownership === 'waived' ? 'Pre-approved' : 'Verified'}
                </Badge>
              </ProofLine>
            ) : (
              <DnsProof
                key={domain}
                policy={policy}
                domain={domain}
              />
            );
          })}
        </Col>
      </Step>

      <Step
        number={2}
        title='Identity provider'
        done={Boolean(connection)}
        summary={connection ? `${connection.name} · ${PROVIDER_LABELS[connection.provider].label}` : undefined}
        summaryContent={
          connection ? (
            <ProviderMark
              provider={connection.provider}
              name={`${connection.name} · ${PROVIDER_LABELS[connection.provider].label}`}
              status={connection.status}
            />
          ) : undefined
        }
      >
        <ProviderPicker
          policy={policy}
          current={connection}
        />
      </Step>

      <Step
        number={3}
        title='Connect and test'
        done={isConnected}
        summary={isConnected ? 'Connection tested successfully' : undefined}
        locked={!connection ? 'Choose an identity provider first.' : undefined}
      >
        {connection ? (
          <ConnectAndTest
            policy={policy}
            connection={connection}
          />
        ) : null}
      </Step>

      <FormButtonContainer sx={{ justifyContent: 'space-between' }}>
        {!isLive && access.canManage ? (
          <Button
            variant='link'
            textVariant='buttonSmall'
            block={false}
            isLoading={isMocking}
            onClick={mock}
            localizationKey={protoKey('Mock the setup (prototype)')}
          />
        ) : (
          <span />
        )}
        {isLive ? (
          <Button
            textVariant='buttonSmall'
            block={false}
            onClick={onContinueToDirectory ?? onDone}
            localizationKey={protoKey(onContinueToDirectory ? 'Continue to directory sync' : 'Done')}
          />
        ) : (
          <Col sx={t => ({ gap: t.space.$1, alignItems: 'flex-end' })}>
            <Button
              textVariant='buttonSmall'
              block={false}
              isDisabled={!access.canManage || !owned || !isConnected}
              isLoading={isActivating}
              onClick={activate}
              localizationKey={protoKey('Save & activate')}
            />
            {!owned || !isConnected ? (
              <Text
                colorScheme='secondary'
                sx={xsSx}
              >
                {!owned ? 'Verify the domain to activate.' : 'Test the connection to activate.'}
              </Text>
            ) : null}
          </Col>
        )}
      </FormButtonContainer>
    </Col>
  );
};

/** One numbered step: open while pending, one line once done. */
const Step = ({
  number,
  title,
  done,
  summary,
  summaryContent,
  locked,
  children,
}: {
  number: number;
  title: string;
  done: boolean;
  summary?: string;
  summaryContent?: React.ReactNode;
  locked?: string;
  children: React.ReactNode;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const showBody = !done || isOpen;
  return (
    <Panel>
      <Flex
        justify='between'
        align='center'
        gap={3}
      >
        <Flex
          align='center'
          gap={2}
        >
          <Badge colorScheme={done ? 'success' : 'secondary'}>{done ? '✓' : String(number)}</Badge>
          <Text variant='subtitle'>{title}</Text>
        </Flex>
        {done ? (
          <Button
            variant='link'
            textVariant='buttonSmall'
            block={false}
            onClick={() => setIsOpen(value => !value)}
            localizationKey={protoKey(isOpen ? 'Hide' : 'Change')}
          />
        ) : null}
      </Flex>
      {done && !isOpen ? (
        (summaryContent ?? (
          <Text
            colorScheme='secondary'
            sx={smallSx}
          >
            {summary}
          </Text>
        ))
      ) : locked ? (
        <Text
          colorScheme='secondary'
          sx={smallSx}
        >
          {locked}
        </Text>
      ) : (
        showBody && children
      )}
    </Panel>
  );
};

/*
 * Existing connections first (with what they are used for), then a new
 * connection per provider. Choosing assigns the connection to the policy;
 * a new one starts pending until it is tested.
 */
const ProviderPicker = ({ policy, current }: { policy: ProtoPolicy; current: ProtoConnection | null }) => {
  const { connections, policies, addConnection, updatePolicy } = useAccessPrototype();
  const choose = (connectionId: string) => updatePolicy(policy.id, { connectionId });
  const create = (provider: ProtoProvider) => choose(addConnection(provider).id);

  const option = (key: string, content: React.ReactNode, onClick: () => void, isSelected: boolean) => (
    <Flex
      key={key}
      as='button'
      align='center'
      justify='between'
      gap={3}
      onClick={onClick}
      sx={t => ({
        width: '100%',
        textAlign: 'start',
        padding: t.space.$3,
        cursor: 'pointer',
        backgroundColor: isSelected ? t.colors.$neutralAlpha50 : 'transparent',
        borderWidth: t.borderWidths.$normal,
        borderStyle: t.borderStyles.$solid,
        borderColor: isSelected ? t.colors.$borderAlpha300 : t.colors.$borderAlpha100,
        borderRadius: t.radii.$md,
        '&:hover': { backgroundColor: t.colors.$neutralAlpha50 },
      })}
    >
      {content}
    </Flex>
  );

  return (
    <Col sx={t => ({ gap: t.space.$2 })}>
      {connections.length > 0 ? (
        <Text
          colorScheme='secondary'
          sx={xsSx}
        >
          Existing connections
        </Text>
      ) : null}
      {connections.map(connection => {
        const used = policiesForConnection(connection.id, policies)
          .filter(entry => entry.id !== policy.id)
          .flatMap(entry => entry.domains);
        return option(
          connection.id,
          <>
            <ProviderMark
              provider={connection.provider}
              name={connection.name}
              status={connection.status}
            />
            <Text
              colorScheme='secondary'
              sx={xsSx}
            >
              {used.length ? `Used with ${used.join(', ')}` : 'Not used yet'}
            </Text>
          </>,
          () => choose(connection.id),
          current?.id === connection.id,
        );
      })}
      <Text
        colorScheme='secondary'
        sx={xsSx}
      >
        New connection
      </Text>
      {(Object.keys(PROVIDER_LABELS) as ProtoProvider[]).map(provider =>
        option(
          `new:${provider}`,
          <ProviderMark
            provider={provider}
            name={PROVIDER_LABELS[provider].label}
          />,
          () => create(provider),
          false,
        ),
      )}
    </Col>
  );
};

const ConnectAndTest = ({ policy, connection }: { policy: ProtoPolicy; connection: ProtoConnection }) => {
  const { updateConnection } = useAccessPrototype();
  const [isTesting, setIsTesting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const host = `${policy.domains[0]?.split('.').slice(-2).join('.') ?? 'example.com'}`;
  const acsUrl = `https://clerk.${host}/v1/saml/acs/${connection.id}`;
  const entityId = `https://clerk.${host}/saml/${connection.id}`;

  // The prototype's handshake: a pending row that resolves to success and
  // activates the connection.
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
          log.id === id ? { ...log, detail: `Signed in as you@${policy.domains[0] ?? host}`, status: 'success' } : log,
        ),
      }));
      setIsTesting(false);
    });
  };

  const refresh = () => {
    setIsRefreshing(true);
    void simulateRequest(500).then(() => setIsRefreshing(false));
  };

  return (
    <Col sx={t => ({ gap: t.space.$4 })}>
      {connection.status === 'broken' ? (
        <WarningLine>
          Sign-in through this connection is failing. Update your identity provider, then test the connection again.
        </WarningLine>
      ) : null}
      <Text
        colorScheme='secondary'
        sx={smallSx}
      >
        {`Paste these values into ${PROVIDER_LABELS[connection.provider].label}, then test the connection.`}
      </Text>
      <Labelled label='Assertion consumer service (ACS)'>
        <ClipboardInput
          value={acsUrl}
          readOnly
        />
      </Labelled>
      <Labelled label='Entity ID'>
        <ClipboardInput
          value={entityId}
          readOnly
        />
      </Labelled>

      <Flex
        justify='between'
        align='start'
        gap={3}
      >
        <Col sx={t => ({ gap: t.space.$0x5 })}>
          <Text variant='subtitle'>Test SSO connection</Text>
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
        >
          <Icon
            icon={Link}
            sx={t => ({ width: t.sizes.$4, height: t.sizes.$4, marginInlineEnd: t.space.$1 })}
          />
          Test connection
        </Button>
      </Flex>

      <Flex
        justify='between'
        align='center'
      >
        <Flex
          align='center'
          gap={2}
        >
          <Text variant='subtitle'>Logs</Text>
          <Badge colorScheme='secondary'>{String(connection.logs.length)}</Badge>
        </Flex>
        <Button
          variant='outline'
          textVariant='buttonSmall'
          block={false}
          isLoading={isRefreshing}
          onClick={refresh}
        >
          <Icon
            icon={RotateLeftRight}
            sx={t => ({ width: t.sizes.$4, height: t.sizes.$4, marginInlineEnd: t.space.$1 })}
          />
          Refresh
        </Button>
      </Flex>

      {connection.logs.length === 0 ? (
        <Text
          colorScheme='secondary'
          sx={smallSx}
        >
          No sign-ins through this connection yet.
        </Text>
      ) : (
        <Flex sx={{ overflowX: 'auto', width: '100%' }}>
          <Table>
            <Thead>
              <Tr>
                <Th localizationKey={protoKey('Timestamp')} />
                <Th localizationKey={protoKey('Run details')} />
                <Th localizationKey={protoKey('Status')} />
              </Tr>
            </Thead>
            <Tbody>
              {connection.logs.map(log => {
                const { time, day } = formatLogTime(log.at);
                const status = LOG_STATUS[log.status];
                return (
                  <Tr key={log.id}>
                    <Td>
                      <Text sx={smallSx}>
                        {time}{' '}
                        <Text
                          as='span'
                          colorScheme='secondary'
                          sx={smallSx}
                        >
                          {day}
                        </Text>
                      </Text>
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
                      <Badge colorScheme={status.colorScheme}>{status.label}</Badge>
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        </Flex>
      )}
    </Col>
  );
};

/* --------------------------------------------------------- directory sync */

const generateToken = () =>
  Array.from({ length: 18 }, () => 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789'[Math.floor(Math.random() * 34)]).join('');

export const DirectorySyncTab = ({
  policy,
  provider,
  onContinue,
}: {
  policy: ProtoPolicy;
  provider: ProtoProvider;
  onContinue: () => void;
}) => {
  const { updatePolicy } = useAccessPrototype();
  const [showInstructions, setShowInstructions] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const token = policy.directory?.token ?? '';
  const host = `${policy.domains[0]?.split('.').slice(-2).join('.') ?? 'example.com'}`;
  const endpoint = `https://${host}/api/scim/v2`;

  const generate = () => {
    setIsGenerating(true);
    void simulateRequest().then(() => {
      updatePolicy(policy.id, current => ({
        directory: { configured: current.directory?.configured ?? false, provider, token: generateToken() },
      }));
      setIsGenerating(false);
    });
  };

  const save = () => {
    setIsSaving(true);
    void simulateRequest().then(() => {
      updatePolicy(policy.id, current => ({
        directory: { provider, token: current.directory?.token ?? generateToken(), configured: true },
      }));
      setIsSaving(false);
      onContinue();
    });
  };

  return (
    <Col sx={t => ({ gap: t.space.$5, paddingTop: t.space.$4, width: '100%' })}>
      <Col sx={t => ({ gap: t.space.$0x5 })}>
        <Text variant='subtitle'>Configure</Text>
        <Text
          colorScheme='secondary'
          sx={smallSx}
        >
          Add these credentials to your identity provider to configure Directory Sync
        </Text>
      </Col>

      <Panel>
        <Flex
          justify='between'
          align='start'
          gap={3}
        >
          <Col sx={t => ({ gap: t.space.$1x5 })}>
            <ProviderMark
              provider={provider}
              name={PROVIDER_LABELS[provider].label}
            />
            <Flex
              align='center'
              gap={1}
            >
              <Text
                colorScheme='secondary'
                sx={xsSx}
              >
                Domains:
              </Text>
              {policy.domains.map(domain => (
                <Badge
                  key={domain}
                  colorScheme='secondary'
                >
                  {domain}
                </Badge>
              ))}
            </Flex>
          </Col>
          <Button
            variant='outline'
            textVariant='buttonSmall'
            block={false}
            isDisabled
            localizationKey={protoKey('Change')}
          />
        </Flex>
        <Box
          sx={t => ({
            borderTopWidth: t.borderWidths.$normal,
            borderTopStyle: t.borderStyles.$solid,
            borderTopColor: t.colors.$borderAlpha100,
            paddingTop: t.space.$3,
          })}
        >
          <Button
            variant='link'
            textVariant='buttonSmall'
            block={false}
            onClick={() => setShowInstructions(value => !value)}
          >
            View instructions
            <Icon
              icon={ChevronDown}
              sx={t => ({
                width: t.sizes.$3,
                height: t.sizes.$3,
                marginInlineStart: t.space.$1,
                transform: showInstructions ? 'rotate(180deg)' : undefined,
              })}
            />
          </Button>
          {showInstructions ? (
            <Text
              colorScheme='secondary'
              sx={t => ({ ...smallSx(t), paddingTop: t.space.$2 })}
            >
              In {PROVIDER_LABELS[provider].label}, open your application’s Provisioning settings, enable SCIM, and
              paste the endpoint URL and bearer token below. Assign the groups you want synced.
            </Text>
          ) : null}
        </Box>
      </Panel>

      <Labelled label='SCIM endpoint URL'>
        <ClipboardInput
          value={endpoint}
          readOnly
        />
      </Labelled>

      <Labelled label='Bearer token'>
        <Flex
          align='center'
          gap={2}
        >
          <Box sx={{ flex: 1 }}>
            <ClipboardInput
              value={token || 'Generate a token to get started'}
              readOnly
            />
          </Box>
          <Button
            variant='outline'
            textVariant='buttonSmall'
            block={false}
            isLoading={isGenerating}
            onClick={generate}
            localizationKey={protoKey('Generate new token')}
          />
        </Flex>
        <WarningLine>This token is only shown once. Generate a new token if you lose it.</WarningLine>
      </Labelled>

      {(['Attributes', 'Roles'] as const).map(section => (
        <Flex
          key={section}
          justify='between'
          align='center'
          sx={t => ({
            paddingTop: t.space.$3,
            borderTopWidth: t.borderWidths.$normal,
            borderTopStyle: t.borderStyles.$solid,
            borderTopColor: t.colors.$borderAlpha100,
          })}
        >
          <Text variant='subtitle'>{section}</Text>
          <Badge colorScheme='secondary'>Coming soon</Badge>
        </Flex>
      ))}

      <FormButtonContainer sx={{ justifyContent: 'space-between' }}>
        {/* Prototype shortcut: a token is generated on save if none exists. */}
        <Button
          variant='link'
          textVariant='buttonSmall'
          block={false}
          isLoading={isSaving}
          onClick={save}
          localizationKey={protoKey('Mock the setup (prototype)')}
        />
        <Button
          textVariant='buttonSmall'
          block={false}
          isDisabled={!token}
          isLoading={isSaving}
          onClick={save}
          localizationKey={protoKey('Save & continue')}
        />
      </FormButtonContainer>
    </Col>
  );
};
