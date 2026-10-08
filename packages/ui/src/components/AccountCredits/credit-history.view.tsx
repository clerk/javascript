import { Header } from '@/ui/elements/Header';
import { ProfileCard } from '@/ui/elements/ProfileCard';

import {
  Box,
  descriptors,
  localizationKeys,
  Spinner,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useLocalizations,
} from '../../customizables';
import type { CreditHistoryViewProps } from './account-credits.types';

export function CreditHistoryView({ status, localizationRoot, entries, onBack }: CreditHistoryViewProps): JSX.Element {
  const { $, locale } = useLocalizations();

  const formatCreditDate = (date: number): string =>
    new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric', year: 'numeric' }).format(date);

  if (status === 'loading') {
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
        <Header.BackLink onClick={onBack}>
          <Header.Title
            localizationKey={localizationKeys(`${localizationRoot}.billingPage.creditHistoryPage.title`)}
            textVariant='h2'
          />
        </Header.BackLink>
      </Header.Root>

      <Table>
        <Thead>
          <Tr sx={t => ({ background: t.colors.$neutralAlpha25 })}>
            <Th
              localizationKey={localizationKeys(
                `${localizationRoot}.billingPage.creditHistoryPage.tableHeader__amount`,
              )}
            />
            <Th
              localizationKey={localizationKeys(`${localizationRoot}.billingPage.creditHistoryPage.tableHeader__date`)}
            />
          </Tr>
        </Thead>
        <Tbody>
          {entries.map(entry => (
            <Tr key={entry.id}>
              <Td>
                <Text variant='subtitle'>{$(entry.amount)}</Text>
              </Td>
              <Td>
                <Text variant='body'>{formatCreditDate(entry.createdAt)}</Text>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </ProfileCard.Page>
  );
}
