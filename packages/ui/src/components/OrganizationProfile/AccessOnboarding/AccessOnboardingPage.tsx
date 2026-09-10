import { Fragment } from 'react';

import { withCardStateProvider } from '@/ui/elements/contexts';
import { FormButtonContainer } from '@/ui/elements/FormButtons';
import { FormContainer } from '@/ui/elements/FormContainer';
import { Header } from '@/ui/elements/Header';
import { ProfileCard } from '@/ui/elements/ProfileCard';
import { ProfileSection } from '@/ui/elements/Section';
import { ThreeDotsMenu } from '@/ui/elements/ThreeDotsMenu';

import { useEnvironment } from '../../../contexts';
import { Badge, Button, Col, descriptors, Flex, Table, Tbody, Td, Text, Th, Thead, Tr } from '../../../customizables';
import { Action } from '../../../elements/Action';
import { useActionContext } from '../../../elements/Action/ActionRoot';
import { useRouter } from '../../../router';
import type { PropsOfComponent } from '../../../styledSystem';
import { AddDomainAccessForm } from './AddDomainAccessForm';
import { ManageDomainForm } from './ManageDomainForm';
import type { ProtoDomain } from './prototypeState';
import {
  AccessOnboardingProvider,
  ENROLLMENT_LABELS,
  protoKey,
  PROVIDER_LABELS,
  useAccessOnboarding,
} from './prototypeState';
import { SetUpSsoForm } from './SetUpSsoForm';

/*
 * Prototype: the C2's merged access surface, presented as the same one-line
 * table the dashboard's org tab uses (Domain / Status / Enrollment /
 * Authentication) — Colin's Aug 24 direction: the C2 org profile is the
 * same surface, only the first question changes. Rows open Manage; the
 * three-dots menu carries the rest.
 */
export const AccessOnboardingPage = () => (
  <AccessOnboardingProvider>
    <ProfileCard.Page>
      <Col
        elementDescriptor={descriptors.page}
        sx={t => ({ gap: t.space.$8 })}
      >
        <Col
          elementDescriptor={descriptors.profilePage}
          elementId={descriptors.profilePage.setId('organizationGeneral')}
        >
          <Header.Root>
            <Header.Title
              localizationKey={protoKey('Access & onboarding')}
              textVariant='h2'
            />
            <Header.Subtitle localizationKey={protoKey('Prototype — changes are local and do not save.')} />
          </Header.Root>
          <DomainRulesSection />
        </Col>
      </Col>
    </ProfileCard.Page>
  </AccessOnboardingProvider>
);

const DomainRulesSection = () => {
  const { domains } = useAccessOnboarding();

  return (
    /*
      Not ProfileSection.Root: that layout puts the title beside the
      content, and a four-column table needs the component's full width —
      so the header stacks above instead.
    */
    <Col
      sx={t => ({
        gap: t.space.$2,
        borderTopWidth: t.borderWidths.$normal,
        borderTopStyle: t.borderStyles.$solid,
        borderTopColor: t.colors.$borderAlpha100,
        paddingTop: t.space.$4,
        paddingBottom: t.space.$4,
      })}
    >
      <Text
        variant='h3'
        localizationKey={protoKey('Domain rules')}
      />
      <Action.Root>
        {/* Action.Root is context-only, so the spacing column lives inside it. */}
        <Col sx={t => ({ gap: t.space.$4, width: '100%' })}>
          <Flex sx={t => ({ overflowX: 'auto', paddingBlock: t.space.$1, width: '100%' })}>
            <Table>
              <Thead>
                <Tr>
                  <Th localizationKey={protoKey('Domain')} />
                  <Th localizationKey={protoKey('Status')} />
                  <Th localizationKey={protoKey('Enrollment')} />
                  <Th localizationKey={protoKey('Authentication')} />
                  <Th localizationKey={protoKey('')} />
                </Tr>
              </Thead>
              <Tbody>
                {domains.length === 0 ? (
                  <Tr>
                    <Td colSpan={5}>
                      <Text
                        colorScheme='secondary'
                        sx={t => ({ fontSize: t.fontSizes.$sm })}
                      >
                        No domains yet.
                      </Text>
                    </Td>
                  </Tr>
                ) : (
                  domains.map(domain => (
                    <DomainRuleRow
                      key={domain.id}
                      domain={domain}
                    />
                  ))
                )}
              </Tbody>
            </Table>
          </Flex>

          <Action.Trigger value='add'>
            <Col>
              <ProfileSection.ArrowButton
                localizationKey={protoKey('Add domain')}
                id='organizationDomains'
              />
              <Text
                localizationKey={protoKey('Verify a domain to choose how people with that email join and sign in.')}
                sx={t => ({ paddingInlineStart: t.space.$8x5 })}
                colorScheme='secondary'
              />
            </Col>
          </Action.Trigger>

          <Action.Open value='add'>
            <Action.Card>
              <AddDomainClose />
            </Action.Card>
          </Action.Open>

          {domains.map(domain => (
            <Fragment key={domain.id}>
              <Action.Open value={`row:${domain.id}`}>
                <Action.Card>
                  <DomainSetupChecklist domain={domain} />
                </Action.Card>
              </Action.Open>
              <Action.Open value={`manage:${domain.id}`}>
                <Action.Card>
                  <ManageDomainClose domain={domain} />
                </Action.Card>
              </Action.Open>
              <Action.Open value={`sso:${domain.id}`}>
                <Action.Card>
                  <SetUpSsoClose domain={domain} />
                </Action.Card>
              </Action.Open>
            </Fragment>
          ))}
        </Col>
      </Action.Root>
    </Col>
  );
};

const AddDomainClose = () => {
  const { close } = useActionContext();
  return <AddDomainAccessForm onClose={close} />;
};

const ManageDomainClose = ({ domain }: { domain: ProtoDomain }) => {
  const { close } = useActionContext();
  return (
    <ManageDomainForm
      domain={domain}
      onClose={close}
    />
  );
};

const SetUpSsoClose = ({ domain }: { domain: ProtoDomain }) => {
  const { close } = useActionContext();
  return (
    <SetUpSsoForm
      domain={domain}
      onClose={close}
    />
  );
};

const useDomainMenuActions = (domain: ProtoDomain): PropsOfComponent<typeof ThreeDotsMenu>['actions'] => {
  const { open } = useActionContext();
  const { dispatch } = useAccessOnboarding();
  const { navigate } = useRouter();

  const actions: PropsOfComponent<typeof ThreeDotsMenu>['actions'] = [
    {
      label: protoKey('Manage access'),
      onClick: () => open(`manage:${domain.id}`),
    },
    {
      label: protoKey(domain.authentication.mode === 'sso' ? 'Manage SSO' : 'Set up SSO'),
      onClick: () =>
        void navigate(
          '../organization-security',
          // Managing lands on the overview; fresh setup jumps into the wizard.
          domain.authentication.mode === 'sso' ? undefined : { searchParams: new URLSearchParams('configure=1') },
        ),
    },
  ];

  if (domain.authentication.mode === 'sso' && domain.authentication.status === 'setting_up') {
    actions.push({
      label: protoKey('Simulate first sign-in (prototype)'),
      onClick: () => dispatch({ type: 'simulateFirstSignIn', id: domain.id }),
    });
  }

  actions.push({
    label: protoKey('Remove'),
    isDestructive: true,
    onClick: () => dispatch({ type: 'removeDomain', id: domain.id }),
  });

  return actions;
};

const DomainRuleMenu = ({ domain }: { domain: ProtoDomain }) => {
  const actions = useDomainMenuActions(domain);
  return <ThreeDotsMenu actions={actions} />;
};

const DomainRuleRow = ({ domain }: { domain: ProtoDomain }) => {
  const { open } = useActionContext();
  return (
    <Tr
      onClick={() => open(`row:${domain.id}`)}
      sx={t => ({
        cursor: 'pointer',
        '&:hover': { backgroundColor: t.colors.$neutralAlpha25 },
      })}
    >
      <Td>
        <Text variant='subtitle'>{domain.name}</Text>
      </Td>
      <Td>
        <StatusBadge domain={domain} />
      </Td>
      <Td>
        <Text
          colorScheme='secondary'
          sx={t => ({ fontSize: t.fontSizes.$sm })}
        >
          {ENROLLMENT_LABELS[domain.enrollment].label}
        </Text>
      </Td>
      <Td>
        <Text
          colorScheme='secondary'
          sx={t => ({ fontSize: t.fontSizes.$sm })}
        >
          {domain.authentication.mode === 'sso'
            ? PROVIDER_LABELS[domain.authentication.provider].label
            : 'Default sign-in'}
        </Text>
      </Td>
      <Td onClick={event => event.stopPropagation()}>
        <DomainRuleMenu domain={domain} />
      </Td>
    </Tr>
  );
};

/*
 * Rollout, not proof (dashboard parity): a rule that is not doing its job
 * yet says "Setting up"; proof detail is a look-up value that lives in
 * Manage, not a column.
 */
const StatusBadge = ({ domain }: { domain: ProtoDomain }) => {
  if (!domain.affiliationVerified) {
    return <Badge colorScheme='warning'>Unverified</Badge>;
  }
  if (domain.authentication.mode === 'sso' && domain.authentication.status === 'setting_up') {
    return <Badge colorScheme='warning'>Setting up</Badge>;
  }
  if (domain.awaitingSetup) {
    return <Badge colorScheme='warning'>Awaiting setup</Badge>;
  }
  return <Badge colorScheme='success'>Live</Badge>;
};

type ChecklistItem = {
  label: string;
  hint: string;
  state: 'done' | 'todo' | 'soon' | 'optional';
  actionLabel?: string;
  onAction?: () => void;
};

/*
 * Colin's model: the wizard captures decisions, and the row carries the
 * async work as a visible checklist — verify ownership (DNS), finish the
 * IdP handshake, connect the directory once SCIM ships. The row goes Live
 * as items complete.
 */
const DomainSetupChecklist = withCardStateProvider(({ domain }: { domain: ProtoDomain }) => {
  const { open, close } = useActionContext();
  const { displayConfig } = useEnvironment();
  const { navigate } = useRouter();
  const preApproved = domain.createdBy === 'application';
  // The real self-serve surface: the Security page's ConfigureSSO wizard,
  // opened directly rather than behind its Start configuration button.
  const goToSsoPage = () =>
    void navigate('../organization-security', { searchParams: new URLSearchParams('configure=1') });

  const items: ChecklistItem[] = [];

  // The affiliation round-trip is the C2's own proof; a pre-approved
  // domain arrives vouched by the C1, so the item does not exist for it.
  if (!preApproved) {
    items.push({
      label: 'Verify the domain',
      hint: 'Confirmed with an email at this domain.',
      state: domain.affiliationVerified ? 'done' : 'todo',
    });
  }

  /*
   * Ownership has three shapes: proven (done), waived (the C1 vouched, so
   * it is optional — provable, never blocking), and missing (to do).
   */
  items.push(
    domain.ownership === 'verified'
      ? {
          label: 'Verify domain ownership',
          hint: 'A DNS record proves you control this domain.',
          state: 'done',
        }
      : domain.ownership === 'waived'
        ? {
            label: 'Verify domain ownership',
            hint: `Pre-approved by ${displayConfig.applicationName}, so this is not required. You can still add a DNS record to prove you control the domain.`,
            state: 'optional',
            actionLabel: 'Add record',
            onAction: () => open(`sso:${domain.id}`),
          }
        : {
            label: 'Verify domain ownership',
            hint: 'Add a DNS record to prove you control the domain. Unlocks joining automatically and single sign-on.',
            state: 'todo',
            actionLabel: 'Add record',
            onAction: () => open(`sso:${domain.id}`),
          },
  );

  if (domain.authentication.mode === 'sso') {
    const providerLabel = PROVIDER_LABELS[domain.authentication.provider].label;
    const connected = domain.authentication.status === 'active';
    items.push({
      label: 'Connect single sign-on',
      hint: connected
        ? `${providerLabel} is connected and signing people in.`
        : `Paste the service provider values into ${providerLabel}.`,
      state: connected ? 'done' : 'todo',
      actionLabel: connected ? undefined : 'Open',
      onAction: connected ? undefined : goToSsoPage,
    });
  } else if (preApproved) {
    items.push({
      label: 'Set up single sign-on',
      hint: 'Choose a provider and paste the service provider values into it.',
      state: 'todo',
      actionLabel: 'Set up',
      onAction: goToSsoPage,
    });
  }

  if (domain.authentication.mode === 'sso' || preApproved) {
    items.push({
      label: 'Sync members from your directory (SCIM)',
      hint: 'Members are created and removed by the directory. Available soon.',
      state: 'soon',
    });
  }

  return (
    <FormContainer
      headerTitle={protoKey(domain.name)}
      headerSubtitle={protoKey('Everything this rule needs to be fully live.')}
    >
      <Col sx={t => ({ gap: t.space.$3 })}>
        {items.map(item => (
          <Flex
            key={item.label}
            justify='between'
            align='start'
            sx={t => ({ gap: t.space.$4 })}
          >
            <Col sx={t => ({ gap: t.space.$0x5, minWidth: 0 })}>
              <Text variant='subtitle'>{item.label}</Text>
              <Text
                colorScheme='secondary'
                sx={t => ({ fontSize: t.fontSizes.$sm })}
              >
                {item.hint}
              </Text>
            </Col>
            <Flex
              align='center'
              sx={t => ({ gap: t.space.$2, flexShrink: 0 })}
            >
              {item.state === 'done' ? (
                <Badge colorScheme='success'>Done</Badge>
              ) : item.state === 'soon' ? (
                <Badge colorScheme='primary'>Coming soon</Badge>
              ) : item.state === 'optional' ? (
                <Badge colorScheme='primary'>Pre-approved</Badge>
              ) : item.onAction ? null : (
                <Badge colorScheme='warning'>To do</Badge>
              )}
              {item.onAction && item.state !== 'done' && item.state !== 'soon' ? (
                <Button
                  block={false}
                  variant='outline'
                  textVariant='buttonSmall'
                  onClick={item.onAction}
                  localizationKey={protoKey(item.actionLabel ?? 'Open')}
                />
              ) : null}
            </Flex>
          </Flex>
        ))}
      </Col>
      <FormButtonContainer>
        <Button
          block={false}
          variant='outline'
          textVariant='buttonSmall'
          onClick={() => open(`manage:${domain.id}`)}
          localizationKey={protoKey('Manage access')}
        />
        <Button
          block={false}
          variant='ghost'
          textVariant='buttonSmall'
          onClick={close}
          localizationKey={protoKey('Close')}
        />
      </FormButtonContainer>
    </FormContainer>
  );
});
