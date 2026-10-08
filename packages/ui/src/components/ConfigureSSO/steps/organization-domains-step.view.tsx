import type { ReactNode } from 'react';

import { Col, descriptors, Flow } from '@/customizables';
import { Alert } from '@/elements/Alert';
import { common } from '@/styledSystem';

import { Step } from '../elements/Step';
import type { useOrganizationDomainsStepController } from './organization-domains-step.controller';

type OrganizationDomainsStepViewProps = Pick<
  ReturnType<typeof useOrganizationDomainsStepController>,
  'error' | 'goPrev' | 'goNext' | 'isFirstStep' | 'isLastStep'
> & {
  title: string;
  subtitle: string;
  domainsReady: boolean;
  hasOrganizationDomains: boolean;
  domainsField: ReactNode;
  domainSuggestion: ReactNode;
  domainCards: ReactNode;
  removeDomainDialog: ReactNode;
};

export const OrganizationDomainsStepView = ({
  error,
  goPrev,
  goNext,
  isFirstStep,
  isLastStep,
  title,
  subtitle,
  domainsReady,
  hasOrganizationDomains,
  domainsField,
  domainSuggestion,
  domainCards,
  removeDomainDialog,
}: OrganizationDomainsStepViewProps): JSX.Element => {
  return (
    <Flow.Part part='organizationDomains'>
      <Step
        elementDescriptor={descriptors.configureSSOStep}
        elementId={descriptors.configureSSOStep.setId('verify-domain')}
      >
        <Step.Header
          title={title}
          description={subtitle}
        />

        <Step.Body>
          <Step.Section
            fill
            sx={t => ({ gap: t.space.$5, minHeight: 0 })}
          >
            <Col sx={t => ({ gap: t.space.$4 })}>
              {domainsField}

              {domainSuggestion}

              {error && (
                <Alert
                  variant='danger'
                  title={error}
                />
              )}
            </Col>

            {!!hasOrganizationDomains && (
              <Col
                elementDescriptor={descriptors.configureSSOVerifyDomainList}
                sx={t => ({
                  gap: t.space.$3,
                  flex: '0 1 auto',
                  minHeight: 0,
                  overflowY: 'auto',
                  // Inset so card shadows/focus rings are not clipped by the
                  // scroll container's overflow.
                  marginInline: `calc(${t.space.$1} * -1)`,
                  paddingInline: t.space.$1,
                  ...common.unstyledScrollbar(t),
                })}
              >
                {domainCards}
              </Col>
            )}
          </Step.Section>
        </Step.Body>

        <Step.Footer>
          <Step.Footer.Previous
            onClick={goPrev}
            isDisabled={isFirstStep}
          />
          <Step.Footer.Continue
            onClick={goNext}
            isDisabled={isLastStep || !domainsReady}
          />
        </Step.Footer>
      </Step>

      {removeDomainDialog}
    </Flow.Part>
  );
};
