import React from 'react';

import type { LocalizationKey } from '../customizables';
import {
  Button,
  Col,
  descriptors,
  Flex,
  localizationKeys,
  SimpleButton,
  Text,
  useLocalizations,
} from '../customizables';
import { handleError } from '../utils/errorHandler';
import { useCardState } from './contexts';

export type AvatarUploaderProps = {
  title: LocalizationKey;
  avatarPreview: React.ReactElement;
  onAvatarChange: (file: File) => Promise<unknown>;
  onAvatarRemove?: (() => void) | null;
  avatarPreviewPlaceholder?: React.ReactElement | null;
};

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

const MAX_SIZE_BYTES = 10 * 1000 * 1000;
const SUPPORTED_MIME_TYPES = Object.freeze(['image/png', 'image/jpeg', 'image/gif', 'image/webp']);

const validType = (f: File | DataTransferItem) => SUPPORTED_MIME_TYPES.includes(f.type);
const validSize = (f: File) => f.size <= MAX_SIZE_BYTES;

export const AvatarUploader = (props: AvatarUploaderProps) => {
  const { t } = useLocalizations();
  const [showUpload, setShowUpload] = React.useState(false);
  const [objectUrl, setObjectUrl] = React.useState<string>();
  const card = useCardState();
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const openDialog = () => inputRef.current?.click();

  const { onAvatarChange, onAvatarRemove, title, avatarPreview, avatarPreviewPlaceholder, ...rest } = props;

  const toggle = () => {
    setShowUpload(!showUpload);
  };

  const handleFileDrop = (file: File | null) => {
    if (file === null) {
      return setObjectUrl('');
    }

    void fileToBase64(file).then(setObjectUrl);
    card.setLoading();
    return onAvatarChange(file)
      .then(() => {
        toggle();
        card.setIdle();
      })
      .catch(err => handleError(err, [], card.setError));
  };

  const handleRemove = async () => {
    card.setLoading();
    await handleFileDrop(null);
    return onAvatarRemove?.();
  };

  const upload = async (f: File | undefined) => {
    if (!f) {
      return;
    }

    if (!validType(f)) {
      card.setError(t(localizationKeys('unstable__errors.avatar_file_type_invalid')));
      return;
    }

    if (!validSize(f)) {
      card.setError(t(localizationKeys('unstable__errors.avatar_file_size_exceeded')));
      return;
    }

    await handleFileDrop(f);
  };

  const previewElement = objectUrl
    ? React.cloneElement(avatarPreview, { imageUrl: objectUrl })
    : avatarPreviewPlaceholder
      ? React.cloneElement(avatarPreviewPlaceholder, { onClick: openDialog })
      : avatarPreview;

  return (
    <Col gap={4}>
      <input
        type='file'
        accept={SUPPORTED_MIME_TYPES.join(',')}
        style={{ display: 'none' }}
        ref={inputRef}
        onChange={e => upload(e.currentTarget.files?.[0])}
      />

      <Flex
        gap={4}
        align='center'
        {...rest}
      >
        {previewElement}
        <Col gap={1}>
          <Flex
            elementDescriptor={descriptors.avatarImageActions}
            gap={2}
          >
            <SimpleButton
              elementDescriptor={descriptors.avatarImageActionsUpload}
              localizationKey={localizationKeys('userProfile.profilePage.imageFormSubtitle')}
              isDisabled={card.isLoading}
              variant='outline'
              size='xs'
              onClick={openDialog}
            />

            {!!onAvatarRemove && !showUpload && (
              <Button
                elementDescriptor={descriptors.avatarImageActionsRemove}
                localizationKey={localizationKeys('userProfile.profilePage.imageFormDestructiveActionSubtitle')}
                isDisabled={card.isLoading}
                sx={t => ({ color: t.colors.$danger500 })}
                variant='ghost'
                colorScheme='danger'
                onClick={handleRemove}
                size='xs'
              />
            )}
          </Flex>
          <Text
            colorScheme='secondary'
            sx={t => ({ fontSize: t.fontSizes.$sm })}
            localizationKey={localizationKeys('userProfile.profilePage.fileDropAreaHint')}
          />
        </Col>
      </Flex>
    </Col>
  );
};
