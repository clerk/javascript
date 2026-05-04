import { Col, Text } from '@/customizables';
import { useRegisterContinueAction, useWizard } from '@/elements/Wizard';

import { useConfigureSSOFlow } from '../ConfigureSSOContext';
import { StepLayout } from './StepLayout';

export const VerifyDomain = (): JSX.Element => {
  const { email } = useConfigureSSOFlow();
  const { goNext } = useWizard();

  useRegisterContinueAction({
    handler: () => goNext(),
  });

  const domain = email.split('@')[1] ?? '';

  return (
    <StepLayout
      title='Verify your domain'
      subtitle={
        domain
          ? `We need to confirm you own ${domain} before linking the IdP.`
          : 'We need to confirm you own this domain before linking the IdP.'
      }
    >
      <Col
        sx={theme => ({
          gap: theme.space.$3,
          maxWidth: theme.sizes.$160,
          marginInline: 'auto',
          paddingBlock: theme.space.$8,
        })}
      >
        <Text
          as='p'
          variant='body'
          sx={theme => ({ color: theme.colors.$colorMutedForeground })}
        >
          Verification form goes here
        </Text>
      </Col>
    </StepLayout>
  );
};
