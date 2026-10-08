import type { ReactNode } from 'react';

import { FormButtonContainer } from '@/ui/elements/FormButtons';
import { FormContainer } from '@/ui/elements/FormContainer';

import { Wizard } from '../../common';
import { Button, descriptors, localizationKeys, Text } from '../../customizables';

export const MfaBackupCodeView = ({
  wizardProps,
  nextStep,
  close,
  createForm,
}: {
  wizardProps: { step: number };
  nextStep: () => void;
  close: () => void;
  createForm: ReactNode;
}) => (
  <Wizard {...wizardProps}>
    <AddBackupCodeView
      onContinue={nextStep}
      close={close}
    />
    {createForm}
  </Wizard>
);

const AddBackupCodeView = ({ onContinue, close }: { onContinue: () => void; close: () => void }) => (
  <FormContainer headerTitle={localizationKeys('userProfile.backupCodePage.title')}>
    <Text localizationKey={localizationKeys('userProfile.backupCodePage.infoText1')} />
    <Text localizationKey={localizationKeys('userProfile.backupCodePage.infoText2')} />

    <FormButtonContainer sx={{ marginTop: 0 }}>
      <Button
        textVariant='buttonSmall'
        onClick={onContinue}
        localizationKey={localizationKeys('userProfile.formButtonPrimary__finish')}
        elementDescriptor={descriptors.formButtonPrimary}
      />
      <Button
        variant='ghost'
        onClick={close}
        localizationKey={localizationKeys('userProfile.formButtonReset')}
        elementDescriptor={descriptors.formButtonReset}
      />
    </FormButtonContainer>
  </FormContainer>
);
