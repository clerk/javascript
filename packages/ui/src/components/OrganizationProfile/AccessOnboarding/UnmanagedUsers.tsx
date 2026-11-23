import { useState } from 'react';

import { Select, SelectButton, SelectOptionList } from '@/ui/elements/Select';
import { ThreeDotsMenu } from '@/ui/elements/ThreeDotsMenu';

import {
  Badge,
  Box,
  Button,
  CheckboxInput,
  Col,
  Flex,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from '../../../customizables';
import type { PropsOfComponent } from '../../../styledSystem';
import { LinkNote } from './Membership';
import { useAccessNavigation } from './navigation';
import { borderSx, smallSx, TipBadge, WarningLine } from './parts';
import type {
  ProtoOutsideOrganization,
  ProtoOutsidePerson,
  ProtoSubOrganization,
  ProtoUserPlan,
} from './prototypeState';
import {
  addDays,
  CHANGE_NOTICE_DAYS,
  formatDate,
  joinList,
  joinsRightAway,
  outsideOfParent,
  plural,
  protoKey,
  simulateRequest,
  useAccessPrototype,
} from './prototypeState';

type Decisions = { userPlans: Record<string, ProtoUserPlan>; userDestinations: Record<string, string> };

/** Users at a parent's proven domains who are in organizations outside it. */
export const unmanagedUsersOf = (
  state: Parameters<typeof outsideOfParent>[0] & { outsidePeople: Record<string, ProtoOutsidePerson[]> },
) => {
  const { domains, organizations } = outsideOfParent(state);
  const users = domains
    .flatMap(domain => state.outsidePeople[domain] ?? [])
    .filter(user => organizations.some(entry => entry.people.includes(user.email)));
  return { domains, organizations, users };
};

const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);
const domainOf = (email: string) => email.split('@')[1] ?? '';

/** Up to two names, then "+N". */
const shortList = (names: string[]) =>
  names.length > 2 ? `${names.slice(0, 2).join(', ')}, +${names.length - 2}` : names.join(', ');

/*
 * Prototype: a parent account's Members › Unmanaged users. Users at its
 * proven domains who are in organizations outside it, one row each, with what
 * happens to them. Inviting whole organizations lives on Access › Organizations.
 */
export const UnmanagedUsersPanel = () => {
  const store = useAccessPrototype();
  const nav = useAccessNavigation();
  const hierarchy = store.hierarchy;
  const saved: Decisions = {
    userPlans: hierarchy?.userPlans ?? {},
    userDestinations: hierarchy?.userDestinations ?? {},
  };
  const [draft, setDraft] = useState<Decisions>(saved);
  const [selected, setSelected] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [savedOn, setSavedOn] = useState<string | null>(null);
  if (!hierarchy) {
    return null;
  }

  const parent = hierarchy.parentName;
  const canManage = store.access.canManage;
  const destinations = hierarchy.subOrganizations;
  const { domains, organizations: outside, users } = unmanagedUsersOf(store);
  const invited = hierarchy.organizationPlans ?? {};
  const organizationsOf = (email: string) => outside.filter(entry => entry.people.includes(email));

  const exclusivePolicies = store.policies.filter(policy => policy.status === 'active' && policy.exclusive);
  const exclusiveDomains = new Set(exclusivePolicies.flatMap(policy => policy.domains));
  const removalDates = exclusivePolicies.map(policy => policy.removeElsewhereOn).filter(Boolean) as string[];
  const removalOn = removalDates.sort()[0];

  const destinationName = (email: string) =>
    destinations.find(entry => entry.id === draft.userDestinations[email])?.name ?? destinations[0]?.name ?? parent;
  const isUndecided = (email: string) => {
    const rest = organizationsOf(email).filter(entry => !invited[entry.id]);
    return rest.length > 0 && !draft.userPlans[email] && exclusiveDomains.has(domainOf(email));
  };
  const outcomeFor = (email: string) => {
    const theirs = organizationsOf(email);
    const names = (list: ProtoOutsideOrganization[]) => joinList(list.map(entry => entry.name));
    const added = theirs.filter(entry => invited[entry.id] && joinsRightAway(entry));
    const pending = theirs.filter(entry => invited[entry.id] && !joinsRightAway(entry));
    const rest = theirs.filter(entry => !invited[entry.id]);
    const plan = draft.userPlans[email];
    const parts = [
      added.length ? `added with ${names(added)}` : null,
      pending.length
        ? `joins with ${names(pending)} if ${pending.length === 1 ? 'its owner accepts' : 'their owners accept'}`
        : null,
      rest.length && plan === 'migrate' ? `migrates to ${destinationName(email)} from ${names(rest)}` : null,
      rest.length && (plan === 'remove' || (!plan && exclusiveDomains.has(domainOf(email))))
        ? `loses access to ${names(rest)}`
        : null,
    ].filter(Boolean) as string[];
    return parts.length ? capitalize(parts.join('; ')) : 'No change';
  };

  const decide = (emails: string[], plan: ProtoUserPlan | null, destinationId?: string) => {
    const userPlans = { ...draft.userPlans };
    const userDestinations = { ...draft.userDestinations };
    emails.forEach(email => {
      delete userDestinations[email];
      if (plan === null) {
        delete userPlans[email];
      } else {
        userPlans[email] = plan;
        if (plan === 'migrate' && destinationId) {
          userDestinations[email] = destinationId;
        }
      }
    });
    setDraft({ userPlans, userDestinations });
    setSelected([]);
    setSavedOn(null);
  };

  const changed = [...new Set([...Object.keys(draft.userPlans), ...Object.keys(saved.userPlans)])].filter(
    email =>
      draft.userPlans[email] !== saved.userPlans[email] ||
      draft.userDestinations[email] !== saved.userDestinations[email],
  );
  const migrating = changed.filter(email => draft.userPlans[email] === 'migrate').length;
  const removing = changed.filter(email => draft.userPlans[email] === 'remove').length;
  const clearing = changed.filter(email => !draft.userPlans[email]).length;
  const isDirty = changed.length > 0;
  const summary = [
    migrating ? `migrates ${plural(migrating, 'user')}` : null,
    removing ? (migrating ? `removes ${removing}` : `removes ${plural(removing, 'user')}`) : null,
  ].filter(Boolean) as string[];
  const summaryText = summary.length
    ? capitalize(summary.join(' and '))
    : clearing
      ? `Clears ${plural(clearing, 'decision')}`
      : null;

  const save = () => {
    setIsSaving(true);
    void simulateRequest().then(() => {
      store.updateHierarchy({ userPlans: draft.userPlans, userDestinations: draft.userDestinations });
      setIsSaving(false);
      setSavedOn(addDays(new Date(), CHANGE_NOTICE_DAYS));
    });
  };

  const notInvited = outside.filter(entry => !invited[entry.id]).length;
  const allSelected = users.length > 0 && selected.length === users.length;
  const toggle = (email: string) =>
    setSelected(selected.includes(email) ? selected.filter(entry => entry !== email) : [...selected, email]);

  const header = (
    <Col sx={t => ({ gap: t.space.$0x5 })}>
      <Text variant='subtitle'>Unmanaged users</Text>
      <Text
        colorScheme='secondary'
        sx={smallSx}
      >
        {`Users at your domains who are in organizations outside ${parent}.`}
      </Text>
    </Col>
  );

  if (domains.length === 0 || users.length === 0) {
    return (
      <Col sx={t => ({ gap: t.space.$3, width: '100%', paddingTop: t.space.$4 })}>
        {header}
        <Text
          colorScheme='secondary'
          sx={smallSx}
        >
          {domains.length === 0
            ? `Verify a domain to see who’s outside ${parent}.`
            : `Everyone at your domains is in ${parent}.`}
        </Text>
      </Col>
    );
  }

  return (
    <Col sx={t => ({ gap: t.space.$4, width: '100%', paddingTop: t.space.$4 })}>
      {header}
      {users.some(user => isUndecided(user.email)) ? (
        <WarningLine>
          {`Undecided users lose access to those organizations ${
            removalOn ? `on ${formatDate(removalOn)}` : `${CHANGE_NOTICE_DAYS} days after you save`
          }.`}
        </WarningLine>
      ) : null}

      <Col sx={t => ({ gap: t.space.$3 })}>
        {selected.length > 0 ? (
          <BulkBar
            count={selected.length}
            destinations={destinations}
            onMigrate={destinationId => decide(selected, 'migrate', destinationId)}
            onRemove={() => decide(selected, 'remove')}
            onCancel={() => setSelected([])}
          />
        ) : null}
        <Box sx={t => ({ ...borderSx(t), overflowX: 'auto', width: '100%' })}>
          <Table sx={{ tableLayout: 'fixed' }}>
            <Thead>
              <Tr>
                {canManage ? (
                  <Th sx={{ width: '2.75rem' }}>
                    <CheckboxInput
                      aria-label='Select all unmanaged users'
                      checked={allSelected}
                      onChange={() => setSelected(allSelected ? [] : users.map(user => user.email))}
                      focusRing={false}
                    />
                  </Th>
                ) : null}
                <Th
                  localizationKey={protoKey('User')}
                  sx={{ width: '34%' }}
                />
                <Th
                  localizationKey={protoKey('In')}
                  sx={{ width: '24%' }}
                />
                <Th localizationKey={protoKey('What happens')} />
                {canManage ? <Th sx={{ width: '3rem' }} /> : null}
              </Tr>
            </Thead>
            <Tbody>
              {users.map(user => {
                const theirs = organizationsOf(user.email);
                const plan = draft.userPlans[user.email];
                const actions: PropsOfComponent<typeof ThreeDotsMenu>['actions'] = [
                  ...destinations.map(destination => ({
                    label: protoKey(`Migrate to ${destination.name}`),
                    onClick: () => decide([user.email], 'migrate', destination.id),
                  })),
                  { label: protoKey('Remove'), isDestructive: true, onClick: () => decide([user.email], 'remove') },
                  ...(plan ? [{ label: protoKey('Reset'), onClick: () => decide([user.email], null) }] : []),
                ];
                return (
                  <Tr key={user.email}>
                    {canManage ? (
                      <Td>
                        <CheckboxInput
                          aria-label={`Select ${user.email}`}
                          checked={selected.includes(user.email)}
                          onChange={() => toggle(user.email)}
                          focusRing={false}
                        />
                      </Td>
                    ) : null}
                    <Td>
                      <Flex
                        align='center'
                        gap={2}
                        sx={{ minWidth: 0 }}
                      >
                        <Text
                          sx={smallSx}
                          truncate
                        >
                          {user.email}
                        </Text>
                        {user.inactive ? <Badge colorScheme='primary'>Inactive</Badge> : null}
                      </Flex>
                    </Td>
                    <Td>
                      <Text
                        sx={smallSx}
                        truncate
                      >
                        {shortList(theirs.map(entry => entry.name))}
                      </Text>
                    </Td>
                    <Td>
                      <Flex
                        align='center'
                        gap={2}
                        wrap='wrap'
                      >
                        <Text sx={smallSx}>{outcomeFor(user.email)}</Text>
                        {isUndecided(user.email) ? (
                          <TipBadge
                            colorScheme='warning'
                            tip='No decision yet. They lose access when the change starts.'
                          >
                            Undecided
                          </TipBadge>
                        ) : null}
                      </Flex>
                    </Td>
                    {canManage ? (
                      <Td>
                        <ThreeDotsMenu actions={actions} />
                      </Td>
                    ) : null}
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        </Box>
        {canManage && notInvited > 0 ? (
          <LinkNote
            text={`${notInvited} of their organizations could join instead. `}
            link='Review on Organizations'
            onClick={nav.toSubOrganizations}
          />
        ) : null}
      </Col>

      {canManage ? (
        <Flex
          justify='between'
          align='center'
          gap={4}
          sx={t => ({ ...borderSx(t), padding: t.space.$4 })}
        >
          <Text
            sx={smallSx}
            colorScheme={isDirty || savedOn ? undefined : 'secondary'}
          >
            {savedOn && !isDirty
              ? `Saved. Affected users get an email, and changes start ${formatDate(savedOn)}.`
              : summaryText
                ? `${summaryText}. Changes start ${CHANGE_NOTICE_DAYS} days after you save.`
                : 'Nothing changes for these users.'}
          </Text>
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
  );
};

/** Above the table while users are selected: migrate or remove them all at once. */
const BulkBar = ({
  count,
  destinations,
  onMigrate,
  onRemove,
  onCancel,
}: {
  count: number;
  destinations: ProtoSubOrganization[];
  onMigrate: (destinationId: string) => void;
  onRemove: () => void;
  onCancel: () => void;
}) => {
  const [destinationId, setDestinationId] = useState(destinations[0]?.id ?? '');
  const destination = destinations.find(entry => entry.id === destinationId) ?? destinations[0];
  return (
    <Flex
      align='center'
      justify='between'
      gap={3}
      wrap='wrap'
      sx={t => ({ ...borderSx(t), padding: t.space.$3, backgroundColor: t.colors.$neutralAlpha25 })}
    >
      <Flex
        align='center'
        gap={3}
        wrap='wrap'
      >
        <Text sx={smallSx}>{`${count} selected`}</Text>
        {destinations.length > 1 ? (
          <Flex
            align='center'
            gap={2}
          >
            <Text sx={smallSx}>Migrate to</Text>
            <Select
              elementId='role'
              options={destinations.map(entry => ({ value: entry.id, label: entry.name }))}
              value={destination?.id ?? ''}
              onChange={option => setDestinationId(option.value)}
            >
              <SelectButton sx={t => ({ color: t.colors.$colorForeground, fontSize: t.fontSizes.$sm })}>
                <Text as='span'>{destination?.name ?? ''}</Text>
              </SelectButton>
              <SelectOptionList />
            </Select>
          </Flex>
        ) : null}
      </Flex>
      <Flex
        gap={2}
        wrap='wrap'
      >
        <Button
          size='xs'
          textVariant='buttonSmall'
          block={false}
          onClick={() => destination && onMigrate(destination.id)}
          localizationKey={protoKey('Migrate')}
        />
        <Button
          variant='outline'
          size='xs'
          textVariant='buttonSmall'
          block={false}
          onClick={onRemove}
          localizationKey={protoKey('Remove')}
        />
        <Button
          variant='ghost'
          size='xs'
          textVariant='buttonSmall'
          block={false}
          onClick={onCancel}
          localizationKey={protoKey('Cancel')}
        />
      </Flex>
    </Flex>
  );
};
