import React from 'react';

import { useCoreOrganization, useEnvironment } from '../../contexts';
import { localizationKeys } from '../../customizables';
import { ContentPage, Form, FormButtons, useCardState, withCardStateProvider } from '../../elements';
import { useRouter } from '../../router';
import { handleError, useFormControl } from '../../utils';
import { OrganizationProfileBreadcrumbs } from './OrganizationProfileNavbar';

export const AddDomainPage = withCardStateProvider(() => {
  const { organizationSettings } = useEnvironment();
  const title = localizationKeys('organizationProfile.createDomainPage.title');
  const subtitle = localizationKeys('organizationProfile.createDomainPage.subtitle');
  const card = useCardState();
  const { organization } = useCoreOrganization();
  const { navigate } = useRouter();

  const nameField = useFormControl('name', '', {
    type: 'text',
    label: localizationKeys('formFieldLabel__organizationEmailDomain'),
    placeholder: localizationKeys('formFieldInputPlaceholder__organizationEmailDomain'),
  });

  if (!organization || !organizationSettings) {
    return null;
  }

  const canSubmit = organization.name !== nameField.value;

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    return organization
      .createDomain(nameField.value)
      .then(res => {
        if (res.verification && res.verification.status === 'verified') {
          return navigate(`../domain/${res.id}`);
        }
        return navigate(`../domain/${res.id}/verify`);
      })
      .catch(err => {
        handleError(err, [nameField], card.setError);
      });
  };

  return (
    <ContentPage
      headerTitle={title}
      headerSubtitle={subtitle}
      Breadcrumbs={OrganizationProfileBreadcrumbs}
    >
      <Form.Root onSubmit={onSubmit}>
        <Form.ControlRow elementId={nameField.id}>
          <Form.Control
            {...nameField.props}
            autoFocus
            required
          />
        </Form.ControlRow>
        <FormButtons isDisabled={!canSubmit} />
      </Form.Root>
    </ContentPage>
  );
});
