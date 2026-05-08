import { useUser } from '@clerk/shared/react';
import React from 'react';

import { Box, Button, Col, descriptors, Flex, Flow, Icon, Spinner, Text } from '@/customizables';
import { useCardState } from '@/elements/contexts';
import { useClipboard } from '@/hooks';
import { Check, CheckCircle, Copy } from '@/icons';
import { handleError } from '@/utils/errorHandler';

import { useConfigureSSOFlow } from '../ConfigureSSOContext';
import { useConfigureSSOWizard, useRegisterContinueAction } from '../wizard';
import { StepLayout } from './StepLayout';

const POLL_INTERVAL_MS = 3_000;

export const TestConfigurationStep = (): JSX.Element => {
  const { goNext } = useConfigureSSOWizard();
  const { enterpriseConnection } = useConfigureSSOFlow();
  const { user } = useUser();
  const card = useCardState();

  const [testUrl, setTestUrl] = React.useState<string>('');
  const [isCreatingTestRun, setIsCreatingTestRun] = React.useState(false);
  const [hasSuccessfulRun, setHasSuccessfulRun] = React.useState(false);
  const [isPolling, setIsPolling] = React.useState(false);
  const initRef = React.useRef(false);

  // Create the test URL once on mount
  React.useEffect(() => {
    if (initRef.current || !user || !enterpriseConnection) {
      return;
    }
    initRef.current = true;
    setIsCreatingTestRun(true);
    card.setError(undefined);

    user
      .createEnterpriseConnectionTestRun(enterpriseConnection.id)
      .then(({ url }) => setTestUrl(url))
      .catch(err => handleError(err as Error, [], card.setError))
      .finally(() => setIsCreatingTestRun(false));
    // `card` is intentionally omitted: `useCardState()` returns a new
    // object every render, which would refire this effect needlessly.
    // `initRef` already guards against duplicate test-run creation
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, enterpriseConnection]);

  // Poll for a successful test run while we're still on this step
  React.useEffect(() => {
    if (!user || !enterpriseConnection || !testUrl || hasSuccessfulRun) {
      return;
    }

    let cancelled = false;
    setIsPolling(true);

    const poll = async () => {
      try {
        const result = await user.getEnterpriseConnectionTestRuns(enterpriseConnection.id, {
          status: ['success'],
          pageSize: 1,
        });
        if (cancelled) {
          return;
        }
        if (result.data.length > 0) {
          setHasSuccessfulRun(true);
          setIsPolling(false);
        }
      } catch {
        // Network blips are expected while polling; surface only persistent
        // errors via the card error from the initial create call
      }
    };

    void poll();
    const id = window.setInterval(() => {
      void poll();
    }, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      window.clearInterval(id);
      setIsPolling(false);
    };
  }, [user, enterpriseConnection, testUrl, hasSuccessfulRun]);

  useRegisterContinueAction({
    handler: () => goNext(),
    isDisabled: !hasSuccessfulRun,
  });

  return (
    <Flow.Part part='test-sso'>
      <StepLayout
        title='Test your SSO connection'
        subtitle='Test your SSO configuration to verify you can successfully authenticate via your identity provider.'
      >
        <Col sx={t => ({ gap: t.space.$5, paddingBlockEnd: t.space.$4 })}>
          <Col sx={t => ({ gap: t.space.$2 })}>
            <Text
              as='p'
              sx={t => ({ color: t.colors.$colorForeground, fontWeight: t.fontWeights.$semibold })}
            >
              Test your SSO
            </Text>
            <Text
              as='p'
              variant='body'
              sx={t => ({ color: t.colors.$colorMutedForeground })}
            >
              Authenticate using the test URL below, in an incognito tab, to verify you configured the connection
              correctly.
            </Text>

            <CopyTestUrlButton
              url={testUrl}
              isLoading={isCreatingTestRun}
            />
          </Col>

          <Col sx={t => ({ gap: t.space.$2 })}>
            <Text
              as='p'
              sx={t => ({ color: t.colors.$colorForeground, fontWeight: t.fontWeights.$semibold })}
            >
              Your test results
            </Text>
            <TestResultsBox
              hasSuccessfulRun={hasSuccessfulRun}
              isPolling={isPolling}
              isCreatingTestRun={isCreatingTestRun}
              hasError={Boolean(card.error)}
              errorMessage={card.error ?? undefined}
            />
          </Col>
        </Col>
      </StepLayout>
    </Flow.Part>
  );
};

interface CopyTestUrlButtonProps {
  url: string;
  isLoading: boolean;
}

const CopyTestUrlButton = ({ url, isLoading }: CopyTestUrlButtonProps): JSX.Element => {
  const { onCopy, hasCopied } = useClipboard(url);

  return (
    <Button
      elementDescriptor={descriptors.button}
      variant='outline'
      size='sm'
      isDisabled={!url || isLoading}
      onClick={onCopy}
      sx={t => ({
        gap: t.space.$1x5,
        alignSelf: 'flex-start',
      })}
    >
      <Icon
        icon={hasCopied ? Check : Copy}
        size='sm'
      />
      {isLoading ? 'Generating test URL…' : hasCopied ? 'Copied' : 'Copy test URL'}
    </Button>
  );
};

interface TestResultsBoxProps {
  hasSuccessfulRun: boolean;
  isPolling: boolean;
  isCreatingTestRun: boolean;
  hasError: boolean;
  errorMessage?: string;
}

const TestResultsBox = ({
  hasSuccessfulRun,
  isPolling,
  isCreatingTestRun,
  hasError,
  errorMessage,
}: TestResultsBoxProps): JSX.Element => {
  return (
    <Flex
      align='center'
      justify='center'
      sx={t => ({
        minHeight: t.sizes.$36,
        padding: t.space.$5,
        borderRadius: t.radii.$md,
        borderWidth: t.borderWidths.$normal,
        borderStyle: t.borderStyles.$solid,
        borderColor: t.colors.$borderAlpha150,
        backgroundColor: t.colors.$neutralAlpha25,
      })}
    >
      {hasSuccessfulRun ? (
        <Col
          align='center'
          sx={t => ({ gap: t.space.$2, textAlign: 'center' })}
        >
          <Icon
            icon={CheckCircle}
            sx={t => ({ width: t.sizes.$8, height: t.sizes.$8, color: t.colors.$success500 })}
          />
          <Text
            as='p'
            sx={t => ({ color: t.colors.$colorForeground, fontWeight: t.fontWeights.$semibold })}
          >
            Test successful
          </Text>
          <Text
            as='p'
            variant='body'
            sx={t => ({ color: t.colors.$colorMutedForeground })}
          >
            Continue to enable the connection.
          </Text>
        </Col>
      ) : hasError ? (
        <Col
          align='center'
          sx={t => ({ gap: t.space.$1, textAlign: 'center' })}
        >
          <Text
            as='p'
            sx={t => ({ color: t.colors.$danger500, fontWeight: t.fontWeights.$semibold })}
          >
            Could not start a test
          </Text>
          {errorMessage ? (
            <Text
              as='p'
              variant='body'
              sx={t => ({ color: t.colors.$colorMutedForeground })}
            >
              {errorMessage}
            </Text>
          ) : null}
        </Col>
      ) : (
        <Col
          align='center'
          sx={t => ({ gap: t.space.$2, textAlign: 'center' })}
        >
          <Box>
            <Spinner
              size='sm'
              colorScheme='neutral'
            />
          </Box>
          <Text
            as='p'
            variant='body'
            sx={t => ({ color: t.colors.$colorMutedForeground })}
          >
            {isCreatingTestRun
              ? 'Preparing a test URL for you…'
              : isPolling
                ? 'Waiting for a successful sign-in via the test URL…'
                : 'Waiting for the test to start…'}
          </Text>
        </Col>
      )}
    </Flex>
  );
};
