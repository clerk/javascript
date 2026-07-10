import type { EnterpriseConnectionTestRunResource } from '@clerk/shared/types';
import { useEffect, useRef } from 'react';

import { TEST_RUNS_PAGE_SIZE } from '@/components/ConfigureSSO/hooks/useEnterpriseConnectionTestRuns';

import { Box } from '../components/box';
import { Button } from '../components/button';
import { Heading } from '../components/heading';
import { Text } from '../components/text';
import type { OrganizationProfileSecurityWizardTestStep } from './organization-profile-security-panel.controller';

/**
 * The `test` step body, ported from the legacy `steps/TestConfigurationStep.tsx`. It owns its own
 * navigation (like the configure step): Continue sends `CONTINUE` to the machine (which validates
 * and bubbles to the outer wizard), and Back forwards to the outer wizard.
 *
 * The two async actions live in the machine (create-run, continue-validate); the results list,
 * pagination, and polling are hook-owned data threaded through `testRuns`. The manual "Refresh
 * logs" button calls `refresh()` with NO options so it never arms polling — only the machine's
 * injected `createTestRun` arms it.
 *
 * Deviation (approved): the rich results table, per-run drawer, timestamp formatting, and copy
 * affordances are deferred to the view overhaul. The functional slice preserved here is 1:1: open a
 * test URL (create + arm-poll + open), list the runs with their status, one-shot refresh, paginate,
 * and gate Continue on a successful run.
 */

export interface OrganizationProfileSecurityWizardTestViewProps {
  test: OrganizationProfileSecurityWizardTestStep;
}

export function OrganizationProfileSecurityWizardTestView({ test }: OrganizationProfileSecurityWizardTestViewProps) {
  const { snapshot, send, testRuns, onParentPrev } = test;

  // Reset the flow to idle on (re-)entry, matching the legacy step remounting fresh. Fires once per
  // mount — this view mounts/unmounts with the outer step.
  const entered = useRef(false);
  useEffect(() => {
    if (!entered.current) {
      entered.current = true;
      send({ type: 'ENTER' });
    }
  }, [send]);

  const { rows, totalCount, isLoading, isFetching, isPolling, page, setPage } = testRuns;
  const isCreatingRun = snapshot.value === 'creatingRun';
  // `validating` (probe in flight) and `bubblingNext` (advance deferred to the outer wizard) both
  // keep Continue loading, matching legacy's held button.
  const isContinuing = snapshot.value === 'validating' || snapshot.value === 'bubblingNext';
  const pageCount = totalCount ? Math.ceil(totalCount / TEST_RUNS_PAGE_SIZE) : 0;

  return (
    <Box sx={t => ({ display: 'flex', flexDirection: 'column', gap: t.spacing(4), minHeight: 0 })}>
      <Box sx={t => ({ display: 'flex', flexDirection: 'column', gap: t.spacing(2) })}>
        <Heading size='base'>Test your configuration</Heading>
        <Text
          render={p => <p {...p} />}
          intent='mutedForeground'
        >
          Open a test URL to run through the sign-in flow and confirm your connection works.
        </Text>
        <Button
          type='button'
          variant='outline'
          size='sm'
          disabled={isCreatingRun}
          onClick={() => send({ type: 'CREATE_RUN' })}
          sx={{ alignSelf: 'flex-start' }}
        >
          Open test URL
        </Button>
      </Box>

      <Box sx={t => ({ display: 'flex', flexDirection: 'column', gap: t.spacing(3), minHeight: 0 })}>
        <Box sx={t => ({ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: t.spacing(2) })}>
          <Text
            render={p => <span {...p} />}
            sx={t => ({ fontWeight: t.font.medium })}
          >
            Test results
          </Text>
          <Button
            type='button'
            variant='ghost'
            size='sm'
            // The one-shot refresh: NO options, so it never arms polling (only creating a run does).
            disabled={isFetching}
            onClick={() => void testRuns.refresh()}
          >
            Refresh logs
          </Button>
        </Box>

        <TestResults
          rows={rows}
          isLoading={isLoading}
          isPolling={isPolling}
        />

        {pageCount > 1 && (
          <Box sx={t => ({ display: 'flex', alignItems: 'center', gap: t.spacing(2) })}>
            <Button
              type='button'
              variant='outline'
              size='sm'
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              Previous page
            </Button>
            <Text
              render={p => <span {...p} />}
              intent='mutedForeground'
            >
              Page {Math.min(page, pageCount)} of {pageCount}
            </Text>
            <Button
              type='button'
              variant='outline'
              size='sm'
              disabled={page >= pageCount}
              onClick={() => setPage(page + 1)}
            >
              Next page
            </Button>
          </Box>
        )}
      </Box>

      {snapshot.context.error && (
        <Text
          render={p => (
            <p
              role='alert'
              {...p}
            />
          )}
          intent='destructive'
        >
          {snapshot.context.error}
        </Text>
      )}

      <Box sx={t => ({ display: 'flex', gap: t.spacing(2) })}>
        <Button
          type='button'
          variant='outline'
          size='sm'
          disabled={isContinuing}
          onClick={onParentPrev}
        >
          Back
        </Button>
        <Button
          type='button'
          size='sm'
          disabled={isContinuing}
          onClick={() => send({ type: 'CONTINUE' })}
        >
          Continue
        </Button>
      </Box>
    </Box>
  );
}

function TestResults({
  rows,
  isLoading,
  isPolling,
}: {
  rows: EnterpriseConnectionTestRunResource[];
  isLoading: boolean;
  isPolling: boolean;
}) {
  if (isLoading || isPolling) {
    return (
      <Box sx={t => ({ display: 'flex', alignItems: 'center', gap: t.spacing(2), padding: t.spacing(4) })}>
        <Text
          render={p => <span {...p} />}
          intent='mutedForeground'
        >
          {isPolling ? 'Waiting for the test run to complete…' : 'Loading test runs…'}
        </Text>
      </Box>
    );
  }

  if (rows.length === 0) {
    return (
      <Box
        sx={t => ({
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: t.spacing(1),
          padding: t.spacing(6),
          textAlign: 'center',
          border: `1px solid ${t.alpha('primary', 15)}`,
          borderRadius: t.rounded.lg,
        })}
      >
        <Text
          render={p => <span {...p} />}
          sx={t => ({ fontWeight: t.font.medium })}
        >
          No test runs yet
        </Text>
        <Text
          render={p => <span {...p} />}
          intent='mutedForeground'
        >
          Open a test URL to run through the sign-in flow.
        </Text>
      </Box>
    );
  }

  return (
    <Box
      sx={t => ({
        display: 'flex',
        flexDirection: 'column',
        gap: t.spacing(2),
        overflowY: 'auto',
        minHeight: 0,
        border: `1px solid ${t.alpha('primary', 15)}`,
        borderRadius: t.rounded.lg,
        padding: t.spacing(3),
      })}
    >
      {rows.map(run => (
        <Box
          key={run.id}
          sx={t => ({ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: t.spacing(2) })}
        >
          <Text
            render={p => <span {...p} />}
            intent='mutedForeground'
          >
            {run.parsedUserInfo?.emailAddress ?? run.logs?.[0]?.shortMessage ?? '—'}
          </Text>
          <Text
            render={p => <span {...p} />}
            intent={run.status === 'failed' ? 'destructive' : 'mutedForeground'}
          >
            {run.status}
          </Text>
        </Box>
      ))}
    </Box>
  );
}
