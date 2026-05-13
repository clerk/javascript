import { descriptors, Flex, Flow, Icon, Spinner, Table, Tbody, Td, Text, Tr } from '@/customizables';
import { ProfileSection } from '@/elements/Section';
import { useClipboard } from '@/hooks';
import { Check, Copy } from '@/icons';
import { mqu } from '@/styledSystem';

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
          title='Test your SSO connection'
          description='Test your SSO configuration to verify you can successfully authenticate via your identity provider'
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
              title='Test your SSO URL'
              id='testSsoUrl'
              centered={false}
              sx={t => ({
                borderTopWidth: 0,
                paddingTop: 0,
                paddingBottom: 0,
                flexDirection: 'column-reverse',
                gap: t.space.$2,
              })}
            >
              <Text colorScheme='secondary'>
                Authenticate using the test SSO URL to verify you configured the connection correctly.
              </Text>
              <ProfileSection.Item
                id='testSsoUrl'
                sx={{ paddingInlineStart: 0 }}
              >
                <CopyTestUrlButton
                  url=''
                  isLoading={false}
                />
              </ProfileSection.Item>
            </ProfileSection.Root>
          </Step.Section>

          <Step.Section>
            <ProfileSection.Root
              title='Your test results'
              id='testResults'
              centered={false}
              sx={t => ({
                borderTopWidth: 0,
                paddingTop: 0,
                paddingBottom: 0,
                flexDirection: 'column-reverse',
                gap: t.space.$2,
              })}
            >
              <TestResultsTable
                rows={[]}
                isLoading
              />
            </ProfileSection.Root>
          </Step.Section>
        </Step.Body>

        <Step.Footer>
          <Step.Footer.Previous
            onClick={() => goPrev()}
            isDisabled={isFirstStep}
          />
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
    <Flex sx={t => ({ width: '100%', [mqu.sm]: { overflowX: 'auto', padding: t.space.$0x25 } })}>
      <Table sx={t => ({ background: t.colors.$colorBackground })}>
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
                  <Text colorScheme='secondary'>loading logs</Text>
                </Flex>
              </Td>
            </Tr>
          ) : !rows.length ? (
            <EmptyTestResultsRow />
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

const EmptyTestResultsRow = (): JSX.Element => {
  return (
    <Tr>
      <Td>
        <Text
          colorScheme='secondary'
          sx={t => ({ display: 'block', textAlign: 'center', padding: `${t.space.$10} 0` })}
        >
          No test results yet
        </Text>
      </Td>
    </Tr>
  );
};

const CopyTestUrlButton = ({ url, isLoading }: { url: string; isLoading: boolean }): JSX.Element => {
  const { onCopy, hasCopied } = useClipboard(url);

  return (
    <ProfileSection.Button
      id='testSsoUrl'
      variant='outline'
      size='sm'
      isDisabled={!url}
      isLoading={isLoading}
      loadingText='Generating test URL…'
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
      {hasCopied ? 'Copied' : 'Copy test URL'}
    </ProfileSection.Button>
  );
};
