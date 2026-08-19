import { Header } from '@/ui/elements/Header';
import { ProfileCard } from '@/ui/elements/ProfileCard';
import { ProfileSection } from '@/ui/elements/Section';
import { ThreeDotsMenu } from '@/ui/elements/ThreeDotsMenu';

import { Badge, Col, descriptors, Flex, Text } from '../../../customizables';
import { Action } from '../../../elements/Action';
import { useActionContext } from '../../../elements/Action/ActionRoot';
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
 * Prototype: the C2's merged access surface. One page answers "who can join
 * with this domain, and how do they sign in" — the concepts that today are
 * split between General → Verified domains and Security → SSO.
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
    <ProfileSection.Root
      title={protoKey('Domain rules')}
      id='organizationDomains'
      centered={false}
    >
      <Action.Root>
        <ProfileSection.ItemList id='organizationDomains'>
          {domains.map(domain => (
            <DomainRuleRow
              key={domain.id}
              domain={domain}
            />
          ))}
        </ProfileSection.ItemList>

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
      </Action.Root>
    </ProfileSection.Root>
  );
};

const AddDomainClose = () => {
  const { close } = useActionContext();
  return <AddDomainAccessForm onClose={close} />;
};

const useDomainMenuActions = (domain: ProtoDomain): PropsOfComponent<typeof ThreeDotsMenu>['actions'] => {
  const { open } = useActionContext();
  const { dispatch } = useAccessOnboarding();

  const actions: PropsOfComponent<typeof ThreeDotsMenu>['actions'] = [
    {
      label: protoKey('Manage access'),
      onClick: () => open('manage'),
    },
    {
      label: protoKey(domain.authentication.mode === 'sso' ? 'Manage SSO' : 'Set up SSO'),
      onClick: () => open('sso'),
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

const DomainRuleRow = ({ domain }: { domain: ProtoDomain }) => (
  <Action.Root>
    <ProfileSection.Item
      id='organizationDomains'
      hoverable
    >
      <Flex
        align='center'
        wrap='wrap'
        sx={t => ({ gap: t.space.$1x5, minWidth: 0 })}
      >
        <Text>{domain.name}</Text>
        <EnrollmentBadge domain={domain} />
        <AuthenticationBadge domain={domain} />
        <ProofBadge domain={domain} />
      </Flex>
      <DomainRuleMenu domain={domain} />
    </ProfileSection.Item>

    <Action.Open value='manage'>
      <Action.Card>
        <ManageDomainClose domain={domain} />
      </Action.Card>
    </Action.Open>

    <Action.Open value='sso'>
      <Action.Card>
        <SetUpSsoClose domain={domain} />
      </Action.Card>
    </Action.Open>
  </Action.Root>
);

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

const EnrollmentBadge = ({ domain }: { domain: ProtoDomain }) => (
  <Badge colorScheme={domain.enrollment === 'invitation_only' ? 'primary' : 'success'}>
    {ENROLLMENT_LABELS[domain.enrollment].label}
  </Badge>
);

const AuthenticationBadge = ({ domain }: { domain: ProtoDomain }) => {
  if (domain.authentication.mode !== 'sso') {
    return <Badge colorScheme='primary'>Default sign-in</Badge>;
  }
  const provider = PROVIDER_LABELS[domain.authentication.provider].label;
  return domain.authentication.status === 'active' ? (
    <Badge colorScheme='success'>{`SSO · ${provider}`}</Badge>
  ) : (
    <Badge colorScheme='warning'>{`SSO · Setting up`}</Badge>
  );
};

const ProofBadge = ({ domain }: { domain: ProtoDomain }) => {
  if (domain.ownership === 'verified') {
    return <Badge colorScheme='success'>Ownership verified</Badge>;
  }
  if (domain.ownership === 'waived') {
    return <Badge colorScheme='primary'>Ownership waived</Badge>;
  }
  if (domain.affiliationVerified) {
    return <Badge colorScheme='primary'>Domain verified</Badge>;
  }
  return <Badge colorScheme='warning'>Unverified</Badge>;
};
