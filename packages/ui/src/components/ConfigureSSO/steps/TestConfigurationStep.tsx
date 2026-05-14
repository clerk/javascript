import { __internal_useEnterpriseConnectionTestRuns, useUser } from '@clerk/shared/react/index';
import type { EnterpriseConnectionTestRunResource } from '@clerk/shared/types';
import { useState } from 'react';

import {
  Badge,
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
  Th,
  Thead,
  Tr,
  useLocalizations,
} from '@/customizables';
import { useCardState } from '@/elements/contexts';
import { Drawer } from '@/elements/Drawer';
import { ProfileSection } from '@/elements/Section';
import { useClipboard } from '@/hooks';
import { Check, Copy, RotateLeftRight } from '@/icons';
import { mqu } from '@/styledSystem';
import { handleError } from '@/utils/errorHandler';

import { useConfigureSSO } from '../ConfigureSSOContext';
import { Step } from '../elements/Step';
import { useWizard } from '../elements/Wizard';

export const TestConfigurationStep = (): JSX.Element => {
  const { goNext, goPrev, isLastStep } = useWizard();
  const { enterpriseConnection } = useConfigureSSO();

  const {
    data: testRuns,
    latest,
    isLoading: areTestRunsLoading,
    isPolling,
    revalidate: revalidateTestRuns,
  } = __internal_useEnterpriseConnectionTestRuns({
    enterpriseConnectionId: enterpriseConnection?.id ?? null,
    params: { initialPage: 1, pageSize: 10 },
  });

  const hasSuccessfulTestRun = latest?.status === 'success';

  const handleTestRunCreated = () => {
    void revalidateTestRuns();
  };

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
                <Flex gap={2}>
                  <CopyTestUrlButton onTestRunCreated={handleTestRunCreated} />

                  <Button
                    variant='bordered'
                    colorScheme='secondary'
                    size='xs'
                    onClick={() => void revalidateTestRuns()}
                    isDisabled={areTestRunsLoading}
                    sx={t => ({ gap: t.space.$1x5 })}
                  >
                    <Icon
                      icon={RotateLeftRight}
                      size='sm'
                      colorScheme='neutral'
                    />
                    <Text
                      as='span'
                      localizationKey={localizationKeys(
                        'configureSSO.testConfigurationStep.testResults.actionLabel__refresh',
                      )}
                    />
                  </Button>
                </Flex>
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
                rows={testRuns ?? []}
                isLoading={areTestRunsLoading}
                onTestRunCreated={handleTestRunCreated}
                isPolling={isPolling}
              />
            </ProfileSection.Root>
          </Step.Section>
        </Step.Body>

        <Step.Footer>
          <Step.Footer.Previous onClick={() => goPrev()} />
          <Step.Footer.Continue
            onClick={() => goNext()}
            isDisabled={!hasSuccessfulTestRun || enterpriseConnection?.active}
          />
        </Step.Footer>
      </Step>
    </Flow.Part>
  );
};

type TestResultsTableProps = {
  rows: EnterpriseConnectionTestRunResource[];
  isLoading: boolean;
  isPolling: boolean;
  onTestRunCreated?: (testUrl: string) => void;
};

const TestResultsTable = ({ rows, isLoading, isPolling, onTestRunCreated }: TestResultsTableProps): JSX.Element => {
  const { t } = useLocalizations();
  const [selectedTestRun, setSelectedTestRun] = useState<EnterpriseConnectionTestRunResource | null>(null);

  const drawerTitle =
    selectedTestRun?.status === 'failed'
      ? selectedTestRun.logs?.[0]?.shortMessage ||
        t(localizationKeys('configureSSO.testConfigurationStep.testRunDetails.title'))
      : t(localizationKeys('configureSSO.testConfigurationStep.testRunDetails.title'));

  return (
    <>
      <Flex
        sx={t => ({
          width: '100%',
          minHeight: 0,
          [mqu.sm]: { overflowX: 'auto', padding: t.space.$0x25 },
        })}
      >
        <Table
          tableHeadVisuallyHidden={!rows.length}
          sx={t => ({ background: t.colors.$colorBackground, height: '100%' })}
        >
          <Thead>
            <Tr>
              <Th>Timestamp</Th>
              <Th>Details</Th>
              <Th>Status</Th>
            </Tr>
          </Thead>
          <Tbody>
            {isLoading || isPolling ? (
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
                      localizationKey={
                        isPolling
                          ? localizationKeys('configureSSO.testConfigurationStep.testResults.polling')
                          : undefined
                      }
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
                    <CopyTestUrlButton onTestRunCreated={onTestRunCreated} />
                  </Flex>
                </Td>
              </Tr>
            ) : (
              rows.map(row => (
                <Tr
                  key={row.id}
                  onClick={() => setSelectedTestRun(row)}
                  sx={t => ({
                    cursor: 'pointer',
                    '&:hover > td': {
                      backgroundColor: t.colors.$neutralAlpha50,
                    },
                  })}
                >
                  <Td>
                    <TestRunTimestampCell testRun={row} />
                  </Td>
                  <Td>
                    <TestRunDetailsCell testRun={row} />
                  </Td>
                  <Td>
                    <TestRunStatusCell testRun={row} />
                  </Td>
                </Tr>
              ))
            )}
          </Tbody>
        </Table>
      </Flex>

      <Drawer.Root
        open={selectedTestRun !== null}
        onOpenChange={open => {
          if (!open) {
            setSelectedTestRun(null);
          }
        }}
      >
        <Drawer.Overlay />
        <Drawer.Content>
          <Drawer.Header title={drawerTitle} />
          <Drawer.Body>{null}</Drawer.Body>
        </Drawer.Content>
      </Drawer.Root>
    </>
  );
};

const TestRunTimestampCell = ({ testRun }: { testRun: EnterpriseConnectionTestRunResource }): JSX.Element | null => {
  const { locale } = useLocalizations();

  if (!testRun.createdAt) {
    return null;
  }

  const time = new Intl.DateTimeFormat(locale, { timeStyle: 'medium' }).format(testRun.createdAt);
  const day = new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric' }).format(testRun.createdAt);

  return (
    <Flex
      gap={2}
      align='baseline'
      sx={{ whiteSpace: 'nowrap' }}
    >
      <Text>{time}</Text>
      <Text colorScheme='secondary'>{day}</Text>
    </Flex>
  );
};

const TestRunDetailsCell = ({ testRun }: { testRun: EnterpriseConnectionTestRunResource }): JSX.Element | null => {
  if (testRun.status === 'pending') {
    return (
      <Flex sx={t => ({ fontFamily: t.fonts.$mono })}>
        <Text>-</Text>
      </Flex>
    );
  }

  if (testRun.status === 'success') {
    return (
      <Flex sx={t => ({ fontFamily: t.fonts.$mono })}>
        <Text>{testRun.parsedUserInfo?.emailAddress}</Text>
      </Flex>
    );
  }

  return (
    <Flex sx={t => ({ fontFamily: t.fonts.$mono })}>
      <Text>{testRun.logs?.[0]?.shortMessage}</Text>
    </Flex>
  );
};

const TestRunStatusCell = ({ testRun }: { testRun: EnterpriseConnectionTestRunResource }): JSX.Element => {
  if (testRun.status === 'success') {
    return (
      <Badge
        colorScheme='success'
        localizationKey={localizationKeys('configureSSO.testConfigurationStep.testResults.status__success')}
      />
    );
  }
  if (testRun.status === 'failed') {
    return (
      <Badge
        colorScheme='danger'
        localizationKey={localizationKeys('configureSSO.testConfigurationStep.testResults.status__failed')}
      />
    );
  }
  return (
    <Badge
      colorScheme='warning'
      localizationKey={localizationKeys('configureSSO.testConfigurationStep.testResults.status__pending')}
    />
  );
};

type CopyTestUrlButtonProps = {
  /** Called once a new test run has been created and copied to the clipboard, with the generated test URL. */
  onTestRunCreated?: (testUrl: string) => void;
};

const CopyTestUrlButton = ({ onTestRunCreated }: CopyTestUrlButtonProps): JSX.Element => {
  const { t } = useLocalizations();
  const { user } = useUser();
  const card = useCardState();
  const { enterpriseConnection } = useConfigureSSO();

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
        onTestRunCreated?.(url);
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
        colorScheme='neutral'
      />
      <Text
        as='span'
        localizationKey={localizationKeys('configureSSO.testConfigurationStep.testUrl.actionLabel__copy')}
      />
    </Button>
  );
};
