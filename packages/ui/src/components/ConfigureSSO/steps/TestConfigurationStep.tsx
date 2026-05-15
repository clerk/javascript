import { __internal_useEnterpriseConnectionTestRuns, useUser } from '@clerk/shared/react/index';
import type { EnterpriseConnectionTestRunResource } from '@clerk/shared/types';
import type { ReactNode } from 'react';
import { useState } from 'react';

import type { LocalizationKey } from '@/customizables';
import {
  Badge,
  Box,
  Button,
  Dd,
  descriptors,
  Dl,
  Dt,
  Flex,
  Flow,
  Heading,
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
import { IconButton } from '@/elements/IconButton';
import { Pagination } from '@/elements/Pagination';
import { ProfileSection } from '@/elements/Section';
import { useClipboard } from '@/hooks';
import { Check, Copy, RotateLeftRight } from '@/icons';
import { common, mqu } from '@/styledSystem';
import { handleError } from '@/utils/errorHandler';

import { useConfigureSSO } from '../ConfigureSSOContext';
import { Step } from '../elements/Step';
import { useWizard } from '../elements/Wizard';
import { TestRunHowToFixSection } from './TestRunHowToFixSection';

const TEST_RUNS_PAGE_SIZE = 5;
const TEST_RESULTS_TABLE_COLUMN_COUNT = 3;

export const TestConfigurationStep = (): JSX.Element => {
  const { goNext, goPrev } = useWizard();
  const { enterpriseConnection } = useConfigureSSO();
  const card = useCardState();

  const [currentPage, setCurrentPage] = useState(1);

  const {
    data: testRuns,
    totalCount,
    isLoading: areTestRunsLoading,
    isPolling,
    revalidate: revalidateTestRuns,
  } = __internal_useEnterpriseConnectionTestRuns({
    enterpriseConnectionId: enterpriseConnection?.id ?? null,
    params: { initialPage: currentPage, pageSize: TEST_RUNS_PAGE_SIZE },
  });

  const pageCount = totalCount ? Math.ceil(totalCount / TEST_RUNS_PAGE_SIZE) : 0;

  const handleTestRunCreated = () => {
    setCurrentPage(1);
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
                isPolling={isPolling}
                isLoading={areTestRunsLoading}
                page={currentPage}
                pageCount={pageCount}
                pageSize={TEST_RUNS_PAGE_SIZE}
                totalCount={totalCount ?? 0}
                onPageChange={setCurrentPage}
                onTestRunCreated={handleTestRunCreated}
              />
            </ProfileSection.Root>
          </Step.Section>
        </Step.Body>

        {card.error ? (
          <Box
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
              {card.error}
            </Text>
          </Box>
        ) : null}

        <Step.Footer>
          <Step.Footer.Previous onClick={() => goPrev()} />
          <ContinueTestSsoStepButton
            enterpriseConnectionId={enterpriseConnection?.id}
            isConnectionActive={enterpriseConnection?.active}
            onContinue={() => void goNext()}
          />
        </Step.Footer>
      </Step>
    </Flow.Part>
  );
};

type ContinueTestSsoStepButtonProps = {
  enterpriseConnectionId: string | undefined;
  isConnectionActive: boolean | undefined;
  onContinue: () => void;
};

const ContinueTestSsoStepButton = ({
  enterpriseConnectionId,
  isConnectionActive,
  onContinue,
}: ContinueTestSsoStepButtonProps): JSX.Element => {
  const { user } = useUser();
  const { t } = useLocalizations();
  const card = useCardState();
  const [isValidating, setIsValidating] = useState(false);

  const handleContinue = async () => {
    if (!user || !enterpriseConnectionId) {
      return;
    }

    setIsValidating(true);
    card.setError(undefined);

    try {
      const result = await user.getEnterpriseConnectionTestRuns(enterpriseConnectionId, {
        initialPage: 1,
        pageSize: 1,
        status: ['success'],
      });

      if (result.data.length > 0) {
        onContinue();
      } else {
        card.setError(t(localizationKeys('configureSSO.testConfigurationStep.error__noSuccessfulTestRun')));
      }
    } catch (err) {
      handleError(err as Error, [], card.setError);
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <Step.Footer.Continue
      onClick={() => void handleContinue()}
      isLoading={isValidating}
      isDisabled={!enterpriseConnectionId || isConnectionActive}
    />
  );
};

type TestResultsTableProps = {
  rows: EnterpriseConnectionTestRunResource[];
  isLoading: boolean;
  isPolling: boolean;
  onTestRunCreated?: (testUrl: string) => void;
  page: number;
  pageCount: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number) => void;
};

const TestResultsTable = ({
  rows,
  isLoading,
  isPolling,
  onTestRunCreated,
  page,
  pageCount,
  pageSize,
  totalCount,
  onPageChange,
}: TestResultsTableProps): JSX.Element => {
  const { t } = useLocalizations();
  const { contentRef } = useConfigureSSO();
  const [selectedTestRun, setSelectedTestRun] = useState<EnterpriseConnectionTestRunResource | null>(null);

  const drawerTitle =
    selectedTestRun?.status === 'failed'
      ? selectedTestRun.logs?.[0]?.shortMessage ||
        t(localizationKeys('configureSSO.testConfigurationStep.testRunDetails.title'))
      : t(localizationKeys('configureSSO.testConfigurationStep.testRunDetails.title'));

  return (
    <>
      <Flex
        direction='col'
        sx={t => ({
          width: '100%',
          flex: '0 1 auto',
          minHeight: 0,
          overflowY: 'auto',
          borderWidth: t.borderWidths.$normal,
          borderStyle: t.borderStyles.$solid,
          borderColor: t.colors.$borderAlpha150,
          borderRadius: t.radii.$lg,
          ...common.unstyledScrollbar(t),
          [mqu.sm]: { overflowX: 'auto', padding: t.space.$0x25 },
        })}
      >
        <Table
          tableHeadVisuallyHidden={!rows.length}
          sx={t => ({
            background: t.colors.$colorBackground,
            '&&': {
              border: 'none',
              borderRadius: 0,
            },
          })}
        >
          <Thead>
            <Tr>
              <Th
                localizationKey={localizationKeys(
                  'configureSSO.testConfigurationStep.testRunDetails.runDetails.timestamp',
                )}
              />
              <Th
                localizationKey={localizationKeys(
                  'configureSSO.testConfigurationStep.testRunDetails.runDetails.sectionTitle',
                )}
              />
              <Th
                localizationKey={localizationKeys(
                  'configureSSO.testConfigurationStep.testRunDetails.runDetails.status',
                )}
              />
            </Tr>
          </Thead>
          <Tbody>
            {isLoading || isPolling ? (
              <Tr>
                <Td colSpan={TEST_RESULTS_TABLE_COLUMN_COUNT}>
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
                <Td colSpan={TEST_RESULTS_TABLE_COLUMN_COUNT}>
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

      {pageCount > 1 ? (
        <Box sx={{ flexShrink: 0 }}>
          <Pagination
            page={Math.min(page, pageCount)}
            count={pageCount}
            onChange={onPageChange}
            siblingCount={1}
            rowInfo={{
              allRowsCount: totalCount,
              startingRow: totalCount > 0 ? Math.max(0, (page - 1) * pageSize) + 1 : 0,
              endingRow: Math.min(page * pageSize, totalCount),
            }}
          />
        </Box>
      ) : null}

      <Drawer.Root
        open={selectedTestRun !== null}
        onOpenChange={open => {
          if (!open) {
            setSelectedTestRun(null);
          }
        }}
        strategy='absolute'
        portalProps={{ root: contentRef }}
      >
        <Drawer.Overlay />
        <Drawer.Content>
          <Drawer.Header title={drawerTitle} />
          {selectedTestRun ? <TestRunDetailsBody testRun={selectedTestRun} /> : null}
        </Drawer.Content>
      </Drawer.Root>
    </>
  );
};

const useTestRunFormattedTimestamp = (testRun: EnterpriseConnectionTestRunResource) => {
  const { locale } = useLocalizations();
  if (!testRun.createdAt) {
    return null;
  }
  const time = new Intl.DateTimeFormat(locale, { timeStyle: 'medium' }).format(testRun.createdAt);
  const day = new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric' }).format(testRun.createdAt);

  return { time, day };
};

const TestRunTimestampCell = ({ testRun }: { testRun: EnterpriseConnectionTestRunResource }): JSX.Element | null => {
  const formatted = useTestRunFormattedTimestamp(testRun);
  if (!formatted) {
    return null;
  }

  return (
    <Flex
      gap={2}
      align='baseline'
      sx={{ whiteSpace: 'nowrap' }}
    >
      <Text>{formatted.time}</Text>
      <Text colorScheme='secondary'>{formatted.day}</Text>
    </Flex>
  );
};

const DetailRow = ({ title, children }: { title: LocalizationKey; children: ReactNode }): JSX.Element => (
  <Box
    as='div'
    sx={t => ({
      display: 'grid',
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
      gap: t.space.$2,
    })}
  >
    <Dt
      localizationKey={title}
      sx={t => ({
        color: t.colors.$colorForeground,
        ...common.textVariants(t).subtitle,
      })}
    />
    <Dd
      sx={t => ({
        display: 'grid',
        justifyContent: 'end',
        color: t.colors.$colorForeground,
      })}
    >
      {children}
    </Dd>
  </Box>
);

const TestRunDetailsBody = ({ testRun }: { testRun: EnterpriseConnectionTestRunResource }): JSX.Element => {
  const formatted = useTestRunFormattedTimestamp(testRun);
  const failedLog = testRun.status === 'failed' ? testRun.logs?.[0] : null;

  return (
    <Drawer.Body
      sx={t => ({
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        overflowY: 'auto',
        padding: t.space.$4,
        gap: t.space.$4,
      })}
    >
      <Heading
        as='h3'
        textVariant='h3'
        localizationKey={localizationKeys('configureSSO.testConfigurationStep.testRunDetails.runDetails.sectionTitle')}
      />

      <Dl sx={t => ({ display: 'grid', gridRowGap: t.space.$2 })}>
        {formatted ? (
          <DetailRow title={localizationKeys('configureSSO.testConfigurationStep.testRunDetails.runDetails.timestamp')}>
            <Flex
              gap={2}
              align='baseline'
              sx={{ whiteSpace: 'nowrap' }}
            >
              <Text>{formatted.time}</Text>
              <Text colorScheme='secondary'>{formatted.day}</Text>
            </Flex>
          </DetailRow>
        ) : null}

        {testRun.status === 'failed' ? (
          failedLog?.code ? (
            <DetailRow
              title={localizationKeys('configureSSO.testConfigurationStep.testRunDetails.runDetails.errorCode')}
            >
              <Text sx={t => ({ fontFamily: t.fonts.$mono })}>{failedLog.code}</Text>
            </DetailRow>
          ) : null
        ) : (
          <DetailRow title={localizationKeys('configureSSO.testConfigurationStep.testRunDetails.runDetails.status')}>
            <TestRunStatusCell testRun={testRun} />
          </DetailRow>
        )}
      </Dl>

      {testRun.status === 'failed' && failedLog?.message ? <FullMessageBlock message={failedLog.message} /> : null}

      {testRun.status === 'failed' ? <TestRunHowToFixSection errorCode={failedLog?.code} /> : null}

      {testRun.status === 'success' ? <ParsedUserInfoSection parsedUserInfo={testRun.parsedUserInfo} /> : null}
    </Drawer.Body>
  );
};

const ParsedUserInfoSection = ({
  parsedUserInfo,
}: {
  parsedUserInfo: EnterpriseConnectionTestRunResource['parsedUserInfo'];
}): JSX.Element | null => {
  if (!parsedUserInfo?.emailAddress && !parsedUserInfo?.firstName) {
    return null;
  }

  return (
    <Flex
      direction='col'
      gap={3}
      sx={t => ({
        borderTopWidth: t.borderWidths.$normal,
        borderTopStyle: t.borderStyles.$solid,
        borderTopColor: t.colors.$borderAlpha100,
        paddingTop: t.space.$4,
      })}
    >
      <Heading
        as='h3'
        textVariant='h3'
        localizationKey={localizationKeys(
          'configureSSO.testConfigurationStep.testRunDetails.parsedUserInfo.sectionTitle',
        )}
      />

      <Dl sx={t => ({ display: 'grid', gridRowGap: t.space.$2 })}>
        {parsedUserInfo.emailAddress ? (
          <DetailRow title={localizationKeys('configureSSO.testConfigurationStep.testRunDetails.parsedUserInfo.email')}>
            <Text sx={t => ({ fontFamily: t.fonts.$mono })}>{parsedUserInfo.emailAddress}</Text>
          </DetailRow>
        ) : null}

        {parsedUserInfo.firstName ? (
          <DetailRow
            title={localizationKeys('configureSSO.testConfigurationStep.testRunDetails.parsedUserInfo.firstName')}
          >
            <Text sx={t => ({ fontFamily: t.fonts.$mono })}>{parsedUserInfo.firstName}</Text>
          </DetailRow>
        ) : null}
      </Dl>
    </Flex>
  );
};

const FullMessageBlock = ({ message }: { message: string }): JSX.Element => {
  const { t } = useLocalizations();
  const { onCopy, hasCopied } = useClipboard(message);
  const copyLabel = t(
    localizationKeys(
      hasCopied
        ? 'configureSSO.testConfigurationStep.testRunDetails.runDetails.actionLabel__copied'
        : 'configureSSO.testConfigurationStep.testRunDetails.runDetails.actionLabel__copy',
    ),
  );

  return (
    <Flex
      direction='col'
      gap={2}
    >
      <Flex
        justify='between'
        align='center'
        gap={4}
      >
        <Text
          colorScheme='secondary'
          localizationKey={localizationKeys('configureSSO.testConfigurationStep.testRunDetails.runDetails.fullMessage')}
        />
        <IconButton
          variant='ghost'
          colorScheme='neutral'
          size='xs'
          icon={hasCopied ? Check : Copy}
          aria-label={copyLabel}
          onClick={() => onCopy()}
        />
      </Flex>
      <Box
        as='pre'
        sx={t => ({
          margin: 0,
          padding: t.space.$3,
          backgroundColor: t.colors.$colorBackground,
          borderWidth: t.borderWidths.$normal,
          borderStyle: t.borderStyles.$solid,
          borderColor: t.colors.$borderAlpha150,
          borderRadius: t.radii.$md,
          boxShadow: t.shadows.$cardContentShadow,
          fontFamily: t.fonts.$mono,
          fontSize: t.fontSizes.$sm,
          color: t.colors.$colorForeground,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        })}
      >
        {message}
      </Box>
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
