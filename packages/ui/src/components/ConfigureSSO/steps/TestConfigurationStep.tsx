import type { EnterpriseConnectionTestRunResource } from '@clerk/shared/types';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';

import type { LocalizationKey } from '@/customizables';
import {
  Badge,
  Box,
  Button,
  Col,
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
import { useClipboard, useSpinDelay } from '@/hooks';
import { Checkmark, Copy, Link as LinkIcon, RotateLeftRight } from '@/icons';
import { common, mqu } from '@/styledSystem';
import { handleError } from '@/utils/errorHandler';

import { useConfigureSSO } from '../ConfigureSSOContext';
import { Step } from '../elements/Step';
import { useWizard } from '../elements/Wizard';
import { TEST_RUNS_PAGE_SIZE } from '../hooks/useEnterpriseConnectionTestRuns';
import { TestRunHowToFixSection } from './TestRunHowToFixSection';

const TEST_RESULTS_TABLE_COLUMN_COUNT = 3;

export const TestConfigurationStep = (): JSX.Element => {
  const { goPrev, isInitialStep } = useWizard();
  const { organizationEnterpriseConnection: c, testRuns } = useConfigureSSO();
  const card = useCardState();

  const {
    rows,
    totalCount,
    isLoading: areTestRunsLoading,
    isFetching: areTestRunsFetching,
    isPolling,
    page: currentPage,
    setPage: setCurrentPage,
    refresh: refreshTestRuns,
  } = testRuns;

  // The test-runs source activates itself upstream the moment the connection is
  // configured (the same condition that makes this step reachable), so the step
  // no longer has to wake it on entry — by the time we land here it is already
  // live.
  //
  // The wizard's initial load already fetched the test-runs (covered by the
  // full skeleton) for the existing-connection case, so landing on the test
  // step on that first load must NOT refetch. Navigating INTO the step later
  // (forward, back, or breadcrumb) should refetch so the table reflects any run
  // kicked off elsewhere — that refetch surfaces as the table-level `isFetching`
  // spinner, never the full skeleton.
  //
  // The step only mounts while it is the current step, so this runs once per
  // entry. `isInitialStep` is the wizard's own "no navigation yet" signal, read
  // at mount: this fires a mount-driven data refresh, it is NOT syncing state
  // via an effect. Empty deps → mount-only, so re-renders never re-fire.
  useEffect(() => {
    if (!isInitialStep) {
      void refreshTestRuns();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isRefreshingTestRuns = areTestRunsFetching && !areTestRunsLoading;
  const showRefreshLogsSpinner = useSpinDelay(isRefreshingTestRuns);
  const pageCount = totalCount ? Math.ceil(totalCount / TEST_RUNS_PAGE_SIZE) : 0;

  const handleTestRunCreated = () => {
    setCurrentPage(1);
    // Refetch the single source: the visible list (so the new run shows up and
    // polling arms) and the success probe (so the derived state's
    // `hasSuccessfulTestRun` and the Continue gate reflect the run that just
    // completed).
    void refreshTestRuns();
  };

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
                localizationKey={localizationKeys('configureSSO.testConfigurationStep.subtitle')}
              />

              <OpenTestUrlButton onTestRunCreated={handleTestRunCreated} />
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
                onClick={() => void refreshTestRuns()}
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

            <Col sx={{ flex: 1, minHeight: 0 }}>
              <TestResultsTable
                rows={rows}
                isPolling={isPolling}
                isLoading={areTestRunsLoading}
                page={currentPage}
                pageCount={pageCount}
                pageSize={TEST_RUNS_PAGE_SIZE}
                totalCount={totalCount ?? 0}
                onPageChange={setCurrentPage}
              />
            </Col>
          </Step.Section>
        </Step.Body>

        {card.error ? (
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
              {card.error}
            </Text>
          </Box>
        ) : null}

        <Step.Footer>
          <Step.Footer.Reset />
          <Step.Footer.Previous onClick={() => goPrev()} />
          <ContinueTestSsoStepButton hasSuccessfulTestRun={c.hasSuccessfulTestRun} />
        </Step.Footer>
      </Step>
    </Flow.Part>
  );
};

type ContinueTestSsoStepButtonProps = {
  hasSuccessfulTestRun: boolean;
};

const ContinueTestSsoStepButton = ({ hasSuccessfulTestRun }: ContinueTestSsoStepButtonProps): JSX.Element => {
  const { t } = useLocalizations();
  const card = useCardState();
  const { goNext } = useWizard();

  // The button stays enabled so a user without a successful run still gets the
  // inline validation message (matching legacy), rather than a silently
  // disabled Continue. On success we advance; otherwise we surface the error
  // and stay put.
  const handleContinue = (): void => {
    if (hasSuccessfulTestRun) {
      card.setError(undefined);
      goNext();
      return;
    }
    card.setError(t(localizationKeys('configureSSO.testConfigurationStep.error__noSuccessfulTestRun')));
  };

  return <Step.Footer.Continue onClick={handleContinue} />;
};

type TestResultsTableProps = {
  rows: EnterpriseConnectionTestRunResource[];
  isLoading: boolean;
  isPolling: boolean;
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
          elementDescriptor={descriptors.configureSSOTestResultsTable}
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
                      elementDescriptor={descriptors.configureSSOTestResultsLoadingSpinner}
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
                    elementDescriptor={descriptors.configureSSOTestResultsEmpty}
                    direction='col'
                    align='center'
                    justify='center'
                    sx={t => ({
                      padding: `${t.space.$10} 0`,
                      flex: 1,
                      gap: t.space.$1,
                      textAlign: 'center',
                    })}
                  >
                    <Text
                      variant='subtitle'
                      localizationKey={localizationKeys('configureSSO.testConfigurationStep.testResults.empty.title')}
                    />
                    <Text
                      colorScheme='secondary'
                      localizationKey={localizationKeys(
                        'configureSSO.testConfigurationStep.testResults.empty.subtitle',
                      )}
                    />
                  </Flex>
                </Td>
              </Tr>
            ) : (
              rows.map(row => (
                <Tr
                  key={row.id}
                  elementDescriptor={descriptors.configureSSOTestResultsRow}
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
      elementDescriptor={descriptors.configureSSOTestRunParsedUserInfo}
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
          elementDescriptor={descriptors.configureSSOTestRunFullMessageCopyButton}
          variant='ghost'
          colorScheme='neutral'
          size='xs'
          icon={hasCopied ? Checkmark : Copy}
          aria-label={copyLabel}
          onClick={() => onCopy()}
        />
      </Flex>
      <Box
        elementDescriptor={descriptors.configureSSOTestRunFullMessage}
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
        elementDescriptor={descriptors.configureSSOTestRunStatusBadge}
        elementId={descriptors.configureSSOTestRunStatusBadge.setId('success')}
        colorScheme='success'
        localizationKey={localizationKeys('configureSSO.testConfigurationStep.testResults.status__success')}
      />
    );
  }
  if (testRun.status === 'failed') {
    return (
      <Badge
        elementDescriptor={descriptors.configureSSOTestRunStatusBadge}
        elementId={descriptors.configureSSOTestRunStatusBadge.setId('failed')}
        colorScheme='danger'
        localizationKey={localizationKeys('configureSSO.testConfigurationStep.testResults.status__failed')}
      />
    );
  }
  return (
    <Badge
      elementDescriptor={descriptors.configureSSOTestRunStatusBadge}
      elementId={descriptors.configureSSOTestRunStatusBadge.setId('pending')}
      colorScheme='warning'
      localizationKey={localizationKeys('configureSSO.testConfigurationStep.testResults.status__pending')}
    />
  );
};

type OpenTestUrlButtonProps = {
  onTestRunCreated?: (testUrl: string) => void;
};

const OpenTestUrlButton = ({ onTestRunCreated }: OpenTestUrlButtonProps): JSX.Element => {
  const card = useCardState();
  const {
    enterpriseConnection,
    mutations: { createTestRun },
  } = useConfigureSSO();

  const [isCreatingTestRun, setIsCreatingTestRun] = useState(false);

  const openTestRun = () => {
    if (!enterpriseConnection) {
      return;
    }

    setIsCreatingTestRun(true);

    createTestRun(enterpriseConnection.id)
      .then(({ url }) => {
        onTestRunCreated?.(url);
        // `noopener,noreferrer` so the IdP can't reach back into the dashboard
        // via `window.opener` once it lands the SAML response.
        window.open(url, '_blank', 'noopener,noreferrer');
      })
      .catch(err => handleError(err as Error, [], card.setError))
      .finally(() => setIsCreatingTestRun(false));
  };

  return (
    <Button
      elementDescriptor={descriptors.configureSSOTestUrlOpenButton}
      id='testSsoUrl'
      variant='bordered'
      colorScheme='secondary'
      size='xs'
      onClick={openTestRun}
      isDisabled={isCreatingTestRun}
      sx={t => ({ gap: t.space.$1x5, width: 'fit-content' })}
    >
      {isCreatingTestRun ? (
        <Spinner
          elementDescriptor={descriptors.spinner}
          size='sm'
        />
      ) : (
        <Icon
          icon={LinkIcon}
          size='sm'
          colorScheme='neutral'
        />
      )}
      <Text
        as='span'
        localizationKey={localizationKeys('configureSSO.testConfigurationStep.testUrl.actionLabel__open')}
      />
    </Button>
  );
};
