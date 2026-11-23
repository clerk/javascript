import { Button, Col, Flex, Icon, Text } from '../../../customizables';
import { ShieldCheck } from '../../../icons';
import { borderSx, smallSx, xsSx } from './parts';
import type { ProtoExternalSignIn, ProtoJoinRequest } from './prototypeState';
import { joinList, plural, protoKey, useAccessPrototype } from './prototypeState';

const reachTitle = (signIn: ProtoExternalSignIn) =>
  `${plural(signIn.members.length, 'member')} ${signIn.members.length === 1 ? 'signs' : 'sign'} in with ${signIn.ownerName}’s SSO`;

/*
 * On an organization whose members' domain another organization proved and put
 * behind SSO: why their sign-in changed. Asking to be managed is only offered
 * when that organization has a parent account to join.
 */
export const ExternalSignInBanner = () => {
  const store = useAccessPrototype();
  const signIn = store.externalSignIn;
  if (!signIn || signIn.status === 'dismissed') {
    return null;
  }
  const company = store.organizationName;
  const owner = signIn.ownerName;
  const enterprise = signIn.enterpriseName;
  const indent = (t: { sizes: { $5: string }; space: { $3: string } }) => `calc(${t.sizes.$5} + ${t.space.$3})`;

  return (
    <Col sx={t => ({ ...borderSx(t), gap: t.space.$3, padding: t.space.$4 })}>
      <Flex
        align='start'
        gap={3}
      >
        <Icon
          icon={ShieldCheck}
          sx={t => ({ width: t.sizes.$5, height: t.sizes.$5, flexShrink: 0, color: t.colors.$colorMutedForeground })}
        />
        <Col sx={t => ({ gap: t.space.$1 })}>
          <Text variant='subtitle'>{reachTitle(signIn)}</Text>
          <Text
            colorScheme='secondary'
            sx={smallSx}
          >
            {`${owner} manages sign-in for everyone at ${signIn.domain}, including ${joinList(signIn.members)} here.`}
          </Text>
        </Col>
      </Flex>
      {!enterprise ? (
        <Flex
          justify='between'
          align='center'
          gap={3}
          sx={t => ({ paddingInlineStart: indent(t) })}
        >
          <Text sx={smallSx}>{`Only ${owner} can change this.`}</Text>
          <Button
            variant='outline'
            size='xs'
            textVariant='buttonSmall'
            block={false}
            onClick={() => store.setExternalSignInStatus('dismissed')}
            localizationKey={protoKey('Dismiss')}
          />
        </Flex>
      ) : signIn.status === 'requested' ? (
        <Flex
          justify='between'
          align='center'
          gap={3}
          sx={t => ({ paddingInlineStart: indent(t) })}
        >
          <Text sx={smallSx}>{`Request sent to ${enterprise}. Nothing changes until they accept.`}</Text>
          <Button
            variant='outline'
            size='xs'
            textVariant='buttonSmall'
            block={false}
            onClick={() => store.setExternalSignInStatus('new')}
            localizationKey={protoKey('Cancel request')}
          />
        </Flex>
      ) : (
        <Col sx={t => ({ gap: t.space.$2, paddingInlineStart: indent(t) })}>
          <Text sx={smallSx}>{`Is ${company} part of ${owner}?`}</Text>
          <Flex
            gap={2}
            wrap='wrap'
          >
            <Button
              size='xs'
              textVariant='buttonSmall'
              block={false}
              onClick={() => store.setExternalSignInStatus('requested')}
              localizationKey={protoKey(`Ask to join ${enterprise}`)}
            />
            <Button
              variant='outline'
              size='xs'
              textVariant='buttonSmall'
              block={false}
              onClick={() => store.setExternalSignInStatus('dismissed')}
              localizationKey={protoKey('No')}
            />
          </Flex>
        </Col>
      )}
    </Col>
  );
};

/** The same fact on the General page, next to setting up a parent account. */
export const ExternalSignInRow = () => {
  const store = useAccessPrototype();
  const signIn = store.externalSignIn;
  if (!signIn) {
    return null;
  }
  const owner = signIn.ownerName;
  const enterprise = signIn.enterpriseName;
  return (
    <Flex
      justify='between'
      align='center'
      gap={3}
      sx={t => ({ ...borderSx(t), padding: t.space.$3 })}
    >
      <Col sx={{ minWidth: 0 }}>
        <Text sx={smallSx}>{reachTitle(signIn)}</Text>
        <Text
          colorScheme='secondary'
          sx={xsSx}
        >
          {!enterprise
            ? `Only ${owner} can change this.`
            : signIn.status === 'requested'
              ? `You asked to join ${enterprise}.`
              : `Part of ${owner}? Ask to join ${enterprise}.`}
        </Text>
      </Col>
      {!enterprise || signIn.status === 'requested' ? null : (
        <Button
          variant='outline'
          size='xs'
          textVariant='buttonSmall'
          block={false}
          sx={{ flexShrink: 0 }}
          onClick={() => store.setExternalSignInStatus('requested')}
          localizationKey={protoKey('Ask to join')}
        />
      )}
    </Flex>
  );
};

/*
 * On a parent account: an organization whose members it already signs in
 * asked to join. Only parent accounts receive these requests.
 */
export const JoinRequestBanner = () => {
  const store = useAccessPrototype();
  const requests = store.joinRequests ?? [];
  const hierarchy = store.hierarchy;
  if (requests.length === 0 || hierarchy?.role !== 'parent') {
    return null;
  }
  const enterprise = hierarchy.parentName;

  return (
    <>
      {requests.map((request: ProtoJoinRequest) => (
        <Col
          key={request.id}
          sx={t => ({ ...borderSx(t), gap: t.space.$3, padding: t.space.$4 })}
        >
          <Col sx={t => ({ gap: t.space.$1 })}>
            <Text variant='subtitle'>{`${request.name} asked to join ${enterprise}`}</Text>
            <Text
              colorScheme='secondary'
              sx={smallSx}
            >
              {`${request.requestedBy} says it’s part of your company. It keeps its ${request.membersCount} members and data.`}
            </Text>
          </Col>
          <Flex
            gap={2}
            wrap='wrap'
          >
            <Button
              size='xs'
              textVariant='buttonSmall'
              block={false}
              onClick={() => store.resolveJoinRequest(request.id, true)}
              localizationKey={protoKey('Bring in')}
            />
            <Button
              variant='outline'
              size='xs'
              textVariant='buttonSmall'
              block={false}
              onClick={() => store.resolveJoinRequest(request.id, false)}
              localizationKey={protoKey('Decline')}
            />
          </Flex>
        </Col>
      ))}
    </>
  );
};
