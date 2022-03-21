import { Button } from '@clerk/shared/components/button';
import { PhoneViewer } from '@clerk/shared/components/phoneInput';
import { TitledCard } from '@clerk/shared/components/titledCard';
import React from 'react';
import { handleError } from 'ui/common';
import { Error } from 'ui/common/error';

interface EditableListFieldRemoveCardProps {
  type: 'phone' | 'email';
  label: string;
  onCancel: () => void;
  onRemove: () => Promise<any>;
  onRemoved?: () => void;
}

export const EditableListFieldRemoveCard: React.FC<EditableListFieldRemoveCardProps> = ({
  type,
  label,
  onCancel,
  onRemove,
  onRemoved,
}) => {
  const lowerLabel = label.toLowerCase();
  const [error, setError] = React.useState<string | undefined>();

  const updateFieldSubmit = async () => {
    try {
      await onRemove();
      if (typeof onRemoved === 'function') {
        await onRemoved();
      }
    } catch (err) {
      handleError(err, [], setError);
    }
  };

  return (
    <TitledCard
      title={`Remove ${type}`}
      subtitle='Confirm removal'
      className='cl-themed-card cl-verifiable-field-card'
    >
      <Error>{error}</Error>
      <div className='cl-copy-text'>
        <p>
          {type === 'phone' ? (
            <PhoneViewer
              className='cl-identifier'
              phoneNumber={lowerLabel}
            />
          ) : (
            <span className='cl-identifier'>{lowerLabel}</span>
          )}{' '}
          will be removed from this account.
        </p>
        {type === 'email' && (
          <p>
            You’ll no longer receive communications to this email address, and you cannot use it when signing in to
            identify yourself.
          </p>
        )}
        {type === 'phone' && (
          <p>
            You will no longer receive messages to this number, and you cannot use it when signing in to identify
            yourself.
          </p>
        )}
      </div>
      <div className='cl-form-button-group'>
        <Button onClick={updateFieldSubmit}>Remove {type}</Button>
        <Button
          flavor='text'
          type='reset'
          onClick={onCancel}
        >
          Cancel
        </Button>
      </div>
    </TitledCard>
  );
};
