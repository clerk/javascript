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
  const breadcrumbTitle = localizationKeys('organizationProfile.profilePage.domainSection.title');
  const card = useCardState();
  const { organization } = useCoreOrganization();
  const { navigate } = useRouter();

  const nameField = useFormControl('name', '', {
    type: 'text',
    label: localizationKeys('formFieldLabel__organizationDomain'),
    placeholder: localizationKeys('formFieldInputPlaceholder__organizationDomain'),
  });

  if (!organization || !organizationSettings) {
    return null;
  }

  const canSubmit = nameField.value.trim() !== '';

  const onSubmit = (e: React.FormEvent) => {
    nameField.setError(undefined);
    e.preventDefault();
    return organization
      .createDomain(nameField.value)
      .then(res => {
        if (res.verification && res.verification.status === 'verified') {
          return navigate(`../domain/${res.id}?mode=select`);
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
      breadcrumbTitle={breadcrumbTitle}
      Breadcrumbs={OrganizationProfileBreadcrumbs}
    >
      <Form.Root onSubmit={onSubmit}>
        <Form.ControlRow elementId={nameField.id}>
          <Form.PlainInput
            {...nameField.props}
            autoFocus
            isRequired
          />
        </Form.ControlRow>
        <FormButtons isDisabled={!canSubmit} />
      </Form.Root>
    </ContentPage>
  );
});
