import { useRouter } from '../../../ui/router';
import { runIfFunctionOrReturn } from '../../../utils';
import { AlertIcon, Flex, Link, Text } from '../../customizables';

export const BillingWidget = ({
  __unstable_manageBillingUrl,
  __unstable_manageBillingMembersLimit,
}: {
  __unstable_manageBillingUrl: string | ((args: any) => string);
  __unstable_manageBillingMembersLimit: string | ((args: any) => string);
}) => {
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
        This organization is limited to {runIfFunctionOrReturn(__unstable_manageBillingMembersLimit)} members.
        <br />
        <Link
          variant='regularRegular'
          sx={t => ({
            alignSelf: 'flex-start',
            color: t.colors.$primary500,
            fontWeight: t.fontWeights.$normal,
          })}
          onClick={() => router.navigate(runIfFunctionOrReturn(__unstable_manageBillingUrl))}
        >
          Upgrade for unlimited members
        </Link>
      </Text>
    </Flex>
  );
};
