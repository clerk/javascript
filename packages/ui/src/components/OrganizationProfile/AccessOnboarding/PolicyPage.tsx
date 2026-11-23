import { useEffect, useState } from 'react';

import { ProfileCard } from '@/ui/elements/ProfileCard';
import { Select, SelectButton, SelectOptionList } from '@/ui/elements/Select';
import { Switch } from '@/ui/elements/Switch';

import { Button, Col, descriptors, Flex, Icon, Text } from '../../../customizables';
import { CheckmarkCircle, Cog, Plus, Trash } from '../../../icons';
import { DomainConflict } from './DomainConflict';
import { DomainEntry } from './DomainProof';
import { LinkNote, MembershipControl, MoveToEnterprise, Note, OrganizationsBox, RemovalConfirm } from './Membership';
import { useAccessNavigation } from './navigation';
import {
  BackTitle,
  borderSx,
  PageFooter,
  RadioOption,
  SettingRow,
  smallSx,
  SubPageHeader,
  TextInput,
  WarningLine,
  xsSx,
} from './parts';
import type {
  PolicyDraft,
  ProtoConnection,
  ProtoEnrollment,
  ProtoMfa,
  ProtoNonDirectoryFallback,
  ProtoPolicyStatus,
} from './prototypeState';
import {
  activationBlocker,
  addDays,
  APP_REVERIFICATION_HOURS,
  CHANGE_NOTICE_DAYS,
  DOMAIN_PATTERN,
  draftFromPolicy,
  ENROLLMENT_LABELS,
  formatDate,
  formatReverification,
  isProven,
  joinList,
  knownProof,
  landingSummary,
  needsOwnership,
  newDraft,
  NON_DIRECTORY_FALLBACK_LABELS,
  ownDomainOwner,
  PARENT_DOMAINS,
  peopleElsewhereAt,
  plural,
  protoKey,
  REVERIFICATION_OPTIONS,
  simulateRequest,
  useAccessPrototype,
} from './prototypeState';
import { ProviderIcon } from './ProviderMark';

/*
 * Add policy / Manage policy, built to the Oct 2026 "MVP" Figma: Target,
 * Multi-factor authentication, Authentication, Re-verification and
 * Enrollment as one form. The form lives in the store (`draft`) so the SSO
 * and Directory Sync setup pages can add a connection and hand back.
 */
export const PolicyPage = ({ policyId }: { policyId: string }) => {
  const store = useAccessPrototype();
  const policy = store.policies.find(entry => entry.id === policyId);
  const isFresh = store.draft?.policyId === policyId;

  // A draft for another policy (or none) means this visit starts over.
  useEffect(() => {
    if (!isFresh && (policyId === 'new' || policy)) {
      store.setDraft(policy ? draftFromPolicy(policy) : newDraft(store));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [policyId, isFresh]);

  if (policy?.isCatchAll) {
    return <DefaultPolicyPage policyId={policy.id} />;
  }
  if (!store.draft || !isFresh) {
    return null;
  }
  return <PolicyForm draft={store.draft} />;
};

const PolicyForm = ({ draft }: { draft: PolicyDraft }) => {
  const store = useAccessPrototype();
  const nav = useAccessNavigation();
  const { access, connections, policies } = store;
  const saved = policies.find(entry => entry.id === draft.policyId);
  const [domainInput, setDomainInput] = useState('');
  const [domainError, setDomainError] = useState<string | null>(null);
  const [conflict, setConflict] = useState<string | null>(() =>
    draft.policyId === 'new' && draft.domains.length === 0 ? (ownDomainOwner(store)?.id ?? null) : null,
  );
  const [saving, setSaving] = useState<ProtoPolicyStatus | null>(null);
  const canManage = access.canManage;

  const set = (patch: Partial<PolicyDraft>) => store.setDraft(previous => ({ ...previous, ...patch }));
  const leave = () => {
    store.setDraft(null);
    nav.toPolicies();
  };

  const isNew = draft.policyId === 'new';
  const isDraft = isNew || saved?.status === 'draft';
  const isDirty = !saved || JSON.stringify(draftFromPolicy(saved)) !== JSON.stringify(draft);
  const ownershipNeeded = needsOwnership(draft);
  const hierarchy = store.hierarchy;
  const unowned = draft.domains.filter(domain => draft.proofs[domain]?.ownership !== 'verified');
  // Choosing "Only in" removes people from their other organizations; a parent decides that in Members › Unmanaged users.
  const removing =
    draft.exclusive && hierarchy?.role !== 'parent' && unowned.length === 0
      ? peopleElsewhereAt(draft.domains, store.outsidePeople).people.length
      : 0;
  // Said on the Only in option either way, so the choice carries its consequence.
  const leaving =
    draft.domains.length > 0 && unowned.length === 0 && hierarchy?.role !== 'parent'
      ? peopleElsewhereAt(draft.domains, store.outsidePeople).people.length
      : 0;
  const confirmsRemoval = removing > 0 && !(saved?.exclusive && saved.removeElsewhereOn);
  const [confirming, setConfirming] = useState<ProtoPolicyStatus | null>(null);
  // Proven domains with people in other organizations unlock a third Membership option: a parent account.
  const organizationsElsewhere =
    draft.domains.length > 0 && unowned.length === 0 && !hierarchy && canManage
      ? peopleElsewhereAt(draft.domains, store.outsidePeople).organizations.length
      : 0;
  const [parentSelected, setParentSelected] = useState(false);
  const choosingParent = parentSelected && organizationsElsewhere > 0;
  const [isMovingToParent, setIsMovingToParent] = useState(false);
  // Like SSO without a connection: the third Membership option holds the policy until its parent account exists.
  const blocker = activationBlocker(draft, false) ?? (choosingParent ? 'Create the parent account' : null);
  const commit = (status: ProtoPolicyStatus) =>
    confirmsRemoval && status === 'active' ? setConfirming(status) : save(status);

  const addDomain = () => {
    const domain = domainInput.trim().toLowerCase();
    if (!DOMAIN_PATTERN.test(domain)) {
      setDomainError('Enter a domain like example.com');
      return;
    }
    if (hierarchy?.role === 'child' && PARENT_DOMAINS.includes(domain)) {
      setDomainError(`${hierarchy.parentName} manages this domain`);
      return;
    }
    const owner = store.relatedOrganizations.find(entry => entry.domain === domain && entry.ownsDomain);
    if (owner) {
      setConflict(owner.id);
      return;
    }
    const taken = policies.some(entry => entry.id !== draft.policyId && entry.domains.includes(domain));
    if (taken || draft.domains.includes(domain)) {
      setDomainError('Another policy already targets this domain');
      return;
    }
    set({
      domains: [...draft.domains, domain],
      proofs: { ...draft.proofs, [domain]: draft.proofs[domain] ?? knownProof(store, domain) },
    });
    setDomainInput('');
    setDomainError(null);
  };

  // Who a rule reaches shows on the page itself, before and after saving; saving only asks before it removes people.
  const save = (status: ProtoPolicyStatus) => {
    setSaving(status);
    void simulateRequest().then(() => {
      store.saveDraft(
        {
          ...draft,
          removeElsewhereOn:
            removing > 0 && status === 'active'
              ? (draft.removeElsewhereOn ?? addDays(new Date(), CHANGE_NOTICE_DAYS))
              : undefined,
        },
        status,
      );
      setSaving(null);
      nav.toPolicies();
    });
  };

  const ssoConnections = connections.filter(connection => connection.kind === 'sso');
  const directories = connections.filter(connection => connection.kind === 'directory');

  return (
    <ProfileCard.Page sx={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      <Col
        elementDescriptor={descriptors.page}
        sx={{ flex: 1 }}
      >
        <BackTitle
          title={isNew ? 'Add policy' : 'Manage policy'}
          onBack={leave}
        />

        {store.policyNotice ? (
          <Flex
            align='center'
            gap={2}
            sx={t => ({ ...borderSx(t), padding: t.space.$3 })}
          >
            <Icon
              icon={CheckmarkCircle}
              sx={t => ({ width: t.sizes.$4, height: t.sizes.$4, flexShrink: 0, color: t.colors.$success500 })}
            />
            <Text sx={smallSx}>{store.policyNotice}</Text>
          </Flex>
        ) : null}

        {!isDraft ? (
          <SettingRow label='Status'>
            <Switch
              isChecked={draft.status === 'active'}
              isDisabled={!canManage || (draft.status !== 'active' && Boolean(blocker))}
              onChange={checked => set({ status: checked ? 'active' : 'inactive' })}
              label={protoKey(draft.status === 'active' ? 'Active' : 'Inactive')}
            />
          </SettingRow>
        ) : null}

        <SettingRow
          label='Target'
          info='Members whose email address is at one of these domains get this policy.'
        >
          {canManage ? (
            <Col sx={t => ({ gap: t.space.$1 })}>
              <Flex gap={2}>
                <Col sx={{ flex: 1 }}>
                  <TextInput
                    ariaLabel='Domain'
                    value={domainInput}
                    placeholder='example.com'
                    onChange={value => {
                      setDomainInput(value);
                      setDomainError(null);
                      setConflict(null);
                    }}
                    onEnter={addDomain}
                  />
                </Col>
                <Button
                  variant='outline'
                  textVariant='buttonSmall'
                  block={false}
                  onClick={addDomain}
                  localizationKey={protoKey('Add')}
                />
              </Flex>
              {domainError ? (
                <Text
                  colorScheme='danger'
                  sx={xsSx}
                >
                  {domainError}
                </Text>
              ) : null}
              {conflict
                ? (() => {
                    const owner = store.relatedOrganizations.find(entry => entry.id === conflict);
                    return owner ? <DomainConflict organization={owner} /> : null;
                  })()
                : null}
            </Col>
          ) : null}
          {draft.domains.map(domain => {
            const proof = draft.proofs[domain] ?? knownProof(store, domain);
            return (
              <DomainEntry
                key={domain}
                domain={domain}
                proof={proof}
                ownershipNeeded={ownershipNeeded}
                compact={saved?.status === 'active' && isProven(draft, domain)}
                canManage={canManage}
                onVerified={() =>
                  store.setDraft(previous => ({
                    ...previous,
                    proofs: { ...previous.proofs, [domain]: { association: true, ownership: 'verified' } },
                  }))
                }
                onRemove={() =>
                  set({
                    domains: draft.domains.filter(entry => entry !== domain),
                    proofs: Object.fromEntries(Object.entries(draft.proofs).filter(([key]) => key !== domain)),
                  })
                }
              />
            );
          })}
        </SettingRow>

        {hierarchy?.role === 'parent' ? (
          <SettingRow
            label='Organizations'
            info='Who follows this policy’s multi-factor and re-verification rules. Everyone at these domains still signs in the same way.'
          >
            <RadioOption
              name='sub-organizations'
              checked={!draft.subOrganizationIds}
              onSelect={() => set({ subOrganizationIds: undefined })}
              isDisabled={!canManage}
              label={`All organizations in ${hierarchy.parentName}`}
              description='Includes any added later'
            />
            <RadioOption
              name='sub-organizations'
              checked={Boolean(draft.subOrganizationIds)}
              onSelect={() => set({ subOrganizationIds: draft.subOrganizationIds ?? [] })}
              isDisabled={!canManage}
              label='Only the ones I choose'
            >
              <Col sx={t => ({ gap: t.space.$2 })}>
                {hierarchy.subOrganizations.map(organization => {
                  const chosen = draft.subOrganizationIds ?? [];
                  return (
                    <Switch
                      key={organization.id}
                      isChecked={chosen.includes(organization.id)}
                      isDisabled={!canManage}
                      onChange={checked =>
                        set({
                          subOrganizationIds: checked
                            ? [...chosen, organization.id]
                            : chosen.filter(id => id !== organization.id),
                        })
                      }
                      label={protoKey(organization.name)}
                    />
                  );
                })}
              </Col>
            </RadioOption>
          </SettingRow>
        ) : null}

        <SettingRow label='Membership'>
          <MembershipControl
            value={draft.exclusive}
            onChange={exclusive => {
              setParentSelected(false);
              set({ exclusive });
            }}
            isDisabled={!canManage}
            who='Users at these domains'
            onlyDescription={
              leaving > 0
                ? `Users at these domains can’t be in other organizations. ${
                    draft.removeElsewhereOn
                      ? `Anyone already in one is removed on ${formatDate(draft.removeElsewhereOn)}.`
                      : `Anyone already in one is removed ${CHANGE_NOTICE_DAYS} days after you ${draft.status === 'active' ? 'save' : 'activate'}.`
                  }`
                : undefined
            }
            reach={
              !store.hierarchy && draft.domains.some(domain => draft.proofs[domain]?.ownership === 'verified')
                ? draft.signIn === 'sso'
                  ? 'They sign in with your SSO there.'
                  : 'Your sign-in rules apply to them there.'
                : undefined
            }
            context={
              <ElsewhereOrganizations
                draft={draft}
                isLive={!isDirty && saved?.status === 'active'}
              />
            }
            parentOption={
              organizationsElsewhere > 0
                ? {
                    description: `Manage which organizations users at these domains are in. Invite the ${plural(organizationsElsewhere, 'other organization')}, migrate these users, or remove them.`,
                    isSelected: choosingParent,
                    onSelect: () => setParentSelected(true),
                    action: (
                      <Button
                        variant='outline'
                        textVariant='buttonSmall'
                        block={false}
                        sx={{ alignSelf: 'flex-start' }}
                        onClick={() => setIsMovingToParent(true)}
                      >
                        <Icon
                          icon={Plus}
                          sx={t => ({ width: t.sizes.$3x5, height: t.sizes.$3x5, marginInlineEnd: t.space.$1 })}
                        />
                        Create parent account
                      </Button>
                    ),
                  }
                : undefined
            }
          >
            {unowned.length > 0 ? <OwnershipWarning domains={unowned} /> : null}
          </MembershipControl>
          {isMovingToParent ? (
            <MoveToEnterprise
              domains={draft.domains}
              carries='this policy'
              onCreate={name => {
                store.moveDomainToEnterprise(name, draft);
                set({ exclusive: true });
                setParentSelected(false);
              }}
              onClose={() => setIsMovingToParent(false)}
            />
          ) : null}
        </SettingRow>

        <SettingRow label='Authentication'>
          <RadioOption
            name='authentication'
            checked={draft.signIn === 'default'}
            onSelect={() => set({ signIn: 'default' })}
            isDisabled={!canManage}
            label='Default'
            description="Use the application's existing sign-in methods"
          />
          <RadioOption
            name='authentication'
            checked={draft.signIn === 'sso'}
            onSelect={() => set({ signIn: 'sso' })}
            isDisabled={!canManage || !access.ssoAllowed}
            label='Single sign-on (SSO)'
            description={
              access.ssoAllowed
                ? 'Require members to sign in with an identity provider'
                : access.ssoUnavailableMessage || 'Not available for your organization'
            }
          >
            {unowned.length > 0 ? <OwnershipWarning domains={unowned} /> : null}
            <ConnectionList
              label='Connections'
              chosen={draft.connectionIds}
              options={ssoConnections}
              canManage={canManage}
              allowMany
              addLabel='Add connection'
              onChange={connectionIds => set({ connectionIds })}
              onCreate={() => nav.toSetup('sso', draft.policyId)}
              onConfigure={id => nav.toConnection(id, draft.policyId)}
            />
          </RadioOption>
        </SettingRow>

        <SettingRow label='Multi-factor authentication'>
          <MfaControl
            value={draft.mfa}
            onChange={mfa => set({ mfa })}
            isDisabled={!canManage}
          />
          {draft.signIn === 'sso' ? (
            <Col sx={t => ({ gap: t.space.$1, paddingInlineStart: t.space.$6 })}>
              <Switch
                isChecked={draft.skipMfaForSso}
                isDisabled={!canManage}
                onChange={skipMfaForSso => set({ skipMfaForSso })}
                label={protoKey('Skip for users who sign in with SSO')}
              />
              <Text
                colorScheme='secondary'
                sx={xsSx}
              >
                {hierarchy?.role === 'parent'
                  ? `Your identity provider handles the second factor. Applies inside organizations in ${hierarchy.parentName} only.`
                  : 'Your identity provider handles the second factor. Applies inside this organization only.'}
              </Text>
            </Col>
          ) : null}
        </SettingRow>

        <SettingRow label='Re-verification'>
          <ReverificationSelect
            value={draft.reverificationHours}
            onChange={reverificationHours => set({ reverificationHours })}
          />
        </SettingRow>

        {hierarchy?.role === 'parent' ? (
          <SettingRow label='Enrollment'>
            <Text sx={smallSx}>{`Nobody joins ${hierarchy.parentName} by domain.`}</Text>
            <Text
              colorScheme='secondary'
              sx={smallSx}
            >
              Users join the parent by invitation. Whoever created it is its first member.
            </Text>
            <Text
              colorScheme='secondary'
              sx={smallSx}
            >
              {`Where users land: ${landingSummary(hierarchy)}. Change it on the Organizations tab.`}
            </Text>
          </SettingRow>
        ) : (
          <SettingRow label='Enrollment'>
            {(Object.keys(ENROLLMENT_LABELS) as ProtoEnrollment[])
              .filter(mode => mode !== 'directory_sync' || access.ssoAllowed)
              .map(mode => (
                <RadioOption
                  key={mode}
                  name='enrollment'
                  checked={draft.enrollment === mode}
                  onSelect={() => set({ enrollment: mode })}
                  isDisabled={!canManage}
                  label={ENROLLMENT_LABELS[mode].label}
                  description={ENROLLMENT_LABELS[mode].description}
                >
                  {mode === 'directory_sync' ? (
                    <Col sx={t => ({ gap: t.space.$4 })}>
                      {unowned.length > 0 ? <OwnershipWarning domains={unowned} /> : null}
                      <ConnectionList
                        label='Directory'
                        chosen={draft.directoryId ? [draft.directoryId] : []}
                        options={directories}
                        canManage={canManage}
                        addLabel='Add directory'
                        onChange={([directoryId]) => set({ directoryId })}
                        onCreate={() => nav.toSetup('directory', draft.policyId)}
                        onConfigure={id => nav.toConnection(id, draft.policyId)}
                      />
                      <Col sx={t => ({ gap: t.space.$3 })}>
                        <Text sx={smallSx}>
                          {`Users with ${draft.domains[0] ? `an @${draft.domains[0]}` : 'a matching'} email who aren’t in the directory:`}
                        </Text>
                        {(Object.keys(NON_DIRECTORY_FALLBACK_LABELS) as ProtoNonDirectoryFallback[]).map(value => (
                          <RadioOption
                            key={value}
                            name='nonDirectoryFallback'
                            checked={draft.nonDirectoryFallback === value}
                            onSelect={() => set({ nonDirectoryFallback: value })}
                            isDisabled={!canManage}
                            label={NON_DIRECTORY_FALLBACK_LABELS[value].label}
                            description={NON_DIRECTORY_FALLBACK_LABELS[value].description}
                          >
                            {value === 'error' ? (
                              <TextInput
                                ariaLabel='Contact email'
                                value={draft.contactEmail}
                                placeholder='it@example.com'
                                onChange={contactEmail => set({ contactEmail })}
                              />
                            ) : null}
                          </RadioOption>
                        ))}
                        {draft.signIn === 'sso' ? (
                          <Text
                            colorScheme='secondary'
                            sx={xsSx}
                          >
                            Only reaches users your identity provider lets sign in.
                          </Text>
                        ) : null}
                      </Col>
                    </Col>
                  ) : null}
                </RadioOption>
              ))}
          </SettingRow>
        )}
      </Col>

      {canManage ? (
        <PageFooter
          start={blocker && (isDraft || draft.status === 'active') ? <WarningLine>{blocker}</WarningLine> : null}
        >
          {isDraft ? (
            <>
              <Button
                variant='outline'
                textVariant='buttonSmall'
                block={false}
                isDisabled={draft.domains.length === 0 || saving !== null}
                isLoading={saving === 'draft'}
                onClick={() => save('draft')}
                localizationKey={protoKey('Save as draft')}
              />
              <Button
                textVariant='buttonSmall'
                block={false}
                isDisabled={Boolean(blocker) || saving !== null}
                isLoading={saving === 'active'}
                onClick={() => commit('active')}
                localizationKey={protoKey('Activate policy')}
              />
            </>
          ) : (
            <Button
              textVariant='buttonSmall'
              block={false}
              isDisabled={!isDirty || (draft.status === 'active' && Boolean(blocker)) || saving !== null}
              isLoading={saving !== null}
              onClick={() => commit(draft.status)}
              localizationKey={protoKey('Save')}
            />
          )}
        </PageFooter>
      ) : null}
      {confirming ? (
        <RemovalConfirm
          domains={draft.domains}
          count={removing}
          verb={isDraft ? 'activate' : 'save'}
          onClose={() => setConfirming(null)}
          onConfirm={() => {
            setConfirming(null);
            save(confirming);
          }}
        />
      ) : null}
    </ProfileCard.Page>
  );
};

/* ------------------------------------------------------------ controls */

/* Under the Membership choice: which other organizations people at these domains are in. */
const ElsewhereOrganizations = ({ draft, isLive }: { draft: PolicyDraft; isLive: boolean }) => {
  const store = useAccessPrototype();
  const nav = useAccessNavigation();
  const owned = draft.domains.filter(domain => draft.proofs[domain]?.ownership === 'verified');
  if (owned.length === 0) {
    return null;
  }
  const elsewhere = peopleElsewhereAt(owned, store.outsidePeople);
  if (elsewhere.organizations.length === 0) {
    return <Note>{`Nobody at ${joinList(owned)} is in another organization.`}</Note>;
  }
  const at = owned.filter(domain => peopleElsewhereAt([domain], store.outsidePeople).organizations.length > 0);
  const from = at.length === 1 ? `from ${at[0]}` : 'from these domains';
  const rows = elsewhere.organizations.map(entry => ({
    name: entry.name,
    detail: `${plural(entry.people.length, 'user', 'users')} ${from}`,
  }));

  const parent = store.hierarchy?.role === 'parent' ? store.hierarchy.parentName : null;

  return (
    <OrganizationsBox
      title={`Users at ${joinList(at)} are in ${plural(rows.length, 'other organization', 'other organizations')}`}
      rows={rows}
      footer={
        parent ? (
          // Unmanaged users reads live policies, so it follows this one once it's saved.
          isLive ? (
            <LinkNote
              text={`${parent} manages them and their users. Decide what happens to these users in Members › `}
              link='Unmanaged users'
              onClick={nav.toUnmanagedUsers}
            />
          ) : (
            <LinkNote
              text={`${parent} manages them and their users. ${draft.status === 'active' ? 'Save' : 'Activate'} this policy, then decide what happens to these users in Members › Unmanaged users.`}
            />
          )
        ) : undefined
      }
    />
  );
};

/** Under an option that needs domain ownership: what's missing. Verify sits on the domain in Target. */
const OwnershipWarning = ({ domains }: { domains: string[] }) => (
  <WarningLine>{`Verify ownership of ${joinList(domains)} in Target to use this.`}</WarningLine>
);

const MfaControl = ({
  value,
  onChange,
  isDisabled,
}: {
  value: ProtoMfa;
  onChange: (value: ProtoMfa) => void;
  isDisabled: boolean;
}) => (
  <Col sx={t => ({ gap: t.space.$3 })}>
    <RadioOption
      name='mfa'
      checked={value !== 'required'}
      onSelect={() => onChange('optional')}
      isDisabled={isDisabled}
      label='Optional'
      description='Members can choose to set up MFA'
    />
    <RadioOption
      name='mfa'
      checked={value === 'required'}
      onSelect={() => onChange('required')}
      isDisabled={isDisabled}
      label='Required'
      description='All members must set up MFA'
    />
  </Col>
);

const NEW_CONNECTION = '__new__';

/*
 * The connections a policy uses: a picker per connection with a gear to
 * manage it (and a bin when there is more than one), then Add. With none
 * chosen yet, a single "Add connection" button starts the setup.
 */
const ConnectionList = ({
  label,
  chosen,
  options,
  canManage,
  allowMany,
  addLabel,
  onChange,
  onCreate,
  onConfigure,
}: {
  label: string;
  chosen: string[];
  options: ProtoConnection[];
  canManage: boolean;
  allowMany?: boolean;
  addLabel: string;
  onChange: (ids: string[]) => void;
  onCreate: () => void;
  onConfigure: (id: string) => void;
}) => {
  const addButton = (text: string) =>
    canManage ? (
      <Button
        variant='outline'
        textVariant='buttonSmall'
        block={false}
        sx={{ alignSelf: 'flex-start' }}
        onClick={() => {
          const unused = options.find(option => !chosen.includes(option.id));
          if (unused && allowMany && chosen.length > 0) {
            onChange([...chosen, unused.id]);
          } else if (unused && chosen.length === 0) {
            onChange([unused.id]);
          } else {
            onCreate();
          }
        }}
      >
        <Icon
          icon={Plus}
          sx={t => ({ width: t.sizes.$3x5, height: t.sizes.$3x5, marginInlineEnd: t.space.$1 })}
        />
        {text}
      </Button>
    ) : null;

  if (chosen.length === 0) {
    return addButton(addLabel);
  }

  return (
    <Col sx={t => ({ gap: t.space.$2 })}>
      <Text
        variant='subtitle'
        sx={xsSx}
      >
        {label}
      </Text>
      {chosen.map((id, index) => {
        const current = options.find(option => option.id === id);
        const selectable = options.filter(option => option.id === id || !chosen.includes(option.id));
        return (
          <Flex
            key={id}
            gap={2}
            align='center'
          >
            <Col sx={{ flex: 1, minWidth: 0 }}>
              <Select
                elementId='role'
                options={[
                  ...selectable.map(option => ({ value: option.id, label: option.name })),
                  ...(canManage ? [{ value: NEW_CONNECTION, label: 'New connection…' }] : []),
                ]}
                value={id}
                onChange={option => {
                  if (option.value === NEW_CONNECTION) {
                    onCreate();
                    return;
                  }
                  onChange(chosen.map((entry, position) => (position === index ? option.value : entry)));
                }}
                renderOption={option => {
                  const connection = options.find(entry => entry.id === option.value);
                  return (
                    <Flex
                      align='center'
                      gap={2}
                      sx={t => ({ padding: `${t.space.$1x5} ${t.space.$3}`, width: '100%' })}
                    >
                      {connection ? <ProviderIcon provider={connection.provider} /> : null}
                      <Text sx={smallSx}>{option.label}</Text>
                    </Flex>
                  );
                }}
              >
                <SelectButton
                  isDisabled={!canManage}
                  sx={t => ({ color: t.colors.$colorForeground, fontSize: t.fontSizes.$sm })}
                >
                  <Flex
                    as='span'
                    align='center'
                    gap={2}
                  >
                    {current ? <ProviderIcon provider={current.provider} /> : null}
                    <Text as='span'>{current?.name ?? 'Choose a connection'}</Text>
                  </Flex>
                </SelectButton>
                <SelectOptionList />
              </Select>
            </Col>
            {canManage ? (
              <IconAction
                icon={Cog}
                label={`Manage ${current?.name ?? 'connection'}`}
                onClick={() => onConfigure(id)}
              />
            ) : null}
            {canManage && chosen.length > 1 ? (
              <IconAction
                icon={Trash}
                label={`Remove ${current?.name ?? 'connection'}`}
                onClick={() => onChange(chosen.filter(entry => entry !== id))}
              />
            ) : null}
          </Flex>
        );
      })}
      {allowMany ? addButton('Add') : null}
    </Col>
  );
};

const IconAction = ({ icon, label, onClick }: { icon: React.ComponentType; label: string; onClick: () => void }) => (
  <Button
    variant='outline'
    aria-label={label}
    onClick={onClick}
    sx={t => ({ padding: t.space.$2, width: t.sizes.$8, height: t.sizes.$8, flexShrink: 0 })}
  >
    <Icon
      icon={icon}
      sx={t => ({ width: t.sizes.$4, height: t.sizes.$4, color: t.colors.$colorMutedForeground })}
    />
  </Button>
);

const REVERIFICATION_DEFAULT = 'default';

const ReverificationSelect = ({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (value: number | null) => void;
}) => {
  const options = [
    { value: REVERIFICATION_DEFAULT, label: `${formatReverification(APP_REVERIFICATION_HOURS)} (default)` },
    ...REVERIFICATION_OPTIONS.filter(hours => hours !== APP_REVERIFICATION_HOURS).map(hours => ({
      value: String(hours),
      label: formatReverification(hours),
    })),
  ];
  const current = value === null ? REVERIFICATION_DEFAULT : String(value);
  return (
    <PlainSelect
      options={options}
      value={current}
      onChange={next => onChange(next === REVERIFICATION_DEFAULT ? null : Number(next))}
    />
  );
};

const PlainSelect = ({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}) => (
  <Select
    elementId='role'
    options={options}
    value={value}
    onChange={option => onChange(option.value)}
  >
    <SelectButton sx={t => ({ color: t.colors.$colorForeground, fontSize: t.fontSizes.$sm })}>
      <Text as='span'>{options.find(option => option.value === value)?.label}</Text>
    </SelectButton>
    <SelectOptionList />
  </Select>
);

/* ------------------------------------------------------- manage default */

/** The catch-all: who joins and how, for everyone no domain policy covers. */
const DefaultPolicyPage = ({ policyId }: { policyId: string }) => {
  const store = useAccessPrototype();
  const nav = useAccessNavigation();
  const policy = store.policies.find(entry => entry.id === policyId);
  const [mfa, setMfa] = useState<ProtoMfa>(policy?.mfa ?? 'off');
  const [reverificationHours, setReverificationHours] = useState(policy?.reverificationHours ?? null);
  const [enrollment, setEnrollment] = useState<ProtoEnrollment>(policy?.enrollment ?? 'invitation_only');
  const [exclusive, setExclusive] = useState(policy?.exclusive ?? false);
  const [isSaving, setIsSaving] = useState(false);
  if (!policy) {
    return null;
  }
  const isDirty =
    mfa !== policy.mfa ||
    reverificationHours !== policy.reverificationHours ||
    enrollment !== policy.enrollment ||
    exclusive !== (policy.exclusive ?? false);

  const save = () => {
    setIsSaving(true);
    void simulateRequest().then(() => {
      store.updatePolicy(policy.id, { mfa, reverificationHours, enrollment, exclusive });
      setIsSaving(false);
      nav.toPolicies();
    });
  };

  return (
    <ProfileCard.Page sx={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      <Col
        elementDescriptor={descriptors.page}
        sx={{ flex: 1 }}
      >
        <SubPageHeader
          backLabel='Policies'
          title='Manage default'
          onBack={nav.toPolicies}
        />
        <SettingRow label='Multi-factor authentication'>
          <MfaControl
            value={mfa}
            onChange={setMfa}
            isDisabled={!store.access.canManage}
          />
        </SettingRow>
        <SettingRow label='Re-verification'>
          <ReverificationSelect
            value={reverificationHours}
            onChange={setReverificationHours}
          />
        </SettingRow>
        <SettingRow label='Enrollment'>
          <PlainSelect
            options={(['invitation_only', 'request_access'] as const).map(mode => ({
              value: mode,
              label: ENROLLMENT_LABELS[mode].label,
            }))}
            value={enrollment}
            onChange={value => setEnrollment(value as ProtoEnrollment)}
          />
        </SettingRow>
        <SettingRow label='Membership'>
          <MembershipControl
            value={exclusive}
            onChange={setExclusive}
            isDisabled={!store.access.canManage}
            who='Members'
            onlyDescription={`Members can’t be in other organizations. Anyone already in one is removed ${CHANGE_NOTICE_DAYS} days after you save.`}
            caution='This includes contractors and guests at other email domains.'
          />
        </SettingRow>
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
