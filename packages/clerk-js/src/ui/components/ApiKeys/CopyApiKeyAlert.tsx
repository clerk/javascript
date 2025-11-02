import { Alert, AlertIcon, Col, descriptors, localizationKeys, Text } from '@/ui/customizables';
import { ClipboardInput } from '@/ui/elements/ClipboardInput';
import { Check, ClipboardOutline } from '@/ui/icons';

type CopyApiKeyAlertProps = {
  apiKeyName: string;
  apiKeySecret: string;
};

export const CopyApiKeyAlert = ({ apiKeyName, apiKeySecret }: CopyApiKeyAlertProps) => {
  return (
    <Alert
      elementDescriptor={descriptors.alert}
      elementId={descriptors.alert.setId('warning')}
      colorScheme='warning'
      align='start'
    >
      <AlertIcon
        elementId={descriptors.alert.setId('warning')}
        elementDescriptor={descriptors.alertIcon}
        variant='warning'
        colorScheme='warning'
        sx={{ flexShrink: 0 }}
      />
      <Col
        elementDescriptor={descriptors.alertTextContainer}
        elementId={descriptors.alertTextContainer.setId('warning')}
        gap={1}
        sx={{ flex: 1 }}
      >
        <Text
          elementDescriptor={descriptors.alertText}
          variant='body'
          localizationKey={localizationKeys('apiKeys.copyAlert.title', { name: apiKeyName })}
          sx={{ textAlign: 'left' }}
        />
        <Text
          elementDescriptor={descriptors.alertText}
          variant='body'
          colorScheme='secondary'
          localizationKey={localizationKeys('apiKeys.copyAlert.subtitle')}
          sx={{ textAlign: 'left' }}
        />
        <ClipboardInput
          value={apiKeySecret}
          readOnly
          sx={{ width: '100%' }}
          copyIcon={ClipboardOutline}
          copiedIcon={Check}
        />
      </Col>
    </Alert>
  );
};
