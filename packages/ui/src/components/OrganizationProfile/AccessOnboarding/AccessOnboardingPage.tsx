import { useState } from 'react';

import { withCardStateProvider } from '@/ui/elements/contexts';
import { Form } from '@/ui/elements/Form';
import { FormButtonContainer } from '@/ui/elements/FormButtons';
import { FormContainer } from '@/ui/elements/FormContainer';
import { Header } from '@/ui/elements/Header';
import { ProfileCard } from '@/ui/elements/ProfileCard';
import { Select, SelectButton, SelectOptionList } from '@/ui/elements/Select';
import { Tab, TabPanel, TabPanels, Tabs, TabsList } from '@/ui/elements/Tabs';
import { ThreeDotsMenu } from '@/ui/elements/ThreeDotsMenu';
import { Tooltip } from '@/ui/elements/Tooltip';
import { useFormControl } from '@/ui/utils/useFormControl';

import {
  Badge,
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
import { Action } from '../../../elements/Action';
import { useActionContext } from '../../../elements/Action/ActionRoot';
import { InformationCircle } from '../../../icons';
import { useRouter } from '../../../router';
import type { PropsOfComponent } from '../../../styledSystem';
import { ConfigurePolicyPage } from './ConfigurePolicyPage';
import type { ProtoConnection, ProtoPolicy, ScenarioKey } from './prototypeState';
import {
  connectionFor,
  ENROLLMENT_LABELS,
  policiesForConnection,
  policyTarget,
  protoKey,
  PROVIDER_LABELS,
  SCENARIO_LABELS,
  simulateRequest,
  useAccessPrototype,
} from './prototypeState';
import { ProviderMark } from './ProviderMark';

/*
 * Prototype: the Access page in <OrganizationProfile />, built to the Sept
 * 2026 Figma. One route; `?policy=<id>` opens the Configure policy page for
 * that row so the table and the editor share the session-backed store.
 */
export const AccessOnboardingPage = () => {
  const { queryParams } = useRouter();
  const policyId = queryParams.policy;
  return policyId ? <ConfigurePolicyPage policyId={policyId} /> : <AccessListPage />;
};

const openPolicy = (navigate: ReturnType<typeof useRouter>['navigate'], policyId: string, tab?: string) => {
  const params = new URLSearchParams({ policy: policyId });
  if (tab) {
    params.set('tab', tab);
  }
  return navigate('../organization-access', { searchParams: params });
};

const AccessListPage = () => {
  const store = useAccessPrototype();

  return (
    <ProfileCard.Page>
      <Col
        elementDescriptor={descriptors.page}
        sx={t => ({ gap: t.space.$6 })}
      >
        <Flex
          justify='between'
          align='start'
          gap={4}
        >
          <Header.Root>
            <Header.Title
              localizationKey={protoKey('Access')}
              textVariant='h2'
            />
          </Header.Root>
          {/* Prototype-only: jump between the states on the design board. */}
          <Select
            elementId='role'
            options={(Object.keys(SCENARIO_LABELS) as ScenarioKey[]).map(value => ({
              value,
              label: SCENARIO_LABELS[value],
            }))}
            value={store.scenario}
            onChange={option => store.setScenario(option.value)}
          >
            <SelectButton
              sx={t => ({ color: t.colors.$colorMutedForeground, fontSize: t.fontSizes.$sm, textWrap: 'nowrap' })}
            >
              <Text
                as='span'
                colorScheme='secondary'
                sx={t => ({ fontSize: t.fontSizes.$sm })}
              >
                {`Prototype: ${SCENARIO_LABELS[store.scenario]}`}
              </Text>
            </SelectButton>
            <SelectOptionList />
          </Select>
        </Flex>

        <Tabs>
          <TabsList sx={t => ({ gap: t.space.$2 })}>
            <Tab localizationKey={protoKey('Policies')} />
            <Tab localizationKey={protoKey('Connections')} />
          </TabsList>
          <TabPanels>
            <TabPanel sx={{ width: '100%' }}>
              <PoliciesPanel />
            </TabPanel>
            <TabPanel sx={{ width: '100%' }}>
              <ConnectionsPanel />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Col>
    </ProfileCard.Page>
  );
};

/* ------------------------------------------------------------- policies */

const PoliciesPanel = () => {
  const { policies, access } = useAccessPrototype();

  return (
    // Action.Root renders an animation wrapper with no width of its own; the
    // tab panel is a row flex, so without this the whole panel shrink-wraps.
    <Box sx={{ width: '100%' }}>
      <Action.Root>
        <Col sx={t => ({ gap: t.space.$4, width: '100%', paddingTop: t.space.$4 })}>
          <Flex
            justify='between'
            align='center'
            gap={4}
          >
            <Col sx={t => ({ gap: t.space.$0x5 })}>
              <Text variant='subtitle'>Policies</Text>
              <Text
                colorScheme='secondary'
                sx={t => ({ fontSize: t.fontSizes.$sm })}
              >
                Configure enrollment, sign-in, SSO, and Directory Sync.
              </Text>
            </Col>
            {access.canManage ? (
              <Action.Trigger value='add'>
                <Button
                  size='sm'
                  localizationKey={protoKey('Add')}
                />
              </Action.Trigger>
            ) : null}
          </Flex>

          <Action.Open value='add'>
            <Action.Card>
              <AddDomainClose />
            </Action.Card>
          </Action.Open>

          <Flex sx={t => ({ overflowX: 'auto', paddingBlock: t.space.$1, width: '100%' })}>
            <Table>
              <Thead>
                <Tr>
                  <Th localizationKey={protoKey('Target')} />
                  <Th localizationKey={protoKey('Enrollment')} />
                  <Th localizationKey={protoKey('Authentication')} />
                  {access.canManage ? <Th localizationKey={protoKey('')} /> : null}
                </Tr>
              </Thead>
              <Tbody>
                {policies.map(policy => (
                  <PolicyRow
                    key={policy.id}
                    policy={policy}
                  />
                ))}
              </Tbody>
            </Table>
          </Flex>
        </Col>
      </Action.Root>
    </Box>
  );
};

const AddDomainClose = () => {
  const { close } = useActionContext();
  return <AddDomainCard onClose={close} />;
};

/*
 * Adding a domain creates the row at the application's defaults and lands
 * back on the table. Everything else — proof, sign-in, enrollment — is done
 * by editing the policy, the same way the auto-created row is.
 */
const AddDomainCard = withCardStateProvider(({ onClose }: { onClose: () => void }) => {
  const { policies, addDomain } = useAccessPrototype();
  const [isSaving, setIsSaving] = useState(false);
  const nameField = useFormControl('name', '', {
    type: 'text',
    label: protoKey(''),
    placeholder: protoKey('acme.com'),
    isRequired: true,
  });

  const name = nameField.value.trim().toLowerCase();
  const isDuplicate = policies.some(policy => policy.domains.includes(name));
  const canSubmit = /^[a-z0-9.-]+\.[a-z]{2,}$/.test(name) && !isDuplicate;

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    void simulateRequest().then(() => {
      addDomain(name);
      setIsSaving(false);
      onClose();
    });
  };

  return (
    <FormContainer
      headerTitle={protoKey('Add domain')}
      headerSubtitle={protoKey('Add your domain to create a new policy')}
    >
      <Form.Root onSubmit={onSubmit}>
        <Form.ControlRow elementId={nameField.id}>
          <Form.PlainInput {...nameField.props} />
        </Form.ControlRow>
        {isDuplicate ? (
          <Text
            colorScheme='danger'
            sx={t => ({ fontSize: t.fontSizes.$sm })}
          >
            A policy for this domain already exists.
          </Text>
        ) : null}
        <FormButtonContainer>
          <Button
            variant='ghost'
            textVariant='buttonSmall'
            block={false}
            onClick={onClose}
            localizationKey={protoKey('Cancel')}
          />
          <Button
            type='submit'
            textVariant='buttonSmall'
            block={false}
            isDisabled={!canSubmit}
            isLoading={isSaving}
            localizationKey={protoKey('Add domain')}
          />
        </FormButtonContainer>
      </Form.Root>
    </FormContainer>
  );
});

const cellTextSx = (t: Parameters<Extract<PropsOfComponent<typeof Text>['sx'], (...args: any[]) => any>>[0]) => ({
  fontSize: t.fontSizes.$sm,
});

const PolicyRow = ({ policy }: { policy: ProtoPolicy }) => {
  const { policies, connections, access, removePolicy } = useAccessPrototype();
  const { navigate } = useRouter();
  const connection = connectionFor(policy, connections);
  const open = () => void openPolicy(navigate, policy.id);

  const actions: PropsOfComponent<typeof ThreeDotsMenu>['actions'] = [
    { label: protoKey('Edit policy'), onClick: open },
  ];
  if (!policy.isCatchAll) {
    actions.push({
      label: protoKey('Remove policy'),
      isDestructive: true,
      onClick: () => removePolicy(policy.id),
    });
  }

  return (
    <Tr
      onClick={access.canManage ? open : undefined}
      sx={t => ({
        cursor: access.canManage ? 'pointer' : 'default',
        backgroundColor: policy.isCatchAll ? t.colors.$neutralAlpha25 : undefined,
        '&:hover': access.canManage ? { backgroundColor: t.colors.$neutralAlpha50 } : undefined,
      })}
    >
      <Td>
        <Flex
          align='center'
          gap={1}
        >
          <Text variant='subtitle'>{policyTarget(policy, policies)}</Text>
          {policy.isCatchAll ? <CatchAllTooltip hasDomains={policies.some(other => !other.isCatchAll)} /> : null}
        </Flex>
      </Td>
      <Td>
        <Text
          colorScheme='secondary'
          sx={cellTextSx}
        >
          {ENROLLMENT_LABELS[policy.enrollment].short}
        </Text>
      </Td>
      <Td>
        {policy.signIn === 'sso' && connection ? (
          <ProviderMark
            provider={connection.provider}
            name={connection.name}
            status={connection.status}
          />
        ) : (
          <Text
            colorScheme='secondary'
            sx={cellTextSx}
          >
            Default
          </Text>
        )}
      </Td>
      {access.canManage ? (
        <Td onClick={event => event.stopPropagation()}>
          <ThreeDotsMenu actions={actions} />
        </Td>
      ) : null}
    </Tr>
  );
};

const CatchAllTooltip = ({ hasDomains }: { hasDomains: boolean }) => (
  <Tooltip.Root>
    <Tooltip.Trigger>
      <Button
        variant='unstyled'
        aria-label='Who this applies to'
        sx={t => ({
          display: 'inline-flex',
          alignItems: 'center',
          padding: 0,
          height: 'fit-content',
          borderRadius: t.radii.$sm,
          color: t.colors.$colorMutedForeground,
        })}
      >
        <Icon
          icon={InformationCircle}
          aria-hidden
          sx={t => ({ width: t.sizes.$4, height: t.sizes.$4 })}
        />
      </Button>
    </Tooltip.Trigger>
    <Tooltip.Content
      text={protoKey(
        hasDomains
          ? 'Applies to anyone whose email does not match a domain listed above.'
          : 'Applies to everyone until you add a domain.',
      )}
    />
  </Tooltip.Root>
);

/* ---------------------------------------------------------- connections */

const CONNECTION_STATUS: Record<
  ProtoConnection['status'],
  { label: string; colorScheme: PropsOfComponent<typeof Badge>['colorScheme'] }
> = {
  active: { label: 'Active', colorScheme: 'success' },
  pending: { label: 'Pending', colorScheme: 'warning' },
  broken: { label: 'Needs attention', colorScheme: 'danger' },
};

const ConnectionsPanel = () => {
  const { policies, connections, access, removeConnection } = useAccessPrototype();
  const { navigate } = useRouter();
  const directories = policies.filter(policy => policy.directory?.configured);

  return (
    <Col sx={t => ({ gap: t.space.$6, width: '100%', paddingTop: t.space.$4 })}>
      <ConnectionGroup title='SSO'>
        {connections.length === 0 ? (
          <Text
            colorScheme='secondary'
            sx={cellTextSx}
          >
            No single sign-on connections yet.
          </Text>
        ) : (
          connections.map(connection => {
            const used = policiesForConnection(connection.id, policies);
            const status = CONNECTION_STATUS[connection.status];
            return (
              <ConnectionItem
                key={connection.id}
                title={
                  <ProviderMark
                    provider={connection.provider}
                    name={connection.name}
                    status={connection.status}
                  />
                }
                subtitle={used.flatMap(policy => policy.domains).join(', ') || 'Not used by a policy'}
                badge={<Badge colorScheme={status.colorScheme}>{status.label}</Badge>}
                actions={
                  access.canManage
                    ? [
                        ...(used[0]
                          ? [
                              {
                                label: protoKey('Edit connection'),
                                onClick: () => void openPolicy(navigate, used[0].id, 'sso'),
                              },
                            ]
                          : []),
                        {
                          label: protoKey('Remove connection'),
                          isDestructive: true,
                          onClick: () => removeConnection(connection.id),
                        },
                      ]
                    : []
                }
              />
            );
          })
        )}
      </ConnectionGroup>

      <ConnectionGroup title='Directory sync'>
        {directories.length === 0 ? (
          <Text
            colorScheme='secondary'
            sx={cellTextSx}
          >
            No directory connected yet.
          </Text>
        ) : (
          directories.map(policy => (
            <ConnectionItem
              key={policy.id}
              title={
                <Text sx={cellTextSx}>
                  {policy.directory ? PROVIDER_LABELS[policy.directory.provider].label : 'Directory'}
                </Text>
              }
              subtitle={policy.domains.join(', ')}
              badge={<Badge colorScheme='success'>Active</Badge>}
              actions={
                access.canManage
                  ? [
                      {
                        label: protoKey('Edit directory sync'),
                        onClick: () => void openPolicy(navigate, policy.id, 'directory'),
                      },
                    ]
                  : []
              }
            />
          ))
        )}
      </ConnectionGroup>
    </Col>
  );
};

const ConnectionGroup = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <Flex
    gap={6}
    sx={t => ({
      alignItems: 'flex-start',
      borderBottomWidth: t.borderWidths.$normal,
      borderBottomStyle: t.borderStyles.$solid,
      borderBottomColor: t.colors.$borderAlpha100,
      paddingBottom: t.space.$4,
    })}
  >
    <Text
      variant='subtitle'
      sx={{ width: '30%', flexShrink: 0 }}
    >
      {title}
    </Text>
    <Col sx={t => ({ gap: t.space.$3, flex: 1, minWidth: 0 })}>{children}</Col>
  </Flex>
);

const ConnectionItem = ({
  title,
  subtitle,
  badge,
  actions,
}: {
  title: React.ReactNode;
  subtitle: string;
  badge: React.ReactNode;
  actions: PropsOfComponent<typeof ThreeDotsMenu>['actions'];
}) => (
  <Flex
    justify='between'
    align='center'
    gap={3}
  >
    <Col sx={t => ({ gap: t.space.$0x5, minWidth: 0 })}>
      {title}
      <Text
        colorScheme='secondary'
        sx={t => ({ fontSize: t.fontSizes.$xs })}
      >
        {subtitle}
      </Text>
    </Col>
    <Flex
      align='center'
      gap={2}
    >
      {badge}
      {actions.length > 0 ? <ThreeDotsMenu actions={actions} /> : null}
    </Flex>
  </Flex>
);
