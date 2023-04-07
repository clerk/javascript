import { useRouter } from '../../../ui/router';
import { runIfFunctionOrReturn } from '../../../utils';
import { useCoreOrganization, useOrganizationProfileContext } from '../../contexts';
import { Col, Flex, Link, Text } from '../../customizables';

export const MembershipWidget = () => {
  const { organization } = useCoreOrganization();
  //@ts-expect-error
  const { __unstable_manageBillingUrl, __unstable_manageBillingLabel, __unstable_manageBillingMembersLimit } =
    useOrganizationProfileContext();
  const router = useRouter();

  if (!organization) {
    return null;
  }

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
          Members can be given access to applications.
        </Text>

        {runIfFunctionOrReturn(__unstable_manageBillingMembersLimit) > 0 && (
          <Link
            variant='regularRegular'
            sx={t => ({
              alignSelf: 'flex-start',
              color: t.colors.$primary500,
              marginTop: t.space.$1,
              fontWeight: t.fontWeights.$normal,
            })}
            onClick={() => router.navigate(runIfFunctionOrReturn(__unstable_manageBillingUrl))}
          >
            {runIfFunctionOrReturn(__unstable_manageBillingLabel) || 'Manage billing'}
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
          {__unstable_manageBillingMembersLimit
            ? `${runIfFunctionOrReturn(__unstable_manageBillingMembersLimit)} members`
            : 'unlimited'}
        </Text>
      </Col>
    </Flex>
  );
};
