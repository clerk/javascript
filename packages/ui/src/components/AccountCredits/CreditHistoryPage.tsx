import { Header } from '@/ui/elements/Header';
import { ProfileCard } from '@/ui/elements/ProfileCard';

import { useCreditBalance, useCreditHistory, useSubscriberTypeLocalizationRoot } from '../../contexts';
import { Box, descriptors, localizationKeys, Spinner, Text } from '../../customizables';
import { useRouter } from '../../router';

function formatCreditDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

function formatCreditAmount(amount: number, currencySymbol: string): string {
  const absAmount = Math.abs(amount);
  const dollars = (absAmount / 100).toFixed(2);
  const prefix = amount >= 0 ? '+' : '-';
  return `${prefix}${currencySymbol}${dollars}`;
}

export const CreditHistoryPage = () => {
  const { navigate } = useRouter();
  const localizationRoot = useSubscriberTypeLocalizationRoot();
  const { data: creditBalance } = useCreditBalance();
  const { data: creditHistory, isLoading } = useCreditHistory();

  const currencySymbol = creditBalance?.balance?.currencySymbol ?? '$';

  if (isLoading) {
    return (
      <ProfileCard.Page>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <Spinner
            colorScheme='primary'
            sx={{ margin: 'auto', display: 'block' }}
            elementDescriptor={descriptors.spinner}
          />
        </Box>
      </ProfileCard.Page>
    );
  }

  return (
    <ProfileCard.Page>
      <Header.Root
        sx={t => ({
          borderBlockEndWidth: t.borderWidths.$normal,
          borderBlockEndStyle: t.borderStyles.$solid,
          borderBlockEndColor: t.colors.$borderAlpha100,
          marginBlockEnd: t.space.$4,
          paddingBlockEnd: t.space.$4,
        })}
      >
        <Header.BackLink onClick={() => void navigate('../')}>
          <Header.Title
            localizationKey={localizationKeys(`${localizationRoot}.billingPage.creditHistoryPage.title`)}
            textVariant='h2'
          />
        </Header.BackLink>
      </Header.Root>

      <Box
        sx={t => ({
          borderWidth: t.borderWidths.$normal,
          borderStyle: t.borderStyles.$solid,
          borderColor: t.colors.$borderAlpha100,
          borderRadius: t.radii.$lg,
          overflow: 'clip',
        })}
      >
        <Box
          as='table'
          sx={{ width: '100%', borderCollapse: 'collapse' }}
        >
          <Box as='thead'>
            <Box
              as='tr'
              sx={t => ({
                background: t.colors.$neutralAlpha25,
                borderBlockEndWidth: t.borderWidths.$normal,
                borderBlockEndStyle: t.borderStyles.$solid,
                borderBlockEndColor: t.colors.$borderAlpha100,
              })}
            >
              <Box
                as='th'
                sx={t => ({ padding: t.space.$3, textAlign: 'left' })}
              >
                <Text
                  variant='caption'
                  colorScheme='secondary'
                  localizationKey={localizationKeys(
                    `${localizationRoot}.billingPage.creditHistoryPage.tableHeader__amount`,
                  )}
                />
              </Box>
              <Box
                as='th'
                sx={t => ({ padding: t.space.$3, textAlign: 'left' })}
              >
                <Text
                  variant='caption'
                  colorScheme='secondary'
                  localizationKey={localizationKeys(
                    `${localizationRoot}.billingPage.creditHistoryPage.tableHeader__date`,
                  )}
                />
              </Box>
            </Box>
          </Box>
          <Box as='tbody'>
            {creditHistory?.data?.map(entry => (
              <Box
                key={entry.id}
                as='tr'
                sx={t => ({
                  borderBlockEndWidth: t.borderWidths.$normal,
                  borderBlockEndStyle: t.borderStyles.$solid,
                  borderBlockEndColor: t.colors.$borderAlpha100,
                  '&:last-child': { borderBlockEnd: 'none' },
                })}
              >
                <Box
                  as='td'
                  sx={t => ({ padding: t.space.$3 })}
                >
                  <Text
                    variant='subtitle'
                    sx={{ color: entry.amount >= 0 ? undefined : 'inherit' }}
                  >
                    {formatCreditAmount(entry.amount, currencySymbol)}
                  </Text>
                </Box>
                <Box
                  as='td'
                  sx={t => ({ padding: t.space.$3 })}
                >
                  <Text variant='body'>{formatCreditDate(entry.createdAt)}</Text>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </ProfileCard.Page>
  );
};
