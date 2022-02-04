import { Control } from '@clerk/shared/components/control';
import { Form } from '@clerk/shared/components/form';
import { Input } from '@clerk/shared/components/input';
import { TitledCard } from '@clerk/shared/components/titledCard';
import React from 'react';
import { handleError, useFieldState } from 'ui/common';
import { Error } from 'ui/common/error';
import { useCoreUser } from 'ui/contexts';
import { useNavigate } from 'ui/hooks';
import { PageHeading } from 'ui/userProfile/pageHeading';

interface EditableFieldProps {
  label: string;
  slug: string;
  value?: string | null;
}

export const EditableField = (props: EditableFieldProps) => {
  const user = useCoreUser();
  const { label, slug, value } = props;

  // @ts-ignore
  const currentValue = useFieldState(slug, user[value] ? user[value] : '');
  const [error, setError] = React.useState<string | undefined>();

  const { navigate } = useNavigate();

  const updateFieldSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await user.update({ [currentValue.name]: currentValue.value });
      navigate('../');
    } catch (err) {
      handleError(err, [currentValue], setError);
    }
  };

  const handleCancel = () => {
    navigate('../');
  };

  const inputName = `${slug}_input`;

  return (
    <>
      <PageHeading
        title={label}
        subtitle={`Edit your ${label.toLowerCase()}`}
        backTo='../'
      />
      <TitledCard className='cl-themed-card cl-editable-field'>
        <Error>{error}</Error>
        <Form
          submitButtonLabel='Save'
          handleSubmit={updateFieldSubmit}
          resetButtonLabel='Cancel'
          handleReset={handleCancel}
          buttonGroupClassName='cl-form-button-group'
        >
          <Control error={currentValue.error} label={label} htmlFor={inputName}>
            <Input
              id={inputName}
              name={inputName}
              type='text'
              value={currentValue.value}
              handleChange={el => currentValue.setValue(el.value || '')}
              autoFocus
              autoComplete='off'
              required
              minLength={1}
              maxLength={255}
            />
          </Control>
        </Form>
      </TitledCard>
    </>
  );
};
