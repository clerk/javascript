import { useState } from 'react';

import { Select, SelectButton, SelectOptionList } from '@/ui/elements/Select';

import { Badge, Box, Button, Col, Flex, Table, Tbody, Td, Text, Th, Thead, Tr } from '../../../customizables';
import { borderSx, RadioOption, smallSx, WarningLine } from './parts';
import type { ProtoGroupMapping, ProtoRouting } from './prototypeState';
import { PARENT_RULES, protoKey, ROUTING_LABELS, simulateRequest, useAccessPrototype } from './prototypeState';

const NO_SUB_ORGANIZATION = '__none__';

/*
 * A parent's Sub-organizations tab: which organizations it manages (the
 * application decides that), and how people who sign in at its domains end
 * up in one of them.
 */
export const SubOrganizationsPanel = () => {
  const store = useAccessPrototype();
  const hierarchy = store.hierarchy;
  const [routing, setRouting] = useState<ProtoRouting>(hierarchy?.routing ?? 'application');
  const [mappings, setMappings] = useState<ProtoGroupMapping[]>(hierarchy?.groupMappings ?? []);
  const [isSaving, setIsSaving] = useState(false);
  if (!hierarchy) {
    return null;
  }
  const directory = store.connections.find(connection => connection.kind === 'directory');
  const isDirty = routing !== hierarchy.routing || JSON.stringify(mappings) !== JSON.stringify(hierarchy.groupMappings);
  const coveredBy = (id: string) =>
    store.policies.filter(
      policy => !policy.isCatchAll && (!policy.subOrganizationIds || policy.subOrganizationIds.includes(id)),
    );

  const save = () => {
    setIsSaving(true);
    void simulateRequest().then(() => {
      store.updateHierarchy({ routing, groupMappings: mappings });
      setIsSaving(false);
    });
  };

  return (
    <Col sx={t => ({ gap: t.space.$6, width: '100%', paddingTop: t.space.$4 })}>
      <Col sx={t => ({ gap: t.space.$3 })}>
        <Col sx={t => ({ gap: t.space.$0x5 })}>
          <Text variant='subtitle'>Sub-organizations</Text>
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

      <Col sx={t => ({ gap: t.space.$3 })}>
        <Col sx={t => ({ gap: t.space.$0x5 })}>
          <Text variant='subtitle'>How people join a sub-organization</Text>
          <Text
            colorScheme='secondary'
            sx={smallSx}
          >
            {`Nobody joins ${hierarchy.parentName} by domain. This decides where people go after they sign in.`}
          </Text>
        </Col>
        {(Object.keys(ROUTING_LABELS) as ProtoRouting[]).map(value => (
          <RadioOption
            key={value}
            name='routing'
            checked={routing === value}
            onSelect={() => setRouting(value)}
            isDisabled={!store.access.canManage || (value === 'directory_groups' && !directory)}
            label={ROUTING_LABELS[value].label}
            description={
              value === 'directory_groups' && !directory
                ? 'Add a directory on a policy first.'
                : ROUTING_LABELS[value].description
            }
            badge={value === 'directory_groups' ? <Badge colorScheme='primary'>Later</Badge> : undefined}
          >
            {value === 'directory_groups' && directory ? (
              <GroupMappingTable
                directoryName={directory.name}
                mappings={mappings}
                onChange={setMappings}
              />
            ) : null}
          </RadioOption>
        ))}
        {store.access.canManage ? (
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
      </Col>
    </Col>
  );
};

const GroupMappingTable = ({
  directoryName,
  mappings,
  onChange,
}: {
  directoryName: string;
  mappings: ProtoGroupMapping[];
  onChange: (mappings: ProtoGroupMapping[]) => void;
}) => {
  const { hierarchy } = useAccessPrototype();
  if (!hierarchy) {
    return null;
  }
  const options = [
    { value: NO_SUB_ORGANIZATION, label: 'No sub-organization' },
    ...hierarchy.subOrganizations.map(organization => ({ value: organization.id, label: organization.name })),
  ];
  const unmapped = mappings.filter(mapping => !mapping.subOrganizationId).length;

  return (
    <Col sx={t => ({ gap: t.space.$2 })}>
      <Box sx={t => ({ ...borderSx(t), width: '100%' })}>
        <Table sx={{ tableLayout: 'fixed' }}>
          <Thead>
            <Tr>
              <Th
                localizationKey={protoKey(`${directoryName} group`)}
                sx={{ width: '45%' }}
              />
              <Th localizationKey={protoKey('Sub-organization')} />
            </Tr>
          </Thead>
          <Tbody>
            {mappings.map(mapping => (
              <Tr key={mapping.group}>
                <Td>
                  <Text sx={smallSx}>{mapping.group}</Text>
                </Td>
                <Td>
                  <Select
                    elementId='role'
                    options={options}
                    value={mapping.subOrganizationId ?? NO_SUB_ORGANIZATION}
                    onChange={option =>
                      onChange(
                        mappings.map(entry =>
                          entry.group === mapping.group
                            ? {
                                ...entry,
                                subOrganizationId: option.value === NO_SUB_ORGANIZATION ? null : option.value,
                              }
                            : entry,
                        ),
                      )
                    }
                  >
                    <SelectButton sx={t => ({ color: t.colors.$colorForeground, fontSize: t.fontSizes.$sm })}>
                      <Text as='span'>
                        {options.find(option => option.value === (mapping.subOrganizationId ?? NO_SUB_ORGANIZATION))
                          ?.label ?? ''}
                      </Text>
                    </SelectButton>
                    <SelectOptionList />
                  </Select>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
      {unmapped > 0 ? (
        <WarningLine>
          {`${unmapped} ${unmapped === 1 ? 'group isn’t' : 'groups aren’t'} mapped. Its people can sign in but join no sub-organization.`}
        </WarningLine>
      ) : null}
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
