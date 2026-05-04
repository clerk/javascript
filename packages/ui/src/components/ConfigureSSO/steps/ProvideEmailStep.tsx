import { Col, Flex, Heading, Icon, Input, Text } from '@/customizables';
import { useRegisterContinueAction, useWizard } from '@/elements/Wizard';
import { Email } from '@/icons';

import { useConfigureSSOFlow } from '../ConfigureSSOContext';
import { StepLayout } from './StepLayout';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// TODO -> Conditionally render this step based on the user's email address
// If the user already has an email address, skip this step
// If the instance doesn't support email addresses, skip this step
// If the user doesn't have an email address, render this step
export const ProvideEmail = (): JSX.Element => {
  const { email, setEmail } = useConfigureSSOFlow();
  const { goNext } = useWizard();

  const isValid = EMAIL_RE.test(email.trim());

  useRegisterContinueAction({
    handler: () => {
      if (!isValid) {
        return;
      }

      // TODO -> Call API to add email address to user

      return goNext();
    },
    isDisabled: !isValid,
  });

  return (
    <StepLayout
      title='Configure SSO'
      subtitle='Create a new enterprise application in your Okta Dashboard'
    >
      <Flex
        direction='col'
        align='center'
        justify='center'
        sx={theme => ({
          flex: 1,
          gap: theme.space.$4,
          paddingBlock: theme.space.$8,
        })}
      >
        <Icon
          icon={Email}
          size='lg'
          sx={theme => ({ color: theme.colors.$colorMutedForeground })}
        />
        <Col sx={theme => ({ gap: theme.space.$1, alignItems: 'center', textAlign: 'center' })}>
          <Heading textVariant='h3'>We need your email</Heading>
          <Text
            as='p'
            variant='body'
            sx={theme => ({ color: theme.colors.$colorMutedForeground })}
          >
            In order to start we will need your email address
          </Text>
        </Col>
        <Input
          type='email'
          placeholder='Paste URL here…'
          value={email}
          onChange={e => setEmail(e.currentTarget.value)}
          sx={theme => ({ maxWidth: theme.sizes.$60, width: '100%' })}
        />
      </Flex>
    </StepLayout>
  );
};
