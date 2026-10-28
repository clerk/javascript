import { ProfileCard } from '@/ui/elements/ProfileCard';
import { Select, SelectButton, SelectOptionList } from '@/ui/elements/Select';
import { Tab, TabPanel, TabPanels, Tabs, TabsList } from '@/ui/elements/Tabs';
import { ThreeDotsMenu } from '@/ui/elements/ThreeDotsMenu';

import {
  Badge,
  Box,
  Button,
  Col,
  descriptors,
  Flex,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from '../../../customizables';
import { Header } from '../../../elements/Header';
import type { PropsOfComponent } from '../../../styledSystem';
import { ManageConnectionPage, SetupWizard } from './ConnectionPages';
import { useAccessNavigation } from './navigation';
import { borderSx, ContentRefContext, InfoTooltip, smallSx } from './parts';
import { PolicyPage } from './PolicyPage';
import type { ProtoConnection, ProtoPolicy, ScenarioKey } from './prototypeState';
import {
  activationBlocker,
  connectionById,
  draftFromPolicy,
  ENROLLMENT_LABELS,
  policyTarget,
  protoKey,
  SCENARIO_LABELS,
  useAccessPrototype,
} from './prototypeState';
import { ProviderMark } from './ProviderMark';

/*
 * Prototype: the Access page in <OrganizationProfile />, built to the Oct
 * 2026 "MVP" Figma (Organizations file, 13750:22959). One route; the query
 * params documented in ./navigation pick the view.
 */
export const AccessOnboardingPage = ({ contentRef }: { contentRef?: React.RefObject<HTMLDivElement> }) => {
  const { queryParams } = useAccessNavigation();
  const { setup, policy, connection } = queryParams as Record<string, string | undefined>;

  return (
    <ContentRefContext.Provider value={contentRef ?? null}>
      {setup === 'sso' || setup === 'directory' ? (
        <SetupWizard
          key={`${setup}:${policy}`}
          kind={setup}
          policyId={policy ?? 'new'}
        />
      ) : connection ? (
        <ManageConnectionPage
          key={connection}
          connectionId={connection}
          fromPolicy={policy}
        />
      ) : policy ? (
        <PolicyPage
          key={policy}
          policyId={policy}
        />
      ) : (
        <AccessListPage />
      )}
    </ContentRefContext.Provider>
  );
};

const AccessListPage = () => {
  const store = useAccessPrototype();
  const nav = useAccessNavigation();
  const tabIndex = nav.queryParams.tab === 'connections' ? 1 : 0;

  return (
    <ProfileCard.Page>
      <Col
        elementDescriptor={descriptors.page}
        sx={t => ({ gap: t.space.$4 })}
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
                sx={smallSx}
              >
                {`Prototype: ${SCENARIO_LABELS[store.scenario]}`}
              </Text>
            </SelectButton>
            <SelectOptionList />
          </Select>
        </Flex>

        <Tabs
          value={tabIndex}
          onChange={index => (index === 1 ? nav.toConnections() : nav.toPolicies())}
        >
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
  const nav = useAccessNavigation();
  const active = policies.filter(policy => !policy.isCatchAll && policy.status === 'active');
  const catchAll = policies.filter(policy => policy.isCatchAll);
  const inactive = policies.filter(policy => !policy.isCatchAll && policy.status !== 'active');

  return (
    <Col sx={t => ({ gap: t.space.$6, width: '100%', paddingTop: t.space.$4 })}>
      <Col sx={t => ({ gap: t.space.$3 })}>
        <Flex
          justify='between'
          align='center'
          gap={4}
        >
          <Col sx={t => ({ gap: t.space.$0x5 })}>
            <Text variant='subtitle'>Access policies</Text>
            <Text
              colorScheme='secondary'
              sx={smallSx}
            >
              Control access for your organization, including SSO and Directory Sync.
            </Text>
          </Col>
          {access.canManage ? (
            <Button
              size='sm'
              textVariant='buttonSmall'
              block={false}
              onClick={() => nav.toPolicy('new')}
              localizationKey={protoKey('Add policy')}
            />
          ) : null}
        </Flex>
        <PolicyTable policies={[...active, ...catchAll]} />
      </Col>

      {inactive.length > 0 ? (
        <Col sx={t => ({ gap: t.space.$3 })}>
          <Text variant='subtitle'>Inactive</Text>
          <PolicyTable policies={inactive} />
        </Col>
      ) : null}
    </Col>
  );
};

const PolicyTable = ({ policies }: { policies: ProtoPolicy[] }) => {
  const { access } = useAccessPrototype();
  return (
    <Box sx={t => ({ ...borderSx(t), overflowX: 'auto', width: '100%' })}>
      <Table sx={{ tableLayout: 'fixed' }}>
        <Thead>
          <Tr>
            <Th
              localizationKey={protoKey('Target')}
              sx={{ width: '31%' }}
            />
            <Th
              localizationKey={protoKey('Enrollment')}
              sx={{ width: '31%' }}
            />
            <Th localizationKey={protoKey('Authentication')} />
            {access.canManage ? (
              <Th
                localizationKey={protoKey('')}
                sx={t => ({ width: t.sizes.$10 })}
              />
            ) : null}
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
    </Box>
  );
};

const PolicyRow = ({ policy }: { policy: ProtoPolicy }) => {
  const { policies, connections, access, updatePolicy, removePolicy } = useAccessPrototype();
  const nav = useAccessNavigation();
  const open = () => nav.toPolicy(policy.id);
  const directory = connectionById(policy.directoryId, connections);
  const ssoConnections = policy.connectionIds
    .map(id => connectionById(id, connections))
    .filter((entry): entry is ProtoConnection => Boolean(entry));

  const actions: PropsOfComponent<typeof ThreeDotsMenu>['actions'] = [
    { label: protoKey('Edit policy'), onClick: open },
  ];
  if (policy.status === 'active') {
    actions.push({ label: protoKey('Deactivate'), onClick: () => updatePolicy(policy.id, { status: 'inactive' }) });
  } else if (!activationBlocker(draftFromPolicy(policy), false)) {
    actions.push({ label: protoKey('Activate'), onClick: () => updatePolicy(policy.id, { status: 'active' }) });
  }
  actions.push({ label: protoKey('Remove policy'), isDestructive: true, onClick: () => removePolicy(policy.id) });

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
          gap={2}
        >
          <Text
            variant='subtitle'
            truncate
          >
            {policyTarget(policy, policies)}
          </Text>
          {policy.isCatchAll ? (
            <InfoTooltip
              text={
                policies.some(other => !other.isCatchAll && other.status === 'active')
                  ? 'Applies to anyone whose email does not match an active policy above.'
                  : 'Applies to everyone until you add a policy.'
              }
            />
          ) : policy.status !== 'active' ? (
            <Badge colorScheme='primary'>{policy.status === 'draft' ? 'Draft' : 'Inactive'}</Badge>
          ) : null}
        </Flex>
      </Td>
      <Td>
        {policy.enrollment === 'directory_sync' && directory ? (
          <ProviderMark
            provider={directory.provider}
            name={directory.name}
          />
        ) : (
          <Text sx={smallSx}>{ENROLLMENT_LABELS[policy.enrollment].label}</Text>
        )}
      </Td>
      <Td>
        {policy.signIn === 'sso' && ssoConnections.length > 0 ? (
          <Flex
            align='center'
            gap={2}
          >
            <ProviderMark
              provider={ssoConnections[0].provider}
              name={ssoConnections[0].name}
              status={ssoConnections[0].status}
            />
            {ssoConnections.length > 1 ? <Badge colorScheme='primary'>{`+${ssoConnections.length - 1}`}</Badge> : null}
          </Flex>
        ) : (
          <Flex
            align='center'
            gap={2}
          >
            <Text sx={smallSx}>Default</Text>
            <InfoTooltip text="Members sign in with the application's existing sign-in methods." />
          </Flex>
        )}
      </Td>
      {access.canManage ? (
        <Td onClick={event => event.stopPropagation()}>
          {policy.isCatchAll ? null : <ThreeDotsMenu actions={actions} />}
        </Td>
      ) : null}
    </Tr>
  );
};

/* ---------------------------------------------------------- connections */

const CONNECTION_STATUS: Record<
  ProtoConnection['status'],
  { label: string; colorScheme: PropsOfComponent<typeof Badge>['colorScheme'] }
> = {
  active: { label: 'Active', colorScheme: 'primary' },
  pending: { label: 'Not tested', colorScheme: 'warning' },
  broken: { label: 'Needs attention', colorScheme: 'danger' },
};

const ConnectionsPanel = () => {
  const { connections } = useAccessPrototype();
  return (
    <Col sx={t => ({ gap: t.space.$6, width: '100%', paddingTop: t.space.$4 })}>
      <ConnectionTable
        title='SSO'
        empty='No SSO connections yet. Add one from a policy’s Authentication setting.'
        connections={connections.filter(connection => connection.kind === 'sso')}
      />
      <ConnectionTable
        title='Directory'
        empty='No directories yet. Add one from a policy’s Enrollment setting.'
        connections={connections.filter(connection => connection.kind === 'directory')}
      />
    </Col>
  );
};

const ConnectionTable = ({
  title,
  empty,
  connections,
}: {
  title: string;
  empty: string;
  connections: ProtoConnection[];
}) => {
  const { access } = useAccessPrototype();
  const nav = useAccessNavigation();
  return (
    <Col sx={t => ({ gap: t.space.$3 })}>
      <Text variant='subtitle'>{title}</Text>
      <Box sx={t => ({ ...borderSx(t), overflowX: 'auto', width: '100%' })}>
        <Table sx={{ tableLayout: 'fixed' }}>
          <Thead>
            <Tr>
              <Th
                localizationKey={protoKey('Connection')}
                sx={{ width: '50%' }}
              />
              <Th localizationKey={protoKey('Status')} />
            </Tr>
          </Thead>
          <Tbody>
            {connections.length === 0 ? (
              <Tr>
                <Td colSpan={2}>
                  <Text
                    colorScheme='secondary'
                    sx={smallSx}
                  >
                    {empty}
                  </Text>
                </Td>
              </Tr>
            ) : (
              connections.map(connection => (
                <Tr
                  key={connection.id}
                  onClick={access.canManage ? () => nav.toConnection(connection.id) : undefined}
                  sx={t => ({
                    cursor: access.canManage ? 'pointer' : 'default',
                    '&:hover': access.canManage ? { backgroundColor: t.colors.$neutralAlpha50 } : undefined,
                  })}
                >
                  <Td>
                    <ProviderMark
                      provider={connection.provider}
                      name={connection.name}
                      status={connection.status}
                    />
                  </Td>
                  <Td>
                    <Badge colorScheme={CONNECTION_STATUS[connection.status].colorScheme}>
                      {CONNECTION_STATUS[connection.status].label}
                    </Badge>
                  </Td>
                </Tr>
              ))
            )}
          </Tbody>
        </Table>
      </Box>
    </Col>
  );
};
