import { Col, Flex, Icon, Text } from '../../../customizables';
import { ExclamationTriangle } from '../../../icons';
import { borderSx, InfoTooltip, smallSx, xsSx } from './parts';
import type { ProtoPolicy } from './prototypeState';
import { formatDate, joinList, peopleElsewhereAt, plural, useAccessPrototype } from './prototypeState';

/** Users at this organization's live, proven domains who aren't in it, while it has no parent account. */
const useOutsideReach = () => {
  const store = useAccessPrototype();
  if (store.hierarchy || !store.access.canManage) {
    return null;
  }
  const live = store.policies.filter(policy => !policy.isCatchAll && policy.status === 'active');
  // Under "Membership: Only in", what matters is who's still in other organizations.
  const exclusiveDomains = live.filter(policy => policy.exclusive).flatMap(policy => policy.domains);
  const elsewhereAt = (domain: string) =>
    exclusiveDomains.includes(domain) ? peopleElsewhereAt([domain], store.outsidePeople).people.length : 0;
  const elsewhereDomains = exclusiveDomains.filter(domain => elsewhereAt(domain) > 0);
  if (elsewhereDomains.length > 0) {
    const removals = live
      .filter(policy => policy.exclusive && policy.domains.some(d => elsewhereDomains.includes(d)))
      .map(policy => policy.removeElsewhereOn);
    return {
      kind: 'elsewhere' as const,
      domains: elsewhereDomains,
      total: elsewhereDomains.reduce((sum, domain) => sum + elsewhereAt(domain), 0),
      countAt: elsewhereAt,
      usesSso: false,
      // Set when every policy involved has already scheduled their removal.
      removalOn: removals.every(Boolean) ? (removals.sort()[0] ?? null) : null,
    };
  }
  const countAt = (domain: string) => (store.outsidePeople[domain] ?? []).length;
  const domains = [
    ...new Set(
      live.flatMap(policy =>
        policy.domains.filter(domain => policy.proofs[domain]?.ownership === 'verified' && countAt(domain) > 0),
      ),
    ),
  ];
  if (domains.length === 0) {
    return null;
  }
  const usesSso = live.some(
    policy => policy.signIn === 'sso' && policy.domains.some(domain => domains.includes(domain)),
  );
  return {
    kind: 'outside' as const,
    domains,
    total: domains.reduce((sum, domain) => sum + countAt(domain), 0),
    countAt,
    usesSso,
    removalOn: null,
  };
};

const reachTitle = (
  reach: NonNullable<ReturnType<typeof useOutsideReach>>,
  domains: string[],
  count: number,
  organization: string,
) =>
  reach.kind === 'elsewhere'
    ? `${plural(count, 'user', 'users')} at ${joinList(domains)} ${count === 1 ? 'is' : 'are'} still in other organizations`
    : `${plural(count, 'user', 'users')} at ${joinList(domains)} ${count === 1 ? 'isn’t' : 'aren’t'} in ${organization}`;

/*
 * On General, next to setting up a parent account: a policy is live on a
 * proven domain, and people there aren't in this organization or are still in
 * others. It isn't dismissible: it goes away once the situation does.
 */
export const OutsidePeopleNotice = () => {
  const store = useAccessPrototype();
  const reach = useOutsideReach();
  if (!reach) {
    return null;
  }
  const body =
    reach.kind === 'outside'
      ? `They use your ${reach.usesSso ? 'SSO' : 'sign-in rules'} in other organizations. Set up a parent account to manage their access.`
      : reach.removalOn
        ? `They’re removed from them on ${formatDate(reach.removalOn)}. To bring their organizations in instead, set up a parent account.`
        : `Remove them on the ${joinList(reach.domains)} policy, or set up a parent account to decide for each organization.`;
  return (
    <Flex
      align='start'
      gap={2}
      sx={t => ({ ...borderSx(t), padding: t.space.$3, backgroundColor: t.colors.$warningAlpha50 })}
    >
      <Icon
        icon={ExclamationTriangle}
        sx={t => ({
          width: t.sizes.$4,
          height: t.sizes.$4,
          flexShrink: 0,
          marginTop: t.space.$0x5,
          color: t.colors.$warning500,
        })}
      />
      <Col sx={t => ({ gap: t.space.$0x5, minWidth: 0 })}>
        <Text sx={smallSx}>{reachTitle(reach, reach.domains, reach.total, store.organizationName)}</Text>
        <Text
          colorScheme='secondary'
          sx={xsSx}
        >
          {body}
        </Text>
      </Col>
    </Flex>
  );
};

/** Next to a live policy's domain: who there isn't in this organization, or is still in others, on hover. */
export const OutsidePeopleBadge = ({ policy }: { policy: ProtoPolicy }) => {
  const store = useAccessPrototype();
  const reach = useOutsideReach();
  if (!reach || policy.status !== 'active') {
    return null;
  }
  const domains = policy.domains.filter(domain => reach.domains.includes(domain));
  const count = domains.reduce((sum, domain) => sum + reach.countAt(domain), 0);
  return count ? (
    <InfoTooltip
      tone='warning'
      text={`${reachTitle(reach, domains, count, store.organizationName)}. ${reach.kind === 'elsewhere' ? 'Open this policy to manage them.' : 'To manage their access, create a parent account in General.'}`}
    />
  ) : null;
};
