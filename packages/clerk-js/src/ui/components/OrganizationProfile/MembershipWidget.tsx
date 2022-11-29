import { useRouter } from '../../../ui/router';
import { useCoreOrganization, useOrganizationProfileContext } from '../../contexts';
import { Col, Flex, Link, Text } from '../../customizables';

export const MembershipWidget = () => {
  const { organization } = useCoreOrganization();
  const { __unstable_manageBillingUrl, __unstable_manageBillingMembersLimit } = useOrganizationProfileContext();
  const router = useRouter();

  if (!organization) {
    return null;
  }

  const reachedOrganizationMemberLimit =
    !!__unstable_manageBillingMembersLimit &&
    __unstable_manageBillingMembersLimit <= organization.pendingInvitationsCount + organization.membersCount;

  return (
    <Flex
      sx={theme => ({
        background: theme.colors.$blackAlpha50,
        padding: theme.space.$4,
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        borderRadius: theme.radii.$md,
      })}
    >
      <Col>
        <Text
          sx={t => ({
            lineHeight: t.lineHeights.$tall,
          })}
        >
          Membership
        </Text>

        {reachedOrganizationMemberLimit && (
          <Link
            variant='regularRegular'
            sx={t => ({
              alignSelf: 'flex-start',
              color: t.colors.$primary500,
              marginTop: t.space.$1,
              fontWeight: t.fontWeights.$normal,
            })}
            onClick={() => router.navigate(__unstable_manageBillingUrl())}
          >
            Add payment method on Stripe
          </Link>
        )}
      </Col>
      <Col>
        <Text
          variant='regularRegular'
          sx={t => ({
            fontWeight: t.fontWeights.$normal,
            lineHeight: t.lineHeights.$tall,
            color: t.colors.$blackAlpha600,
          })}
        >
          {organization?.membersCount + organization?.pendingInvitationsCount} of{' '}
          {!__unstable_manageBillingMembersLimit ? 'unlimited' : __unstable_manageBillingMembersLimit} members
        </Text>
      </Col>
    </Flex>
  );
};
