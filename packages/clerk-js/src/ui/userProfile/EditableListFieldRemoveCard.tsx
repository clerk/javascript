import { Button } from '@clerk/shared/components/button';
import { PhoneViewer } from '@clerk/shared/components/phoneInput';
import { TitledCard } from '@clerk/shared/components/titledCard';
import React from 'react';
import { handleError } from 'ui/common';
import { Alert } from 'ui/common/alert';

interface EditableListFieldRemoveCardProps {
  type: 'phone' | 'email' | 'connected_account' | 'web3_wallet';
  label: string;
  buttonLabel: string;
  onCancel: () => void;
  onRemove: () => Promise<any>;
  onRemoved?: () => void;
}

export const EditableListFieldRemoveCard: React.FC<EditableListFieldRemoveCardProps> = ({
  type,
  label,
  buttonLabel,
  onCancel,
  onRemove,
  onRemoved,
}) => {
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

  const formattedType = type.split('_').join(' ');

  return (
    <TitledCard
      title={`Remove ${formattedType}`}
      className='cl-themed-card cl-verifiable-field-card'
    >
      <Alert type='error'>{error}</Alert>

      <div className='cl-copy-text'>
        <p>
          {type === 'phone' ? (
            <PhoneViewer
              className='cl-identifier'
              phoneNumber={label.toLowerCase()}
            />
          ) : (
            <span className='cl-identifier'>{label}</span>
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
        {type === 'connected_account' && (
          <p>Unlink your {label} account, and remove associated personal information.</p>
        )}
        {type === 'web3_wallet' && <p>Remove the connection between this app and your Web3 wallet</p>}
      </div>
      <div className='cl-form-button-group'>
        <Button onClick={updateFieldSubmit}>
          {buttonLabel} {formattedType}
        </Button>
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
