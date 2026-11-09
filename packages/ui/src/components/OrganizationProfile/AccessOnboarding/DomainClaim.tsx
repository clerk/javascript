import { useContext, useState } from 'react';

import { Modal } from '@/ui/elements/Modal';
import { Switch } from '@/ui/elements/Switch';
import { ThreeDotsMenu } from '@/ui/elements/ThreeDotsMenu';

import { Badge, Box, Button, Col, Flex, Table, Tbody, Td, Text, Th, Thead, Tr } from '../../../customizables';
import { borderSx, ContentRefContext, RadioOption, smallSx, WarningLine, xsSx } from './parts';
import type { ProtoClaim, ProtoOutsidePerson, ProtoPolicy } from './prototypeState';
import {
  CLAIM_NOTICE_DAYS,
  connectionById,
  formatDate,
  protoKey,
  ROUTING_LABELS,
  simulateRequest,
  useAccessPrototype,
} from './prototypeState';

/* What claiming does to the people at a domain depends on the policy that targets it. */
type ClaimContext = Pick<ProtoPolicy, 'signIn' | 'connectionIds' | 'enrollment' | 'directoryId'>;

/*
 * The claim line under a domain's proof lines. Claiming needs ownership, and
 * the application owner has to allow it. It brings people at the domain who
 * aren't members into this organization; it never touches their other
 * organizations unless the application owner also allows that.
 */
export const ClaimLine = ({
  domain,
  owned,
  canManage,
  context,
}: {
  domain: string;
  owned: boolean;
  canManage: boolean;
  context: ClaimContext;
}) => {
  const store = useAccessPrototype();
  const [dialog, setDialog] = useState<'claim' | 'people' | null>(null);
  const claim = store.claims[domain];
  const people = store.outsidePeople[domain] ?? [];

  if (!store.access.claimsAllowed || store.hierarchy?.role === 'child') {
    return null;
  }

  const line = (() => {
    if (!owned && claim?.status !== 'proof_lost') {
      return <StatusText>Prove ownership to claim this domain</StatusText>;
    }
    if (!claim) {
      return people.length === 0 ? (
        <StatusText>Everyone at this domain is in your organization</StatusText>
      ) : (
        <Flex
          justify='between'
          align='center'
          gap={2}
        >
          <LinkText onClick={() => setDialog('people')}>{peopleOutside(people.length)}</LinkText>
          {canManage ? (
            <Button
              variant='outline'
              size='xs'
              textVariant='buttonSmall'
              block={false}
              onClick={() => setDialog('claim')}
              localizationKey={protoKey('Claim domain')}
            />
          ) : null}
        </Flex>
      );
    }
    return (
      <Flex
        justify='between'
        align='center'
        gap={2}
      >
        <Flex
          align='center'
          gap={2}
        >
          <ClaimBadge claim={claim} />
          <LinkText onClick={() => setDialog('people')}>{claimSummary(claim, people.length, context)}</LinkText>
        </Flex>
        {canManage ? (
          <ClaimMenu
            domain={domain}
            claim={claim}
          />
        ) : null}
      </Flex>
    );
  })();

  return (
    <>
      {line}
      {dialog === 'claim' ? (
        <ClaimDialog
          domain={domain}
          people={people}
          context={context}
          onClose={() => setDialog(null)}
        />
      ) : null}
      {dialog === 'people' ? (
        <PeopleDialog
          domain={domain}
          people={people}
          onClose={() => setDialog(null)}
        />
      ) : null}
    </>
  );
};

const peopleOutside = (count: number) =>
  `${count} ${count === 1 ? 'person' : 'people'} at this domain ${count === 1 ? 'is' : 'are'} outside your organization`;

const claimSummary = (claim: ProtoClaim, count: number, context: ClaimContext) => {
  if (claim.status === 'notice') {
    return `Starts ${formatDate(claim.startsAt)} · ${count} ${count === 1 ? 'person' : 'people'} notified`;
  }
  if (claim.status === 'proof_lost') {
    return `Ownership couldn’t be confirmed. The claim ends ${formatDate(claim.endsAt ?? claim.startsAt)}`;
  }
  if (count === 0 || joinsImmediately(context)) {
    return 'Everyone at this domain is in your organization';
  }
  return `${count} ${count === 1 ? 'person joins' : 'people join'} at their next sign-in`;
};

const joinsImmediately = (context: ClaimContext) => context.signIn !== 'sso' && context.enrollment !== 'directory_sync';

const ClaimBadge = ({ claim }: { claim: ProtoClaim }) =>
  claim.status === 'notice' ? (
    <Badge colorScheme='warning'>Notice period</Badge>
  ) : claim.status === 'proof_lost' ? (
    <Badge colorScheme='danger'>Ending</Badge>
  ) : (
    <Badge colorScheme='success'>Claimed</Badge>
  );

const ClaimMenu = ({ domain, claim }: { domain: string; claim: ProtoClaim }) => {
  const store = useAccessPrototype();
  const actions =
    claim.status === 'notice'
      ? [
          { label: protoKey('Start now'), onClick: () => store.startClaimNow(domain) },
          { label: protoKey('Cancel claim'), isDestructive: true, onClick: () => store.endClaim(domain) },
        ]
      : claim.status === 'proof_lost'
        ? [
            { label: protoKey('Prototype: ownership confirmed again'), onClick: () => store.restoreClaim(domain) },
            { label: protoKey('Release now'), isDestructive: true, onClick: () => store.endClaim(domain) },
          ]
        : [
            { label: protoKey('Prototype: lose ownership'), onClick: () => store.loseOwnership(domain) },
            { label: protoKey('Release claim'), isDestructive: true, onClick: () => store.endClaim(domain) },
          ];
  return <ThreeDotsMenu actions={actions} />;
};

const StatusText = ({ children }: { children: string }) => (
  <Text
    colorScheme='secondary'
    sx={xsSx}
  >
    {children}
  </Text>
);

const LinkText = ({ children, onClick }: { children: string; onClick: () => void }) => (
  <Text
    as='span'
    role='button'
    tabIndex={0}
    colorScheme='secondary'
    onClick={onClick}
    onKeyDown={event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onClick();
      }
    }}
    sx={t => ({
      ...xsSx(t),
      textDecoration: 'underline',
      textUnderlineOffset: t.space.$0x5,
      cursor: 'pointer',
    })}
  >
    {children}
  </Text>
);

/* ---------------------------------------------------------------- dialogs */

export const OverlayDialog = ({
  onClose,
  width = '30rem',
  children,
}: {
  onClose: () => void;
  width?: string;
  children: React.ReactNode;
}) => {
  const contentRef = useContext(ContentRefContext);
  return (
    <Modal
      handleClose={onClose}
      portalRoot={contentRef ?? undefined}
      containerSx={t => ({
        alignItems: 'center',
        position: 'absolute',
        inset: 0,
        width: 'auto',
        height: 'auto',
        backgroundColor: 'inherit',
        backdropFilter: `blur(${t.sizes.$2})`,
      })}
    >
      <Col
        sx={t => ({
          gap: t.space.$4,
          width,
          maxWidth: '100%',
          maxHeight: '100%',
          overflowY: 'auto',
          padding: t.space.$5,
          backgroundColor: t.colors.$colorBackground,
          borderRadius: t.radii.$lg,
          boxShadow: t.shadows.$cardContentShadow,
          borderWidth: t.borderWidths.$normal,
          borderStyle: t.borderStyles.$solid,
          borderColor: t.colors.$borderAlpha100,
        })}
      >
        {children}
      </Col>
    </Modal>
  );
};

export const DialogHeader = ({ title, description }: { title: string; description: string }) => (
  <Col sx={t => ({ gap: t.space.$1 })}>
    <Text variant='subtitle'>{title}</Text>
    <Text
      colorScheme='secondary'
      sx={smallSx}
    >
      {description}
    </Text>
  </Col>
);

/* Other organizations' names stay hidden: the people are this organization's business, their other memberships aren't. */
const PeopleTable = ({ people }: { people: ProtoOutsidePerson[] }) => (
  <Box sx={t => ({ ...borderSx(t), overflowX: 'auto', width: '100%' })}>
    <Table sx={{ tableLayout: 'fixed' }}>
      <Thead>
        <Tr>
          <Th
            localizationKey={protoKey('Email')}
            sx={{ width: '48%' }}
          />
          <Th localizationKey={protoKey('Last sign-in')} />
          <Th localizationKey={protoKey('Other organizations')} />
        </Tr>
      </Thead>
      <Tbody>
        {people.map(entry => (
          <Tr key={entry.email}>
            <Td>
              <Text
                sx={smallSx}
                truncate
              >
                {entry.email}
              </Text>
            </Td>
            <Td>
              <Flex
                align='center'
                gap={1}
              >
                <Text sx={smallSx}>{entry.lastSignIn}</Text>
                {entry.inactive ? <Badge colorScheme='primary'>Inactive</Badge> : null}
              </Flex>
            </Td>
            <Td>
              <Text sx={smallSx}>
                {entry.otherOrganizations === 0
                  ? 'None'
                  : entry.inSingleMemberOrganization
                    ? 'Only member of 1'
                    : String(entry.otherOrganizations)}
              </Text>
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  </Box>
);

const PeopleDialog = ({
  domain,
  people,
  onClose,
}: {
  domain: string;
  people: ProtoOutsidePerson[];
  onClose: () => void;
}) => (
  <OverlayDialog onClose={onClose}>
    <DialogHeader
      title={`People at ${domain}`}
      description='Everyone with an email at this domain who isn’t a member of your organization.'
    />
    <PeopleTable people={people} />
    <Flex justify='end'>
      <Button
        variant='outline'
        textVariant='buttonSmall'
        block={false}
        onClick={onClose}
        localizationKey={protoKey('Close')}
      />
    </Flex>
  </OverlayDialog>
);

const ClaimDialog = ({
  domain,
  people,
  context,
  onClose,
}: {
  domain: string;
  people: ProtoOutsidePerson[];
  context: ClaimContext;
  onClose: () => void;
}) => {
  const store = useAccessPrototype();
  const [startNow, setStartNow] = useState(false);
  const [includeOrganizations, setIncludeOrganizations] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const hierarchy = store.hierarchy?.role === 'parent' ? store.hierarchy : null;
  const connection = connectionById(context.connectionIds[0], store.connections);
  const directory = connectionById(context.directoryId, store.connections);
  const inOtherOrganizations = people.filter(entry => entry.otherOrganizations > 0);
  const singleMember = inOtherOrganizations.filter(entry => entry.inSingleMemberOrganization).length;
  const shared = inOtherOrganizations.length - singleMember;

  const howTheyJoin = (() => {
    const where = hierarchy
      ? `${ROUTING_LABELS[hierarchy.routing].label}: that decides which sub-organization they land in.`
      : null;
    if (context.enrollment === 'directory_sync') {
      return [`They join when ${directory?.name ?? 'your directory'} syncs them.`, where];
    }
    if (context.signIn === 'sso') {
      return [`They join at their next sign-in with ${connection?.name ?? 'SSO'}.`, where];
    }
    return [`They’re added to ${hierarchy ? 'a sub-organization' : 'your organization'} when the claim starts.`, where];
  })().filter((entry): entry is string => Boolean(entry));

  const start = () => {
    setIsSaving(true);
    void simulateRequest().then(() => {
      store.startClaim(domain, startNow, includeOrganizations);
      onClose();
    });
  };

  return (
    <OverlayDialog
      onClose={onClose}
      width='34rem'
    >
      <DialogHeader
        title={`Claim ${domain}`}
        description={
          hierarchy
            ? `People at ${domain} who aren’t in ${hierarchy.parentName} or its sub-organizations.`
            : `People at ${domain} who aren’t in your organization join it. They keep their other organizations.`
        }
      />
      <PeopleTable people={people} />

      <Col sx={t => ({ gap: t.space.$1x5 })}>
        <Text variant='subtitle'>How they join</Text>
        {howTheyJoin.map(entry => (
          <Text
            key={entry}
            colorScheme='secondary'
            sx={smallSx}
          >
            {entry}
          </Text>
        ))}
        {context.signIn === 'sso' ? (
          <WarningLine>People not assigned to the app in your identity provider won’t be able to sign in.</WarningLine>
        ) : null}
      </Col>

      <Col sx={t => ({ gap: t.space.$2 })}>
        <Text variant='subtitle'>When</Text>
        <RadioOption
          name='claim-start'
          checked={!startNow}
          onSelect={() => setStartNow(false)}
          label={`In ${CLAIM_NOTICE_DAYS} days`}
          description='We email everyone now so they know what’s changing.'
        />
        <RadioOption
          name='claim-start'
          checked={startNow}
          onSelect={() => setStartNow(true)}
          label='Now'
          description='We email everyone when it starts.'
        />
      </Col>

      {store.access.organizationClaimsAllowed && inOtherOrganizations.length > 0 ? (
        <Col sx={t => ({ gap: t.space.$2 })}>
          <Switch
            isChecked={includeOrganizations}
            onChange={setIncludeOrganizations}
            label={protoKey('Also claim their organizations')}
          />
          {includeOrganizations ? (
            <Col sx={t => ({ gap: t.space.$1, paddingInlineStart: t.space.$6 })}>
              {singleMember > 0 ? (
                <Text
                  colorScheme='secondary'
                  sx={smallSx}
                >
                  {`${singleMember} ${singleMember === 1 ? 'is the only member of their organization. It moves' : 'are the only members of their organizations. They move'} in when the claim starts.`}
                </Text>
              ) : null}
              {shared > 0 ? (
                <Text
                  colorScheme='secondary'
                  sx={smallSx}
                >
                  {`${shared} ${shared === 1 ? 'is' : 'are'} in shared organizations. Their owners are told and can agree to join. Nothing moves without them.`}
                </Text>
              ) : null}
            </Col>
          ) : null}
        </Col>
      ) : null}

      <Flex
        justify='end'
        gap={2}
      >
        <Button
          variant='outline'
          textVariant='buttonSmall'
          block={false}
          onClick={onClose}
          localizationKey={protoKey('Cancel')}
        />
        <Button
          textVariant='buttonSmall'
          block={false}
          isLoading={isSaving}
          onClick={start}
          localizationKey={protoKey(startNow ? 'Claim now' : 'Start notice period')}
        />
      </Flex>
    </OverlayDialog>
  );
};
