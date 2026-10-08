import { Alert } from '@/ui/elements/Alert';
import { Header } from '@/ui/elements/Header';
import { ProfileCard } from '@/ui/elements/ProfileCard';

import { Box, descriptors, Icon, localizationKeys, SimpleButton, Span, Spinner } from '../../customizables';
import { ArrowRight, Plus, RotateLeftRight } from '../../icons';
import { Statement } from './Statement';
import type { StatementPageData } from './statements.types';

export const StatementPageView = ({
  isLoading,
  localizationRoot,
  errorText,
  statement,
  onBack,
  onPaymentAttempt,
}: StatementPageData) => {
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
        <Header.BackLink onClick={onBack}>
          <Header.Title
            localizationKey={localizationKeys(`${localizationRoot}.billingPage.statementsSection.title`)}
            textVariant='h2'
          />
        </Header.BackLink>
      </Header.Root>
      {!statement ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <Alert
            variant='danger'
            colorScheme='danger'
          >
            {errorText}
          </Alert>
        </Box>
      ) : (
        <Statement.Root>
          <Statement.Header
            title={statement.title}
            id={statement.id}
            status={statement.status}
          />
          <Statement.Body>
            {statement.sections.map(group => (
              <Statement.Section key={group.id}>
                <Statement.SectionHeader text={group.title} />
                <Statement.SectionContent>
                  {group.items.map(item => (
                    <Statement.SectionContentItem key={item.id}>
                      <Statement.SectionContentDetailsHeader
                        title={item.planName}
                        description={item.description}
                        secondaryTitle={item.amount}
                      />
                      <Statement.SectionContentDetailsList>
                        <Statement.SectionContentDetailsListItem
                          label={
                            item.chargeType === 'recurring'
                              ? localizationKeys(
                                  `${localizationRoot}.billingPage.statementsSection.itemCaption__paidForPlan`,
                                  { plan: item.planName, period: item.planPeriod },
                                )
                              : localizationKeys(
                                  `${localizationRoot}.billingPage.statementsSection.itemCaption__subscribedAndPaidForPlan`,
                                  { plan: item.planName, period: item.planPeriod },
                                )
                          }
                          labelIcon={item.chargeType === 'recurring' ? RotateLeftRight : Plus}
                          value={
                            <SimpleButton
                              onClick={() => onPaymentAttempt(item.id)}
                              variant='link'
                              colorScheme='primary'
                              textVariant='buttonSmall'
                              sx={t => ({ gap: t.space.$1 })}
                            >
                              <Span localizationKey={localizationKeys('billing.viewPayment')} />
                              <Icon
                                icon={ArrowRight}
                                size='sm'
                                aria-hidden
                              />
                            </SimpleButton>
                          }
                        />
                        {item.prorationValue ? (
                          <Statement.SectionContentDetailsListItem
                            label={localizationKeys('billing.proratedDiscount')}
                            value={item.prorationValue}
                          />
                        ) : null}
                        {item.discount ? (
                          <Statement.SectionContentDetailsListItem
                            label={item.discount.label}
                            value={item.discount.value}
                          />
                        ) : null}
                        {item.creditProrationValue ? (
                          <Statement.SectionContentDetailsListItem
                            label={localizationKeys(
                              `${localizationRoot}.billingPage.statementsSection.itemCaption__proratedCredit`,
                            )}
                            value={item.creditProrationValue}
                          />
                        ) : null}
                        {item.payerCreditValue ? (
                          <Statement.SectionContentDetailsListItem
                            label={localizationKeys(
                              `${localizationRoot}.billingPage.statementsSection.itemCaption__payerCredit`,
                            )}
                            value={item.payerCreditValue}
                          />
                        ) : null}
                      </Statement.SectionContentDetailsList>
                    </Statement.SectionContentItem>
                  ))}
                </Statement.SectionContent>
              </Statement.Section>
            ))}
          </Statement.Body>
          <Statement.Footer
            label={localizationKeys(`${localizationRoot}.billingPage.statementsSection.totalPaid`)}
            value={statement.totalPaid}
          />
        </Statement.Root>
      )}
    </ProfileCard.Page>
  );
};
