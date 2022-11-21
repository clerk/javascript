import { useRouter } from '../../../ui/router';
import { AlertIcon, Flex, Link, Text } from '../../customizables';

export const BillingWidget = ({ __unstable_manageBillingUrl, __unstable_manageBillingMembersLimit }) => {
  const router = useRouter();

  return (
    <Flex
      sx={theme => ({ background: theme.colors.$blackAlpha50, padding: theme.space.$4, borderRadius: theme.radii.$md })}
    >
      <AlertIcon
        variant='warning'
        colorScheme='danger'
        sx={t => ({ marginTop: t.space.$1 })}
      />
      <Text
        variant='regularRegular'
        sx={t => ({
          fontWeight: t.fontWeights.$normal,
          lineHeight: t.lineHeights.$tall,
        })}
      >
        This organization is limited to {__unstable_manageBillingMembersLimit} memberships.
        <br />
        <Link
          variant='regularRegular'
          sx={t => ({
            alignSelf: 'flex-start',
            color: t.colors.$primary500,
            fontWeight: t.fontWeights.$normal,
          })}
          onClick={() => router.navigate(__unstable_manageBillingUrl())}
        >
          Upgrade for unlimited memberships
        </Link>
      </Text>
    </Flex>
  );
};
