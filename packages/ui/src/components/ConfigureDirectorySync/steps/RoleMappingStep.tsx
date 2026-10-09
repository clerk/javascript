import React from 'react';

import {
  Box,
  Button,
  Col,
  descriptors,
  Flex,
  FormLabel,
  Icon,
  type LocalizationKey,
  localizationKeys,
  Spinner,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useLocalizations,
} from '@/customizables';
import { useCardState } from '@/elements/contexts';
import { Switch } from '@/elements/Switch';
import { ArrowRight, Drag, Globe } from '@/icons';
import { Alert } from '@/ui/elements/Alert';
import type { ThemableCssProp } from '@/ui/styledSystem';
import { getAPIErrorMessage, handleError } from '@/utils/errorHandler';

import { Step } from '../../ConfigureSSO/elements/Step';
import { useWizard } from '../../ConfigureSSO/elements/Wizard';
import { RoleSelect } from '../../OrganizationProfile/MemberListTable';
import { useConfigureDirectorySync } from '../ConfigureDirectorySyncContext';
import { DIRECTORY_SYNC_PROVIDERS } from '../providerMeta';
import type { UnmappedGroup } from '../roleMapping';
import { NO_ROLE_KEY } from '../roleMapping';
import { RoleSyncDialog } from '../RoleSyncDialog';

const HeaderText = ({ localizationKey }: { localizationKey: LocalizationKey }): JSX.Element => (
  <Text
    elementDescriptor={descriptors.configureDirectorySyncRoleMappingHeader}
    as='span'
    variant='subtitle'
    colorScheme='secondary'
    localizationKey={localizationKey}
    sx={{ whiteSpace: 'nowrap' }}
  />
);

const selectTriggerSx: ThemableCssProp = t => ({
  width: '100%',
  justifyContent: 'space-between',
  color: t.colors.$colorForeground,
  backgroundColor: t.colors.$colorBackground,
  textWrap: 'nowrap',
  '& span': { fontSize: t.fontSizes.$md, fontWeight: t.fontWeights.$medium },
});

const GroupCell = ({ name, localizationKey }: { name?: string; localizationKey?: LocalizationKey }): JSX.Element => (
  <Text
    elementDescriptor={descriptors.configureDirectorySyncRoleMappingGroupName}
    as='span'
    variant='subtitle'
    localizationKey={localizationKey}
  >
    {name}
  </Text>
);

const PriorityCell = ({ children }: { children?: React.ReactNode }): JSX.Element => (
  <Td sx={t => ({ width: t.sizes.$16 })}>
    <Flex
      align='center'
      sx={{ position: 'relative' }}
    >
      {children}
    </Flex>
  </Td>
);

const ArrowCell = (): JSX.Element => (
  <Td sx={t => ({ width: t.sizes.$8, paddingInline: 0, textAlign: 'center' })}>
    <Icon
      icon={ArrowRight}
      size='md'
      colorScheme='neutral'
    />
  </Td>
);

const RoleCell = ({ children }: { children: React.ReactNode }): JSX.Element => (
  <Td sx={t => ({ width: '42%', paddingInlineStart: t.space.$2 })}>{children}</Td>
);

const useGroupRoleOptions = () => {
  const { roleMapping } = useConfigureDirectorySync();
  const { t } = useLocalizations();
  const unassignedLabel = t(localizationKeys('configureDirectorySync.roleMappingStep.roleOption__unassigned'));
  return React.useMemo(
    () => [
      { value: NO_ROLE_KEY, label: unassignedLabel },
      ...[...roleMapping.roles].sort((a, b) => a.label.localeCompare(b.label)),
    ],
    [roleMapping.roles, unassignedLabel],
  );
};

type MappedRowProps = {
  index: number;
  count: number;
  group: UnmappedGroup;
  roleKey: string;
  isDragging: boolean;
  isDropTarget: boolean;
  onDragStart: (index: number) => void;
  onDragOver: (index: number) => void;
  onDrop: (index: number) => void;
  onDragEnd: () => void;
};

const MappedRow = ({
  index,
  count,
  group,
  roleKey,
  isDragging,
  isDropTarget,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}: MappedRowProps): JSX.Element => {
  const { roleMapping } = useConfigureDirectorySync();
  const roleOptions = useGroupRoleOptions();
  const { t } = useLocalizations();
  const isReadOnly = roleMapping.readOnlyReason !== null;

  const onHandleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp' && index > 0) {
      e.preventDefault();
      roleMapping.move(index, index - 1);
    } else if (e.key === 'ArrowDown' && index < count - 1) {
      e.preventDefault();
      roleMapping.move(index, index + 1);
    }
  };

  return (
    <Tr
      elementDescriptor={descriptors.configureDirectorySyncRoleMappingRow}
      data-testid={`role-mapping-row-${group.id}`}
      onDragOver={e => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        onDragOver(index);
      }}
      onDrop={e => {
        e.preventDefault();
        onDrop(index);
      }}
      sx={t => ({
        opacity: isDragging ? 0.4 : 1,
        boxShadow: isDropTarget ? `inset 0 2px 0 0 ${t.colors.$primary500}` : 'none',
        transition: 'opacity 120ms',
      })}
    >
      <PriorityCell>
        <Button
          elementDescriptor={descriptors.configureDirectorySyncRoleMappingReorderButton}
          variant='ghost'
          colorScheme='neutral'
          size='xs'
          aria-label={t(
            localizationKeys('configureDirectorySync.roleMappingStep.actionLabel__reorder', { group: group.name }),
          )}
          title={t(localizationKeys('configureDirectorySync.roleMappingStep.actionHint__reorder'))}
          isDisabled={isReadOnly}
          draggable={!isReadOnly}
          onDragStart={e => {
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', String(index));
            const row = e.currentTarget.closest('tr');
            if (row) {
              e.dataTransfer.setDragImage(row, 0, 0);
            }
            onDragStart(index);
          }}
          onDragEnd={onDragEnd}
          onKeyDown={onHandleKeyDown}
          sx={t => ({
            position: 'absolute',
            insetInlineEnd: '100%',
            marginInlineEnd: t.space.$1x5,
            cursor: isReadOnly ? 'default' : 'grab',
            paddingInline: t.space.$1,
            minHeight: 0,
            color: t.colors.$neutralAlpha300,
          })}
        >
          <Icon icon={Drag} />
        </Button>
        <Text
          elementDescriptor={descriptors.configureDirectorySyncRoleMappingPriority}
          as='span'
          sx={t => ({ fontSize: t.fontSizes.$md, fontVariantNumeric: 'tabular-nums' })}
        >
          {index + 1}
        </Text>
      </PriorityCell>
      <Td>
        <GroupCell name={group.name} />
      </Td>
      <ArrowCell />
      <RoleCell>
        <RoleSelect
          roles={roleOptions}
          showDescriptions
          value={roleKey}
          onChange={key => roleMapping.setRole(group, key)}
          isDisabled={isReadOnly}
          triggerSx={selectTriggerSx}
        />
      </RoleCell>
    </Tr>
  );
};

const UnmappedRow = ({ group }: { group: UnmappedGroup }): JSX.Element => {
  const { roleMapping } = useConfigureDirectorySync();
  const roleOptions = useGroupRoleOptions();

  return (
    <Tr
      elementDescriptor={descriptors.configureDirectorySyncRoleMappingRow}
      data-testid={`role-mapping-row-${group.id}`}
    >
      <PriorityCell />
      <Td>
        <GroupCell name={group.name} />
      </Td>
      <ArrowCell />
      <RoleCell>
        <RoleSelect
          roles={roleOptions}
          showDescriptions
          value={NO_ROLE_KEY}
          onChange={key => roleMapping.setRole(group, key)}
          isDisabled={roleMapping.readOnlyReason !== null}
          triggerSx={selectTriggerSx}
        />
      </RoleCell>
    </Tr>
  );
};

const EveryoneElseRow = (): JSX.Element => {
  const { roleMapping } = useConfigureDirectorySync();
  const { defaultRole } = roleMapping;

  return (
    <Tr
      elementDescriptor={descriptors.configureDirectorySyncRoleMappingRow}
      data-testid='role-mapping-row-everyone'
      sx={t => ({ backgroundColor: t.colors.$neutralAlpha25 })}
    >
      <PriorityCell>
        <Icon
          icon={Globe}
          colorScheme='neutral'
          aria-hidden
        />
      </PriorityCell>
      <Td>
        <GroupCell localizationKey={localizationKeys('configureDirectorySync.roleMappingStep.everyoneElse')} />
      </Td>
      <ArrowCell />
      <RoleCell>
        <RoleSelect
          roles={defaultRole ? [defaultRole] : []}
          value={defaultRole?.value ?? ''}
          fallbackLabel={defaultRole?.label}
          onChange={() => {}}
          isDisabled
          triggerSx={selectTriggerSx}
        />
      </RoleCell>
    </Tr>
  );
};

const MappingTable = (): JSX.Element => {
  const { roleMapping } = useConfigureDirectorySync();
  const { mappings, unmappedGroups } = roleMapping;

  const [dragIndex, setDragIndex] = React.useState<number | null>(null);
  const [overIndex, setOverIndex] = React.useState<number | null>(null);

  const endDrag = () => {
    setDragIndex(null);
    setOverIndex(null);
  };

  return (
    <Box
      sx={t => ({
        flex: '0 1 auto',
        minHeight: 0,
        overflowY: 'auto',
        borderWidth: t.borderWidths.$normal,
        borderStyle: t.borderStyles.$solid,
        borderColor: t.colors.$borderAlpha150,
        borderRadius: t.radii.$lg,
      })}
    >
      <Table
        elementDescriptor={descriptors.configureDirectorySyncRoleMappingTable}
        sx={t => ({
          borderWidth: 0,
          borderRadius: 0,
          'thead th': {
            position: 'sticky',
            top: 0,
            zIndex: 1,
            backgroundColor: t.colors.$colorBackground,
            boxShadow: `inset 0 -1px 0 0 ${t.colors.$borderAlpha150}`,
          },
          'thead::after': { display: 'none' },
          tbody: { borderTopWidth: 0 },
          'tbody > tr:first-of-type > td': { borderTopWidth: 0 },
          'tr > th': { paddingBlock: t.space.$3, paddingInline: t.space.$4 },
          'tr > th:first-of-type': { paddingInlineStart: t.space.$8 },
          'tr > td': { paddingBlock: t.space.$3, verticalAlign: 'middle' },
          'tr > td:first-of-type': { paddingInlineStart: t.space.$8, paddingInlineEnd: 0 },
        })}
      >
        <Thead>
          <Tr>
            <Th>
              <HeaderText
                localizationKey={localizationKeys('configureDirectorySync.roleMappingStep.columns.priority')}
              />
            </Th>
            <Th>
              <HeaderText
                localizationKey={localizationKeys('configureDirectorySync.roleMappingStep.columns.directoryGroup')}
              />
            </Th>
            <Th />
            <Th>
              <HeaderText localizationKey={localizationKeys('configureDirectorySync.roleMappingStep.columns.role')} />
            </Th>
          </Tr>
        </Thead>
        <Tbody>
          {mappings.map((mapping, index) => (
            <MappedRow
              key={mapping.groupId}
              index={index}
              count={mappings.length}
              group={{ id: mapping.groupId, name: mapping.groupName }}
              roleKey={mapping.roleKey}
              isDragging={dragIndex === index}
              isDropTarget={overIndex === index && dragIndex !== null && dragIndex !== index}
              onDragStart={setDragIndex}
              onDragOver={setOverIndex}
              onDrop={to => {
                if (dragIndex !== null) {
                  roleMapping.move(dragIndex, to);
                }
                endDrag();
              }}
              onDragEnd={endDrag}
            />
          ))}
          {unmappedGroups.map(group => (
            <UnmappedRow
              key={group.id}
              group={group}
            />
          ))}
          <EveryoneElseRow />
        </Tbody>
      </Table>
    </Box>
  );
};

const EmptyGroups = (): JSX.Element => {
  const { providerMeta } = useConfigureDirectorySync();
  const { t } = useLocalizations();
  const providerName = t((providerMeta ?? DIRECTORY_SYNC_PROVIDERS.custom).name);

  return (
    <Col
      elementDescriptor={descriptors.configureDirectorySyncRoleMappingEmpty}
      align='center'
      sx={t => ({
        gap: t.space.$1,
        padding: t.space.$8,
        borderRadius: t.radii.$md,
        borderWidth: t.borderWidths.$normal,
        borderStyle: 'dashed',
        borderColor: t.colors.$borderAlpha150,
        textAlign: 'center',
      })}
    >
      <Text
        as='span'
        sx={t => ({ fontSize: t.fontSizes.$sm, fontWeight: t.fontWeights.$medium })}
        localizationKey={localizationKeys('configureDirectorySync.roleMappingStep.empty__noGroups.title')}
      />
      <Text
        as='span'
        colorScheme='secondary'
        sx={t => ({ fontSize: t.fontSizes.$sm })}
        localizationKey={localizationKeys('configureDirectorySync.roleMappingStep.empty__noGroups.subtitle', {
          provider: providerName,
        })}
      />
    </Col>
  );
};

const RoleMappingContent = (): JSX.Element => {
  const { roleMapping } = useConfigureDirectorySync();
  const { isLoading, error, mappings, unmappedGroups } = roleMapping;

  if (isLoading) {
    return (
      <Flex
        justify='center'
        sx={t => ({ padding: t.space.$8 })}
      >
        <Spinner
          size='sm'
          colorScheme='neutral'
        />
      </Flex>
    );
  }

  if (error) {
    return (
      <Alert
        variant='danger'
        title={localizationKeys('configureDirectorySync.roleMappingStep.error__loadMappings')}
        subtitle={getAPIErrorMessage(error)}
      />
    );
  }

  return mappings.length === 0 && unmappedGroups.length === 0 ? <EmptyGroups /> : <MappingTable />;
};

export const RoleMappingStep = (): JSX.Element => {
  const { goPrev } = useWizard();
  const { roleMapping, contentRef, onExit } = useConfigureDirectorySync();
  const card = useCardState();
  const [pendingAction, setPendingAction] = React.useState<'enable' | 'disable' | null>(null);

  const complete = async () => {
    if (card.isLoading) {
      return;
    }
    card.setError(undefined);
    card.setLoading();
    try {
      await roleMapping.save();
      onExit?.();
    } catch (err) {
      handleError(err as Error, [], card.setError);
    } finally {
      card.setIdle();
    }
  };

  return (
    <>
      <Step.Header
        title={localizationKeys('configureDirectorySync.roleMappingStep.title')}
        description={localizationKeys('configureDirectorySync.roleMappingStep.subtitle')}
      >
        <Flex
          elementDescriptor={descriptors.configureDirectorySyncRoleMappingToggle}
          align='center'
          sx={t => ({ flexShrink: 0, height: `calc(${t.fontSizes.$lg} * ${t.lineHeights.$medium})` })}
        >
          <FormLabel
            htmlFor='role-mapping-enabled'
            localizationKey={localizationKeys('configureDirectorySync.roleMappingStep.formFieldLabel__syncRoles')}
            sx={t => ({
              color: t.colors.$colorMutedForeground,
              paddingInlineEnd: t.sizes.$2,
              cursor: roleMapping.readOnlyReason !== null ? 'not-allowed' : 'pointer',
              userSelect: 'none',
            })}
          />
          <Switch
            id='role-mapping-enabled'
            isChecked={roleMapping.enabled}
            isDisabled={roleMapping.readOnlyReason !== null}
            onChange={enabled => setPendingAction(enabled ? 'enable' : 'disable')}
          />
        </Flex>
      </Step.Header>

      <RoleSyncDialog
        action={pendingAction ?? 'enable'}
        isOpen={pendingAction !== null}
        onClose={() => setPendingAction(null)}
        onConfirm={() => roleMapping.setEnabled(pendingAction === 'enable')}
        contentRef={contentRef}
      />

      <Step.Body>
        <Step.Section
          fill
          sx={t => ({ gap: t.space.$4, minHeight: 0 })}
        >
          {card.error && (
            <Alert
              variant='danger'
              title={card.error}
            />
          )}
          {roleMapping.readOnlyReason === 'missingPermission' && (
            <Alert
              variant='warning'
              title={localizationKeys(
                'configureDirectorySync.roleMappingStep.alert__missingManageMembersPermission.title',
              )}
              subtitle={localizationKeys(
                'configureDirectorySync.roleMappingStep.alert__missingManageMembersPermission.subtitle',
              )}
            />
          )}
          {roleMapping.readOnlyReason === 'roleSetMigration' && (
            <Alert
              variant='warning'
              title={localizationKeys('organizationProfile.membersPage.alerts.roleSetMigrationInProgress.title')}
              subtitle={localizationKeys('organizationProfile.membersPage.alerts.roleSetMigrationInProgress.subtitle')}
            />
          )}
          <RoleMappingContent />
        </Step.Section>
      </Step.Body>

      <Step.Footer>
        <Step.Footer.Previous onClick={() => goPrev()} />
        <Button
          elementDescriptor={descriptors.configureDirectorySyncCompleteButton}
          variant='solid'
          size='sm'
          isLoading={card.isLoading}
          isDisabled={roleMapping.isLoading}
          onClick={() => void complete()}
          localizationKey={localizationKeys('configureDirectorySync.testStep.actionLabel__complete')}
        />
      </Step.Footer>
    </>
  );
};
