import { RemoveResourceForm } from '@/common';
import { descriptors, Flex, Spinner } from '@/customizables';
import { localizationKeys } from '@/localization';
import { Alert } from '@/ui/elements/Alert';
import { withCardStateProvider } from '@/ui/elements/contexts';
import { Form } from '@/ui/elements/Form';
import { FormButtons } from '@/ui/elements/FormButtons';
import type { FormProps } from '@/ui/elements/FormContainer';

import type { RemoveDomainFormModel } from './remove-domain-form.types';

export const RemoveDomainFormView = ({
  data,
  onSuccess,
  onReset,
}: {
  data: RemoveDomainFormModel;
  onSuccess: FormProps['onSuccess'];
  onReset: FormProps['onReset'];
}) => {
  if (data.isLoading) {
    return (
      <Flex
        direction={'row'}
        align={'center'}
        justify={'center'}
      >
        <Spinner
          size={'lg'}
          colorScheme={'primary'}
          elementDescriptor={descriptors.spinner}
        />
      </Flex>
    );
  }

  if (data.errorMessage) {
    return (
      <RemoveDomainLoadErrorView
        errorMessage={data.errorMessage}
        retry={data.retry}
        onReset={onReset}
      />
    );
  }

  return (
    <RemoveResourceForm
      scopeKey={data.scope}
      canRun={data.canRun}
      title={localizationKeys('organizationProfile.removeDomainPage.title')}
      messageLine1={localizationKeys('organizationProfile.removeDomainPage.messageLine1', {
        domain: data.domainName,
      })}
      messageLine2={localizationKeys('organizationProfile.removeDomainPage.messageLine2')}
      deleteResource={data.deleteDomain}
      onSuccess={onSuccess}
      onReset={onReset}
    />
  );
};

const RemoveDomainLoadErrorView = withCardStateProvider(
  ({ errorMessage, retry, onReset }: { errorMessage: string; retry: () => void; onReset: FormProps['onReset'] }) => (
    <Form.Root onSubmit={retry}>
      <Alert
        variant='danger'
        subtitle={errorMessage}
      />
      <FormButtons
        onReset={onReset}
        submitLabel={localizationKeys('formButtonPrimary')}
      />
    </Form.Root>
  ),
);
