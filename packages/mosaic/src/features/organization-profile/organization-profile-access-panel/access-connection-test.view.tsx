import * as stylex from '@stylexjs/stylex';

import { Badge } from '../../../components/badge';
import { Button, SubmitButton } from '../../../components/button';
import { CopyButton } from '../../../components/copy-button';
import type { UseFormResult } from '../../../components/form';
import { Icon } from '../../../components/icon';
import { Link } from '../../../components/link';
import { Section } from '../../../components/section';
import { Separator } from '../../../components/separator';
import { Table } from '../../../components/table';
import { RotateAntiClockwise } from '../../../icons/glyphs/rotate-anti-clockwise';
import { useMessages } from '../../../localization';
import { themeProps } from '../../../props';
import { styles } from './access.styles';
import type {
  AccessData,
  AccessProvider,
  ConnectionConfiguration,
  ConnectionKind,
  ConnectionTestResult,
} from './access.types';
import { connectionAttributes } from './access.utils';
import { StepTitle } from './access-fields.view';

interface ConnectionTestProps {
  form: UseFormResult<ConnectionConfiguration>;
  kind: ConnectionKind;
  pending: boolean;
  onStartTest?: () => void;
  testUrl: string;
  onTest: () => void;
  result?: ConnectionTestResult | null;
  testing: boolean;
  error?: string;
  data: AccessData;
}

export function AccessConnectionTest({
  data,
  kind,
  form,
  result,
  pending,
  testUrl,
  onStartTest,
  onTest,
  testing,
  error,
}: ConnectionTestProps) {
  const link = testUrl || data.serviceProvider?.testUrl;
  const m = useMessages('organizationProfile').access;
  return (
    <>
      <StepTitle description={kind === 'directory' ? m.directoryTest : m.testDescription}>
        {kind === 'sso' ? m.testYourConnection : m.test}
      </StepTitle>
      <div {...stylex.props(styles.stepContent)}>
        {onStartTest ? (
          <Button
            type='button'
            disabled={pending}
            onClick={onStartTest}
          >
            {m.startTest}
          </Button>
        ) : null}
        {kind === 'sso' && link ? (
          <div {...stylex.props(styles.row)}>
            <CopyButton
              label={m.copyTestUrl}
              copiedLabel={m.copied}
              value={link}
              variant='outline'
              size='md'
            />
            <Link
              href={link}
              target='_blank'
              rel='noreferrer'
              {...themeProps('access-test-link')}
              xstyle={styles.fit}
            >
              {m.openTest}
            </Link>
          </div>
        ) : null}
        <Separator />
        <div {...stylex.props(styles.row)}>
          <Section.Title>{m.testResults}</Section.Title>
          <SubmitButton
            variant='outline'
            color='neutral'
            type='button'
            isPending={testing}
            disabled={pending || (data.live && kind === 'sso' && !testUrl)}
            xstyle={styles.headerActions}
            onClick={onTest}
          >
            <Icon glyph={RotateAntiClockwise} />
            {m.runTest}
          </SubmitButton>
        </div>
        <Section.Error>{error}</Section.Error>
        {result?.pending ? (
          <Section.Description role='status'>{kind === 'sso' ? m.testPending : m.waitingForUsers}</Section.Description>
        ) : null}
        {result && !result.pending ? (
          <TestResult
            result={result}
            kind={kind}
            provider={form.values.provider}
            showTroubleshooting={kind === 'sso' && !data.live}
          />
        ) : null}
      </div>
    </>
  );
}

function TestResult({
  result,
  kind,
  provider,
  showTroubleshooting,
}: {
  result: ConnectionTestResult;
  kind: ConnectionKind;
  provider: AccessProvider;
  showTroubleshooting: boolean;
}) {
  const m = useMessages('organizationProfile').access;
  const rows = connectionAttributes(kind, provider);
  return (
    <>
      <div role='status'>
        <Badge color={result.success ? 'positive' : 'negative'}>{result.success ? m.passed : m.failed}</Badge>
      </div>
      <Section.Body>
        <div {...stylex.props(styles.fields)}>
          {result.success ? null : showTroubleshooting ? (
            <ConnectionTestFailure provider={provider} />
          ) : (
            <Section.Error>{result.failureMessage ?? m.testError}</Section.Error>
          )}
          <Section.Title>{m.dataReceived}</Section.Title>
          <Table.Root aria-label={m.received}>
            <Table.Header>
              <Table.Column>{m.fromProvider}</Table.Column>
              <Table.Column>{m.mapsTo}</Table.Column>
              <Table.Column>{m.received}</Table.Column>
            </Table.Header>
            <Table.Body
              items={rows}
              itemToStringValue={item => item.name}
            >
              {item => (
                <Table.Row key={item.name}>
                  <Table.Cell>{item.name}</Table.Cell>
                  <Table.Cell>{m[item.field]}</Table.Cell>
                  <Table.Cell>{result[item.field] ?? m.notProvided}</Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
          </Table.Root>
        </div>
      </Section.Body>
    </>
  );
}

function ConnectionTestFailure({ provider }: { provider: AccessProvider }) {
  const m = useMessages('organizationProfile').access;
  return (
    <>
      <Section.Title>{m.errorTitle}</Section.Title>
      <Section.Error>{provider === 'oidc' ? m.missingOidcEmail : m.missingEmail}</Section.Error>
      <Separator />
      <Section.Title>{m.howToFix}</Section.Title>
      <Section.Description xstyle={styles.stepDescription}>{m.fixDescription}</Section.Description>
      <ol {...stylex.props(styles.instructionsList)}>
        <li>{provider === 'oidc' ? m.oidcFixStepOne : m.fixStepOne}</li>
        <li>{provider === 'oidc' ? m.oidcFixStepTwo : m.fixStepTwo}</li>
        {provider !== 'oidc' ? <li>{m.fixStepThree}</li> : null}
      </ol>
      <Link
        href={
          provider === 'okta'
            ? 'https://clerk.com/docs/guides/configure/auth-strategies/enterprise-connections/saml/okta'
            : 'https://clerk.com/docs/guides/configure/auth-strategies/enterprise-connections'
        }
        target='_blank'
        rel='noreferrer'
        xstyle={styles.fit}
      >
        {m.viewDocumentation}
      </Link>
      <Separator />
    </>
  );
}
