import { useUser } from '@clerk/shared/react/index';
import { useState } from 'react';

import {
  Button,
  descriptors,
  Flex,
  Flow,
  Icon,
  localizationKeys,
  Spinner,
  Table,
  Tbody,
  Td,
  Text,
  Tr,
  useLocalizations,
} from '@/customizables';
import { useCardState } from '@/elements/contexts';
import { ProfileSection } from '@/elements/Section';
import { useClipboard } from '@/hooks';
import { Check, Copy } from '@/icons';
import { mqu } from '@/styledSystem';
import { handleError } from '@/utils/errorHandler';

import { useConfigureSSOFlow } from '../ConfigureSSOContext';
import { Step } from '../elements/Step';
import { useWizard } from '../elements/Wizard';

export const TestConfigurationStep = (): JSX.Element => {
  const { goNext, goPrev, isFirstStep, isLastStep } = useWizard();

  return (
    <Flow.Part part='testSso'>
      <Step
        elementDescriptor={descriptors.configureSSOStep}
        elementId={descriptors.configureSSOStep.setId('test')}
      >
        <Step.Header
          title={localizationKeys('configureSSO.testConfigurationStep.title')}
          description={localizationKeys('configureSSO.testConfigurationStep.subtitle')}
        />

        <Step.Body>
          <Step.Section
            sx={theme => ({
              borderBottomWidth: theme.borderWidths.$normal,
              borderBottomStyle: theme.borderStyles.$solid,
              borderBottomColor: theme.colors.$borderAlpha100,
            })}
          >
            <ProfileSection.Root
              title={localizationKeys('configureSSO.testConfigurationStep.testUrl.title')}
              id='testSsoUrl'
              centered={false}
              sx={t => ({
                borderTopWidth: 0,
                paddingTop: 0,
                paddingBottom: 0,
                flexDirection: 'column-reverse',
                gap: t.space.$1,
              })}
            >
              <Text
                colorScheme='secondary'
                localizationKey={localizationKeys('configureSSO.testConfigurationStep.testUrl.subtitle')}
              />
              <ProfileSection.Item
                id='testSsoUrl'
                sx={{ paddingInlineStart: 0 }}
              >
                <CopyTestUrlButton />
              </ProfileSection.Item>
            </ProfileSection.Root>
          </Step.Section>

          <Step.Section sx={{ flex: 1, minHeight: 0 }}>
            <ProfileSection.Root
              title={localizationKeys('configureSSO.testConfigurationStep.testResults.title')}
              id='testResults'
              centered={false}
              sx={t => ({
                borderTopWidth: 0,
                paddingTop: 0,
                paddingBottom: 0,
                flexDirection: 'column-reverse',
                gap: t.space.$2,
                flex: 1,
                minHeight: 0,
                '& > *:first-of-type': {
                  flex: 1,
                  minHeight: 0,
                },
              })}
            >
              <TestResultsTable
                rows={[]}
                // When test run has been created and we're waiting for the results, we show a loading state
                isLoading={false}
              />
            </ProfileSection.Root>
          </Step.Section>
        </Step.Body>

        <Step.Footer>
          <Step.Footer.Previous onClick={() => goPrev()} />
          {/* TODO - Only allow to continue if the test run has been created and there's at least one successful result */}
          <Step.Footer.Continue
            onClick={() => goNext()}
            isDisabled={isLastStep}
          />
        </Step.Footer>
      </Step>
    </Flow.Part>
  );
};

type TestResultRow = {
  id: string;
};

const TestResultsTable = ({ rows, isLoading }: { rows: TestResultRow[]; isLoading: boolean }): JSX.Element => {
  return (
    <Flex
      sx={t => ({
        width: '100%',
        flex: 1,
        minHeight: 0,
        [mqu.sm]: { overflowX: 'auto', padding: t.space.$0x25 },
      })}
    >
      <Table
        tableHeadVisuallyHidden
        sx={t => ({ background: t.colors.$colorBackground, height: '100%' })}
      >
        <Tbody>
          {isLoading ? (
            <Tr>
              <Td>
                <Flex
                  direction='col'
                  align='center'
                  gap={2}
                  sx={t => ({ padding: `${t.space.$10} 0` })}
                >
                  <Spinner
                    colorScheme='primary'
                    elementDescriptor={descriptors.spinner}
                  />
                  <Text
                    colorScheme='secondary'
                    localizationKey={localizationKeys('configureSSO.testConfigurationStep.testResults.loading')}
                  />
                </Flex>
              </Td>
            </Tr>
          ) : !rows.length ? (
            <Tr>
              <Td>
                <Flex
                  align='center'
                  justify='center'
                  sx={t => ({ padding: `${t.space.$10} 0`, flex: 1 })}
                >
                  <CopyTestUrlButton />
                </Flex>
              </Td>
            </Tr>
          ) : (
            rows.map(row => (
              <Tr key={row.id}>
                <Td>{row.id}</Td>
              </Tr>
            ))
          )}
        </Tbody>
      </Table>
    </Flex>
  );
};

const CopyTestUrlButton = (): JSX.Element => {
  const { t } = useLocalizations();
  const { user } = useUser();
  const card = useCardState();
  const { enterpriseConnection } = useConfigureSSOFlow();

  const [testUrl, setTestUrl] = useState('');
  const [isCreatingTestRun, setIsCreatingTestRun] = useState(false);
  const { onCopy, hasCopied } = useClipboard(testUrl);

  const createTestRun = () => {
    if (!user || !enterpriseConnection) {
      return;
    }

    setIsCreatingTestRun(true);

    user
      .createEnterpriseConnectionTestRun(enterpriseConnection.id)
      .then(({ url }) => {
        setTestUrl(url);
        onCopy();
      })
      .catch(err => handleError(err as Error, [], card.setError))
      .finally(() => setIsCreatingTestRun(false));
  };

  return (
    <Button
      id='testSsoUrl'
      variant='bordered'
      colorScheme='secondary'
      size='xs'
      onClick={createTestRun}
      isDisabled={isCreatingTestRun}
      isLoading={isCreatingTestRun}
      loadingText={t(localizationKeys('configureSSO.testConfigurationStep.testUrl.actionLabel__copy'))}
      sx={t => ({
        gap: t.space.$1x5,
      })}
    >
      <Icon
        icon={hasCopied ? Check : Copy}
        size='sm'
      />
      <Text
        as='span'
        localizationKey={localizationKeys('configureSSO.testConfigurationStep.testUrl.actionLabel__copy')}
      />
    </Button>
  );
};
