import type { ReactNode } from 'react';

import { Box, Button, Col, descriptors, Flex, Flow, Icon, localizationKeys, Spinner, Text } from '@/customizables';
import { RotateLeftRight } from '@/icons';

import { Step } from '../elements/Step';
import type { useTestConfigurationStepController } from './test-configuration-step.controller';

type TestConfigurationStepViewProps = Pick<
  ReturnType<typeof useTestConfigurationStepController>,
  'error' | 'goPrev' | 'showRefreshLogsSpinner' | 'handleRefreshTestRuns'
> & {
  openTestUrlButton: ReactNode;
  testResultsTable: ReactNode;
  continueButton: ReactNode;
};

export const TestConfigurationStepView = ({
  error,
  goPrev,
  showRefreshLogsSpinner,
  handleRefreshTestRuns,
  openTestUrlButton,
  testResultsTable,
  continueButton,
}: TestConfigurationStepViewProps): JSX.Element => {
  return (
    <Flow.Part part='testSso'>
      <Step
        elementDescriptor={descriptors.configureSSOStep}
        elementId={descriptors.configureSSOStep.setId('test')}
      >
        <Step.Header title={localizationKeys('configureSSO.testConfigurationStep.title')} />

        <Step.Body>
          <Step.Section
            sx={theme => ({
              borderBottomWidth: theme.borderWidths.$normal,
              borderBottomStyle: theme.borderStyles.$solid,
              borderBottomColor: theme.colors.$borderAlpha100,
            })}
          >
            <Col gap={3}>
              <Text
                as='p'
                colorScheme='secondary'
                localizationKey={localizationKeys('configureSSO.testConfigurationStep.subtitle')}
              />

              {openTestUrlButton}
            </Col>
          </Step.Section>

          <Step.Section sx={t => ({ flex: 1, minHeight: 0, gap: t.space.$3 })}>
            <Flex
              align='center'
              justify='between'
              sx={t => ({ gap: t.space.$2, flexShrink: 0 })}
            >
              <Text
                variant='subtitle'
                localizationKey={localizationKeys('configureSSO.testConfigurationStep.testResults.title')}
              />
              <Button
                elementDescriptor={descriptors.configureSSOTestRefreshButton}
                variant='bordered'
                colorScheme='secondary'
                size='xs'
                onClick={handleRefreshTestRuns}
                isDisabled={showRefreshLogsSpinner}
                sx={t => ({ gap: t.space.$1x5 })}
              >
                {showRefreshLogsSpinner ? (
                  <Spinner
                    elementDescriptor={descriptors.spinner}
                    size='xs'
                  />
                ) : (
                  <Icon
                    icon={RotateLeftRight}
                    size='sm'
                    colorScheme='neutral'
                  />
                )}
                <Text
                  as='span'
                  localizationKey={localizationKeys(
                    'configureSSO.testConfigurationStep.testResults.actionLabel__refresh',
                  )}
                />
              </Button>
            </Flex>

            <Col sx={{ flex: 1, minHeight: 0 }}>{testResultsTable}</Col>
          </Step.Section>
        </Step.Body>

        {error ? (
          <Box
            elementDescriptor={descriptors.configureSSOTestError}
            sx={t => ({
              flexShrink: 0,
              paddingInline: t.space.$5,
              paddingBlock: t.space.$3,
              borderTopWidth: t.borderWidths.$normal,
              borderTopStyle: t.borderStyles.$solid,
              borderTopColor: t.colors.$borderAlpha100,
            })}
          >
            <Text
              as='p'
              variant='body'
              sx={t => ({ color: t.colors.$danger500, fontSize: t.fontSizes.$sm })}
            >
              {error}
            </Text>
          </Box>
        ) : null}

        <Step.Footer>
          <Step.Footer.Reset />
          <Step.Footer.Previous onClick={goPrev} />
          {continueButton}
        </Step.Footer>
      </Step>
    </Flow.Part>
  );
};
