import { useState } from 'react';

import { Select, SelectButton, SelectOptionList } from '@/ui/elements/Select';
import { Switch } from '@/ui/elements/Switch';
import { ThreeDotsMenu } from '@/ui/elements/ThreeDotsMenu';

import {
  Box,
  Button,
  CheckboxInput,
  Col,
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
import { Plus } from '../../../icons';
import { borderSx, Labelled, ModalCard, RadioOption, smallSx, TipBadge, xsSx } from './parts';
import type {
  ProtoOutsideOrganization,
  ProtoPlacementRule,
  ProtoRouting,
  ProtoSubOrganization,
} from './prototypeState';
import {
  DIRECTORY_GROUPS,
  outsideOfParent,
  PARENT_RULES,
  plural,
  protoKey,
  provenDomains,
  ROUTING_OPTIONS,
  simulateRequest,
  useAccessPrototype,
} from './prototypeState';

const NO_ORGANIZATION = '__none__';

/*
 * A parent's Organizations tab: the organizations it manages, the ones outside
 * it with users at its domains, and where users land after they sign in.
 */
export const SubOrganizationsPanel = () => {
  const store = useAccessPrototype();
  const hierarchy = store.hierarchy;
  if (!hierarchy) {
    return null;
  }
  const coveredBy = (id: string) =>
    store.policies.filter(
      policy => !policy.isCatchAll && (!policy.subOrganizationIds || policy.subOrganizationIds.includes(id)),
    );

  return (
    <Col sx={t => ({ gap: t.space.$6, width: '100%', paddingTop: t.space.$4 })}>
      <Col sx={t => ({ gap: t.space.$3 })}>
        <Col sx={t => ({ gap: t.space.$0x5 })}>
          <Text variant='subtitle'>Organizations</Text>
          <Text
            colorScheme='secondary'
            sx={smallSx}
          >
            {`Organizations managed by ${hierarchy.parentName}. They keep their own members, roles, and data. Your application decides which ones belong here.`}
          </Text>
        </Col>
        <Box sx={t => ({ ...borderSx(t), overflowX: 'auto', width: '100%' })}>
          <Table sx={{ tableLayout: 'fixed' }}>
            <Thead>
              <Tr>
                <Th
                  localizationKey={protoKey('Organization')}
                  sx={{ width: '40%' }}
                />
                <Th
                  localizationKey={protoKey('Members')}
                  sx={{ width: '20%' }}
                />
                <Th localizationKey={protoKey('Policies')} />
              </Tr>
            </Thead>
            <Tbody>
              {hierarchy.subOrganizations.map(organization => {
                const policies = coveredBy(organization.id);
                return (
                  <Tr key={organization.id}>
                    <Td>
                      <Text variant='subtitle'>{organization.name}</Text>
                    </Td>
                    <Td>
                      <Text sx={smallSx}>{String(organization.membersCount)}</Text>
                    </Td>
                    <Td>
                      <Text
                        sx={smallSx}
                        truncate
                      >
                        {policies.length > 0 ? policies.map(policy => policy.domains.join(', ')).join(' · ') : 'None'}
                      </Text>
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        </Box>
      </Col>

      <OutsideOrganizations />

      <WhereUsersLand />
    </Col>
  );
};

type Editing = { kind: 'rule'; rule: ProtoPlacementRule | null } | { kind: 'fallback' } | null;

/*
 * Where users at the parent's domains land after they sign in: nowhere until
 * invited, one organization, or by directory group or domain. Rules add up.
 */
const WhereUsersLand = () => {
  const store = useAccessPrototype();
  const hierarchy = store.hierarchy;
  const [routing, setRouting] = useState<ProtoRouting>(hierarchy?.routing ?? 'invited');
  const [landingId, setLandingId] = useState<string | null>(hierarchy?.landingOrganizationId ?? null);
  const [rules, setRules] = useState<ProtoPlacementRule[]>(hierarchy?.placementRules ?? []);
  const [fallbackId, setFallbackId] = useState<string | null>(hierarchy?.fallbackOrganizationId ?? null);
  const [editing, setEditing] = useState<Editing>(null);
  const [isSaving, setIsSaving] = useState(false);
  if (!hierarchy) {
    return null;
  }
  const organizations = hierarchy.subOrganizations;
  const canManage = store.access.canManage;
  const nameOf = (id: string) => organizations.find(entry => entry.id === id)?.name ?? id;
  const hasDirectory = store.connections.some(
    connection => connection.kind === 'directory' && connection.status === 'active',
  );
  const groups = hasDirectory ? DIRECTORY_GROUPS : [];
  const domains = provenDomains(store.policies);

  const current = { routing, landingId, rules, fallbackId };
  const saved = {
    routing: hierarchy.routing,
    landingId: hierarchy.landingOrganizationId ?? null,
    rules: hierarchy.placementRules ?? [],
    fallbackId: hierarchy.fallbackOrganizationId ?? null,
  };
  const isDirty = JSON.stringify(current) !== JSON.stringify(saved);

  const choose = (value: ProtoRouting) => {
    setRouting(value);
    if (value === 'one_organization' && !landingId) {
      setLandingId(organizations[0]?.id ?? null);
    }
  };

  const save = () => {
    setIsSaving(true);
    void simulateRequest().then(() => {
      store.updateHierarchy({
        routing,
        landingOrganizationId: landingId,
        placementRules: rules,
        fallbackOrganizationId: fallbackId,
      });
      setIsSaving(false);
    });
  };

  const routingOptions = (Object.keys(ROUTING_OPTIONS) as ProtoRouting[]).map(value => ({
    value,
    label: ROUTING_OPTIONS[value].label,
  }));
  const organizationOptions = organizations.map(entry => ({ value: entry.id, label: entry.name }));

  return (
    <Col sx={t => ({ gap: t.space.$3 })}>
      <Col sx={t => ({ gap: t.space.$0x5 })}>
        <Text variant='subtitle'>Where users land</Text>
        <Text
          colorScheme='secondary'
          sx={smallSx}
        >
          After users at your domains sign in.
        </Text>
      </Col>
      <Col sx={t => ({ gap: t.space.$1 })}>
        <Select
          elementId='role'
          options={routingOptions}
          value={routing}
          onChange={option => choose(option.value)}
        >
          <SelectButton
            aria-label='Where users land'
            isDisabled={!canManage}
            sx={t => ({ color: t.colors.$colorForeground, fontSize: t.fontSizes.$sm })}
          >
            <Text as='span'>{ROUTING_OPTIONS[routing].label}</Text>
          </SelectButton>
          <SelectOptionList />
        </Select>
        <Text
          colorScheme='secondary'
          sx={smallSx}
        >
          {ROUTING_OPTIONS[routing].description}
        </Text>
      </Col>

      {routing === 'one_organization' ? (
        <Labelled label='Organization'>
          <Select
            elementId='role'
            options={organizationOptions}
            value={landingId}
            onChange={option => setLandingId(option.value)}
          >
            <SelectButton
              aria-label='Organization'
              isDisabled={!canManage}
              sx={t => ({ color: t.colors.$colorForeground, fontSize: t.fontSizes.$sm })}
            >
              <Text as='span'>{landingId ? nameOf(landingId) : 'Choose an organization'}</Text>
            </SelectButton>
            <SelectOptionList />
          </Select>
        </Labelled>
      ) : null}

      {routing === 'rules' ? (
        <Col sx={t => ({ gap: t.space.$2 })}>
          <Box sx={t => ({ ...borderSx(t), overflowX: 'auto', width: '100%' })}>
            <Table sx={{ tableLayout: 'fixed' }}>
              <Thead>
                <Tr>
                  <Th
                    localizationKey={protoKey('Users in')}
                    sx={{ width: '50%' }}
                  />
                  <Th localizationKey={protoKey('Join')} />
                  {canManage ? <Th sx={{ width: '3rem' }} /> : null}
                </Tr>
              </Thead>
              <Tbody>
                {rules.map(rule => (
                  <Tr key={rule.id}>
                    <Td>
                      <Flex
                        align='center'
                        gap={1}
                        wrap='wrap'
                      >
                        <Text sx={smallSx}>{rule.value}</Text>
                        <Text
                          colorScheme='secondary'
                          sx={smallSx}
                        >
                          {rule.kind === 'group' ? '· group' : '· domain'}
                        </Text>
                      </Flex>
                    </Td>
                    <Td>
                      <Text sx={smallSx}>{rule.organizationIds.map(nameOf).join(', ')}</Text>
                    </Td>
                    {canManage ? (
                      <Td>
                        <ThreeDotsMenu
                          actions={[
                            { label: protoKey('Edit'), onClick: () => setEditing({ kind: 'rule', rule }) },
                            {
                              label: protoKey('Remove'),
                              isDestructive: true,
                              onClick: () => setRules(rules.filter(entry => entry.id !== rule.id)),
                            },
                          ]}
                        />
                      </Td>
                    ) : null}
                  </Tr>
                ))}
                <Tr>
                  <Td>
                    <Text variant='subtitle'>Everyone else</Text>
                  </Td>
                  <Td>
                    <Text sx={smallSx}>{fallbackId ? nameOf(fallbackId) : 'No organization'}</Text>
                  </Td>
                  {canManage ? (
                    <Td>
                      <ThreeDotsMenu
                        actions={[{ label: protoKey('Edit'), onClick: () => setEditing({ kind: 'fallback' }) }]}
                      />
                    </Td>
                  ) : null}
                </Tr>
              </Tbody>
            </Table>
          </Box>
          {canManage ? (
            <Button
              variant='outline'
              textVariant='buttonSmall'
              block={false}
              sx={{ alignSelf: 'flex-start' }}
              onClick={() => setEditing({ kind: 'rule', rule: null })}
            >
              <Icon
                icon={Plus}
                sx={t => ({ width: t.sizes.$3x5, height: t.sizes.$3x5, marginInlineEnd: t.space.$1 })}
              />
              Add rule
            </Button>
          ) : null}
          <Text
            colorScheme='secondary'
            sx={xsSx}
          >
            Users join every organization whose rule matches them. Directory groups stay in sync; with SSO only, groups
            update when users sign in.
          </Text>
        </Col>
      ) : null}

      {canManage ? (
        <Flex justify='end'>
          <Button
            textVariant='buttonSmall'
            block={false}
            isDisabled={!isDirty}
            isLoading={isSaving}
            onClick={save}
            localizationKey={protoKey('Save')}
          />
        </Flex>
      ) : null}

      {editing?.kind === 'rule' ? (
        <RuleDialog
          rule={editing.rule}
          organizations={organizations}
          groups={groups}
          domains={domains}
          onClose={() => setEditing(null)}
          onSave={next => {
            setRules(editing.rule ? rules.map(entry => (entry.id === next.id ? next : entry)) : [...rules, next]);
            setEditing(null);
          }}
        />
      ) : null}
      {editing?.kind === 'fallback' ? (
        <FallbackDialog
          value={fallbackId}
          organizations={organizations}
          onClose={() => setEditing(null)}
          onSave={next => {
            setFallbackId(next);
            setEditing(null);
          }}
        />
      ) : null}
    </Col>
  );
};

let ruleCounter = 0;

/** Add or edit a rule: a directory group or a domain, and the organizations its users join. */
const RuleDialog = ({
  rule,
  organizations,
  groups,
  domains,
  onSave,
  onClose,
}: {
  rule: ProtoPlacementRule | null;
  organizations: ProtoSubOrganization[];
  groups: string[];
  domains: string[];
  onSave: (rule: ProtoPlacementRule) => void;
  onClose: () => void;
}) => {
  const hasDirectory = groups.length > 0;
  const [kind, setKind] = useState<ProtoPlacementRule['kind']>(rule?.kind ?? (hasDirectory ? 'group' : 'domain'));
  const [value, setValue] = useState<string | null>(rule?.value ?? null);
  const [organizationIds, setOrganizationIds] = useState<string[]>(rule?.organizationIds ?? []);
  const values = kind === 'group' ? groups : domains;
  const canSave = Boolean(value) && organizationIds.length > 0;
  const pick = (next: ProtoPlacementRule['kind']) => {
    setKind(next);
    setValue(null);
  };
  const toggle = (id: string) =>
    setOrganizationIds(
      organizationIds.includes(id) ? organizationIds.filter(entry => entry !== id) : [...organizationIds, id],
    );
  const submit = () => {
    if (!value || !canSave) {
      return;
    }
    onSave({ id: rule?.id ?? `rule_new_${(ruleCounter += 1)}`, kind, value, organizationIds });
  };

  return (
    <ModalCard onClose={onClose}>
      <Text variant='subtitle'>{rule ? 'Edit rule' : 'Add rule'}</Text>
      <Labelled label='Users in'>
        <Col sx={t => ({ gap: t.space.$2 })}>
          <RadioOption
            name='rule-kind'
            checked={kind === 'group'}
            onSelect={() => pick('group')}
            isDisabled={!hasDirectory}
            label='Directory group'
            description={hasDirectory ? undefined : 'Connect a directory on a policy first.'}
          />
          <RadioOption
            name='rule-kind'
            checked={kind === 'domain'}
            onSelect={() => pick('domain')}
            label='Domain'
          />
          <Select
            elementId='role'
            options={values.map(entry => ({ value: entry, label: entry }))}
            value={value}
            onChange={option => setValue(option.value)}
          >
            <SelectButton
              aria-label={kind === 'group' ? 'Directory group' : 'Domain'}
              sx={t => ({ color: t.colors.$colorForeground, fontSize: t.fontSizes.$sm })}
            >
              <Text as='span'>{value ?? (kind === 'group' ? 'Choose a group' : 'Choose a domain')}</Text>
            </SelectButton>
            <SelectOptionList />
          </Select>
        </Col>
      </Labelled>
      <Labelled label='Join'>
        <Col sx={t => ({ gap: t.space.$2 })}>
          {organizations.map(organization => (
            <Flex
              key={organization.id}
              align='center'
              gap={2}
            >
              <CheckboxInput
                aria-label={organization.name}
                checked={organizationIds.includes(organization.id)}
                onChange={() => toggle(organization.id)}
                focusRing={false}
              />
              <Text sx={smallSx}>{organization.name}</Text>
            </Flex>
          ))}
        </Col>
      </Labelled>
      <Flex
        justify='end'
        gap={2}
      >
        <Button
          variant='ghost'
          textVariant='buttonSmall'
          block={false}
          onClick={onClose}
          localizationKey={protoKey('Cancel')}
        />
        <Button
          textVariant='buttonSmall'
          block={false}
          isDisabled={!canSave}
          onClick={submit}
          localizationKey={protoKey(rule ? 'Save rule' : 'Add rule')}
        />
      </Flex>
    </ModalCard>
  );
};

/** Where users no rule matches land: no organization, or one. */
const FallbackDialog = ({
  value,
  organizations,
  onSave,
  onClose,
}: {
  value: string | null;
  organizations: ProtoSubOrganization[];
  onSave: (value: string | null) => void;
  onClose: () => void;
}) => {
  const [choice, setChoice] = useState<string>(value ?? NO_ORGANIZATION);
  const options = [
    { value: NO_ORGANIZATION, label: 'No organization' },
    ...organizations.map(entry => ({ value: entry.id, label: entry.name })),
  ];
  return (
    <ModalCard onClose={onClose}>
      <Col sx={t => ({ gap: t.space.$0x5 })}>
        <Text variant='subtitle'>Everyone else</Text>
        <Text
          colorScheme='secondary'
          sx={smallSx}
        >
          Users no rule matches.
        </Text>
      </Col>
      <Labelled label='Join'>
        <Select
          elementId='role'
          options={options}
          value={choice}
          onChange={option => setChoice(option.value ?? NO_ORGANIZATION)}
        >
          <SelectButton
            aria-label='Join'
            sx={t => ({ color: t.colors.$colorForeground, fontSize: t.fontSizes.$sm })}
          >
            <Text as='span'>{options.find(option => option.value === choice)?.label ?? ''}</Text>
          </SelectButton>
          <SelectOptionList />
        </Select>
      </Labelled>
      <Flex
        justify='end'
        gap={2}
      >
        <Button
          variant='ghost'
          textVariant='buttonSmall'
          block={false}
          onClick={onClose}
          localizationKey={protoKey('Cancel')}
        />
        <Button
          textVariant='buttonSmall'
          block={false}
          onClick={() => onSave(choice === NO_ORGANIZATION ? null : choice)}
          localizationKey={protoKey('Save')}
        />
      </Flex>
    </ModalCard>
  );
};

/** On the parent's Members tab: whether its members can open every organization in it. */
export const ParentMembersSetting = () => {
  const store = useAccessPrototype();
  const hierarchy = store.hierarchy;
  const [isChecked, setIsChecked] = useState(hierarchy?.parentMembersSeeAll ?? false);
  if (!hierarchy) {
    return null;
  }
  const change = (checked: boolean) => {
    setIsChecked(checked);
    void simulateRequest().then(() => store.updateHierarchy({ parentMembersSeeAll: checked }));
  };
  return (
    <Col sx={t => ({ gap: t.space.$1 })}>
      <Switch
        isChecked={isChecked}
        isDisabled={!store.access.canManage}
        onChange={change}
        label={protoKey(`Members can open every organization in ${hierarchy.parentName}`)}
      />
      <Text
        colorScheme='secondary'
        sx={smallSx}
      >
        {`When off, they manage ${hierarchy.parentName} without joining its organizations.`}
      </Text>
    </Col>
  );
};

/** What a sub-organization inherits from its parent. Read-only here: the parent manages it. */
export const ParentRules = () => {
  const { hierarchy } = useAccessPrototype();
  if (!hierarchy) {
    return null;
  }
  return (
    <Col sx={t => ({ gap: t.space.$3 })}>
      <Col sx={t => ({ gap: t.space.$0x5 })}>
        <Text variant='subtitle'>{`From ${hierarchy.parentName}`}</Text>
        <Text
          colorScheme='secondary'
          sx={smallSx}
        >
          {`${hierarchy.parentName} manages these. Ask its admins to change them.`}
        </Text>
      </Col>
      <Box sx={t => ({ ...borderSx(t), overflowX: 'auto', width: '100%' })}>
        <Table sx={{ tableLayout: 'fixed' }}>
          <Thead>
            <Tr>
              <Th
                localizationKey={protoKey('Rule')}
                sx={{ width: '28%' }}
              />
              <Th
                localizationKey={protoKey('Setting')}
                sx={{ width: '36%' }}
              />
              <Th localizationKey={protoKey('Applies to')} />
            </Tr>
          </Thead>
          <Tbody>
            {PARENT_RULES.map(entry => (
              <Tr key={entry.rule}>
                <Td>
                  <Text variant='subtitle'>{entry.rule}</Text>
                </Td>
                <Td>
                  <Text sx={smallSx}>{entry.value}</Text>
                </Td>
                <Td>
                  <Text
                    colorScheme='secondary'
                    sx={smallSx}
                  >
                    {entry.audience}
                  </Text>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </Col>
  );
};

/*
 * Organizations outside the parent that have users at its domains. Inviting
 * one brings all its members in; ones the member already runs join right away.
 */
const OutsideOrganizations = () => {
  const store = useAccessPrototype();
  const [selected, setSelected] = useState<string[]>([]);
  const hierarchy = store.hierarchy;
  if (!hierarchy) {
    return null;
  }
  const parent = hierarchy.parentName;
  const canManage = store.access.canManage;
  const { organizations } = outsideOfParent(store);
  const invited = hierarchy.organizationPlans ?? {};
  const selectable = organizations.filter(entry => !invited[entry.id]);
  const allSelected = selectable.length > 0 && selected.length === selectable.length;
  const toggle = (id: string) =>
    setSelected(selected.includes(id) ? selected.filter(entry => entry !== id) : [...selected, id]);

  return (
    <Col sx={t => ({ gap: t.space.$3 })}>
      <Col sx={t => ({ gap: t.space.$0x5 })}>
        <Text variant='subtitle'>{`Organizations outside ${parent}`}</Text>
        <Text
          colorScheme='secondary'
          sx={smallSx}
        >
          They have users at your domains. Invite them to bring all their members in.
        </Text>
      </Col>
      {organizations.length === 0 ? (
        <Text
          colorScheme='secondary'
          sx={smallSx}
        >
          {`No organizations outside ${parent} have users at your domains.`}
        </Text>
      ) : (
        <>
          {selected.length > 0 ? (
            <Flex
              align='center'
              justify='between'
              gap={3}
              wrap='wrap'
              sx={t => ({ ...borderSx(t), padding: t.space.$3, backgroundColor: t.colors.$neutralAlpha25 })}
            >
              <Text sx={smallSx}>{`${selected.length} selected`}</Text>
              <Flex gap={2}>
                <Button
                  size='xs'
                  textVariant='buttonSmall'
                  block={false}
                  onClick={() => {
                    store.inviteOrganizations(selected);
                    setSelected([]);
                  }}
                  localizationKey={protoKey(`Invite to ${parent}`)}
                />
                <Button
                  variant='ghost'
                  size='xs'
                  textVariant='buttonSmall'
                  block={false}
                  onClick={() => setSelected([])}
                  localizationKey={protoKey('Cancel')}
                />
              </Flex>
            </Flex>
          ) : null}
          <Box sx={t => ({ ...borderSx(t), overflowX: 'auto', width: '100%' })}>
            <Table sx={{ tableLayout: 'fixed' }}>
              <Thead>
                <Tr>
                  {canManage ? (
                    <Th sx={{ width: '2.75rem' }}>
                      <CheckboxInput
                        aria-label='Select all organizations outside'
                        checked={allSelected}
                        onChange={() => setSelected(allSelected ? [] : selectable.map(entry => entry.id))}
                        focusRing={false}
                      />
                    </Th>
                  ) : null}
                  <Th
                    localizationKey={protoKey('Organization')}
                    sx={{ width: '44%' }}
                  />
                  <Th localizationKey={protoKey('Your users')} />
                  <Th localizationKey={protoKey('Status')} />
                  {canManage ? <Th sx={{ width: '3rem' }} /> : null}
                </Tr>
              </Thead>
              <Tbody>
                {organizations.map(organization => {
                  const isInvited = Boolean(invited[organization.id]);
                  return (
                    <Tr key={organization.id}>
                      {canManage ? (
                        <Td>
                          {isInvited ? null : (
                            <CheckboxInput
                              aria-label={`Select ${organization.name}`}
                              checked={selected.includes(organization.id)}
                              onChange={() => toggle(organization.id)}
                              focusRing={false}
                            />
                          )}
                        </Td>
                      ) : null}
                      <Td>
                        <OrganizationName organization={organization} />
                      </Td>
                      <Td>
                        <Text sx={smallSx}>{String(organization.people.length)}</Text>
                      </Td>
                      <Td>{isInvited ? <TipBadge tip='Its owner has to accept.'>Invited</TipBadge> : null}</Td>
                      {canManage ? (
                        <Td>
                          {isInvited ? (
                            <ThreeDotsMenu
                              actions={[
                                {
                                  label: protoKey('Cancel invitation'),
                                  isDestructive: true,
                                  onClick: () => store.cancelInvitation(organization.id),
                                },
                              ]}
                            />
                          ) : null}
                        </Td>
                      ) : null}
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          </Box>
        </>
      )}
    </Col>
  );
};

const OrganizationName = ({ organization }: { organization: ProtoOutsideOrganization }) => (
  <Col>
    <Text
      variant='subtitle'
      truncate
    >
      {organization.name}
    </Text>
    <Text
      colorScheme='secondary'
      sx={xsSx}
    >
      {organization.membersCount === 1
        ? 'Only member'
        : `${plural(organization.membersCount, 'member')}${organization.isAdmin ? ' · you’re an admin' : ''}`}
    </Text>
  </Col>
);
