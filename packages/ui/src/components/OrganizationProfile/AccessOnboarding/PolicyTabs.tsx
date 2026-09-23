import { useState } from 'react';

import { ClipboardInput } from '@/ui/elements/ClipboardInput';
import { FormButtonContainer } from '@/ui/elements/FormButtons';

import { Badge, Box, Button, Col, Flex, Icon, Table, Tbody, Td, Text, Th, Thead, Tr } from '../../../customizables';
import { ChevronDown, ExclamationTriangle, Link, RotateLeftRight } from '../../../icons';
import type { ProtoConnection, ProtoPolicy, ProtoProvider, ProtoTestLog } from './prototypeState';
import { protoKey, PROVIDER_LABELS, simulateRequest, useAccessPrototype } from './prototypeState';
import { ProviderMark } from './ProviderMark';

/*
 * The SSO and Directory Sync tabs of the Configure policy page, built to
 * the Sept 2026 Figma. Both are the "credentials + check" shape: values to
 * paste into the identity provider, then a way to confirm it worked. The
 * provider-picker and attributes/roles steppers are placeholders for now.
 */

const smallSx = (t: { fontSizes: { $sm: string } }) => ({ fontSize: t.fontSizes.$sm });
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

const WarningLine = ({ children }: { children: string }) => (
  <Flex
    align='center'
    gap={1}
    sx={t => ({ color: t.colors.$colorMutedForeground })}
  >
    <Icon
      icon={ExclamationTriangle}
      sx={t => ({ width: t.sizes.$4, height: t.sizes.$4 })}
    />
    <Text
      colorScheme='secondary'
      sx={xsSx}
    >
      {children}
    </Text>
  </Flex>
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

export const SsoTab = ({
  policy,
  connection,
  onContinue,
}: {
  policy: ProtoPolicy;
  connection: ProtoConnection;
  onContinue: () => void;
}) => {
  const { updateConnection } = useAccessPrototype();
  const [isTesting, setIsTesting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const host = `${policy.domains[0]?.split('.').slice(-2).join('.') ?? 'example.com'}`;
  const acsUrl = `https://clerk.${host}/v1/saml/acs/${connection.id}`;
  const entityId = `https://clerk.${host}/saml/${connection.id}`;

  // The prototype's handshake: a pending row that resolves to success and
  // activates the connection, so the table's row goes from pending to live.
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
    <Col sx={t => ({ gap: t.space.$5, paddingTop: t.space.$4 })}>
      <Flex
        justify='between'
        align='center'
        gap={3}
      >
        <ProviderMark
          provider={connection.provider}
          name={`${connection.name} · ${PROVIDER_LABELS[connection.provider].label}`}
          status={connection.status}
        />
        <Button
          variant='outline'
          textVariant='buttonSmall'
          block={false}
          isDisabled
          localizationKey={protoKey('Change provider')}
        />
      </Flex>

      {connection.status === 'broken' ? (
        <WarningLine>
          Sign-in through this connection is failing. Update your identity provider, then test the connection again.
        </WarningLine>
      ) : null}

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

      <Panel>
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
            localizationKey={protoKey('Test connection')}
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
      </Panel>

      <FormButtonContainer>
        <Button
          textVariant='buttonSmall'
          block={false}
          onClick={onContinue}
          localizationKey={protoKey('Save & continue')}
        />
      </FormButtonContainer>
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
    <Col sx={t => ({ gap: t.space.$5, paddingTop: t.space.$4 })}>
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

      <FormButtonContainer>
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
