import type { ReactNode } from 'react';

import { Wizard } from '@/ui/common';
import { Button, Col, Icon, localizationKeys, Text } from '@/ui/customizables';
import { FormButtonContainer } from '@/ui/elements/FormButtons';
import { FormContainer } from '@/ui/elements/FormContainer';
import { IconButton } from '@/ui/elements/IconButton';
import { SuccessPage } from '@/ui/elements/SuccessPage';
import { Plus } from '@/ui/icons';
import type { LocalizationKey } from '@/ui/localization';

import type { EnableMFAButtonForPhoneViewData } from './mfa-phone-code-screen.types';

export const MfaPhoneCodeScreenView = ({
  controller,
  onReset,
  hasBackupCodes,
  hasNewBackupCodes,
  addPhone,
  verifyPhone,
  addMfa,
  backupCodeList,
}: {
  controller: { wizardProps: { step: number } };
  onReset: () => void;
  hasBackupCodes: boolean;
  hasNewBackupCodes: boolean;
  addPhone: ReactNode;
  verifyPhone: ReactNode;
  addMfa: ReactNode;
  backupCodeList: ReactNode;
}) => (
  <Wizard {...controller.wizardProps}>
    {addPhone}
    {verifyPhone}
    {addMfa}
    {hasBackupCodes && (
      <SuccessPage
        title={localizationKeys('userProfile.mfaPhoneCodePage.successTitle')}
        text={
          hasNewBackupCodes
            ? [
                localizationKeys('userProfile.mfaPhoneCodePage.successMessage1'),
                localizationKeys('userProfile.mfaPhoneCodePage.successMessage2'),
              ]
            : [localizationKeys('userProfile.mfaPhoneCodePage.successMessage1')]
        }
        onFinish={onReset}
        contents={backupCodeList}
      />
    )}
  </Wizard>
);

export const EnableMFAButtonForPhoneView = ({ controller }: { controller: EnableMFAButtonForPhoneViewData }) => (
  <Button
    key={controller.id}
    variant='outline'
    colorScheme='neutral'
    sx={{ justifyContent: 'start' }}
    onClick={() => void controller.enableMfa()}
    isLoading={controller.isLoading}
    isDisabled={controller.isDisabled}
  >
    {controller.label}
  </Button>
);

export const MFAVerifyPhoneView = ({
  title,
  phoneNumber,
  verification,
}: {
  title: LocalizationKey;
  phoneNumber: string | undefined;
  verification: ReactNode;
}) => (
  <FormContainer
    headerTitle={title}
    headerSubtitle={localizationKeys('userProfile.phoneNumberPage.verifySubtitle', { identifier: phoneNumber || '' })}
  >
    {verification}
  </FormContainer>
);

export const AddMfaView = ({
  title,
  hasAvailableMethods,
  phoneButtons,
  onAddPhoneClick,
  onReset,
}: {
  title: LocalizationKey;
  hasAvailableMethods: boolean;
  phoneButtons: ReactNode;
  onAddPhoneClick: React.MouseEventHandler;
  onReset: () => void;
}) => (
  <FormContainer
    headerTitle={title}
    gap={1}
  >
    <Text
      localizationKey={localizationKeys(
        hasAvailableMethods
          ? 'userProfile.mfaPhoneCodePage.subtitle__availablePhoneNumbers'
          : 'userProfile.mfaPhoneCodePage.subtitle__unavailablePhoneNumbers',
      )}
      colorScheme='secondary'
    />
    {hasAvailableMethods && <Col gap={2}>{phoneButtons}</Col>}
    <FormButtonContainer sx={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <IconButton
        variant='ghost'
        aria-label='Add phone number'
        icon={
          <Icon
            icon={Plus}
            sx={theme => ({ marginInlineEnd: theme.space.$2 })}
          />
        }
        localizationKey={localizationKeys('userProfile.mfaPhoneCodePage.primaryButton__addPhoneNumber')}
        onClick={onAddPhoneClick}
      />
      <Button
        variant='ghost'
        localizationKey={localizationKeys('userProfile.formButtonReset')}
        onClick={onReset}
      />
    </FormButtonContainer>
  </FormContainer>
);
