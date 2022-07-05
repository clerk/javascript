import React from 'react';

import { useCoreUser } from '../../ui/contexts';
import { useRouter } from '../../ui/router';
import { useWizard, Wizard } from '../common';
import { Text } from '../customizables';
import { Form } from '../elements';
import { FormButtons } from './FormButtons';
import { ContentPage } from './Page';
import { SuccessPage } from './SuccessPage';

export const RemoveEmailPage = () => {
  const user = useCoreUser();
  const { id } = useRouter().params;
  const ref = React.useRef(user.emailAddresses.find(e => e.id === id));

  if (!ref.current) {
    return null;
  }

  return (
    <RemoveResourcePage
      title='Remove email address'
      messageLine1={`${ref.current.emailAddress} will be removed from this account.`}
      messageLine2={'You will no longer be able to sign in using this email address.'}
      successMessage={`${ref.current.emailAddress} has been removed from your account.`}
      deleteResource={() => Promise.resolve(ref.current?.destroy())}
    />
  );
};

export const RemovePhonePage = () => {
  const user = useCoreUser();
  const { id } = useRouter().params;
  const ref = React.useRef(user.phoneNumbers.find(e => e.id === id));

  if (!ref.current) {
    return null;
  }

  return (
    <RemoveResourcePage
      title='Remove email address'
      messageLine1={`${ref.current.phoneNumber} will be removed from this account.`}
      messageLine2={`You will no longer be able to sign in using this phone number.`}
      successMessage={`${ref.current.phoneNumber} has been removed from your account.`}
      deleteResource={() => Promise.resolve(ref.current?.destroy())}
    />
  );
};

type RemovePageProps = {
  title: string;
  messageLine1: string;
  messageLine2: string;
  successMessage: string;
  deleteResource: () => Promise<any>;
};

export const RemoveResourcePage = (props: RemovePageProps) => {
  const { title, messageLine1, messageLine2, successMessage, deleteResource } = props;
  const wizard = useWizard();
  return (
    <Wizard {...wizard.props}>
      <ContentPage.Root headerTitle={title}>
        <Form.Root onSubmit={() => deleteResource().then(() => wizard.nextStep())}>
          <Text variant='regularRegular'>{messageLine1}</Text>
          <Text variant='regularRegular'>{messageLine2}</Text>
          <FormButtons colorScheme={'danger'} />
        </Form.Root>
      </ContentPage.Root>

      <SuccessPage
        title={title}
        text={successMessage}
      />
    </Wizard>
  );
};
