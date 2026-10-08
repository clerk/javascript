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
  onAvatarRemove?: (() => void | Promise<unknown>) | null;
  avatarPreviewPlaceholder?: React.ReactElement | null;
  rounded?: boolean;
  isDisabled?: boolean;
};

const MAX_SIZE_BYTES = 10 * 1000 * 1000;
const SUPPORTED_MIME_TYPES = Object.freeze(['image/png', 'image/jpeg', 'image/gif', 'image/webp']);

const validType = (f: File | DataTransferItem) => SUPPORTED_MIME_TYPES.includes(f.type);
const validSize = (f: File) => f.size <= MAX_SIZE_BYTES;

export const AvatarUploader = (props: AvatarUploaderProps) => {
  const { t } = useLocalizations();
  const [objectUrl, setObjectUrl] = React.useState<string>();
  const [isDraggingOver, setIsDraggingOver] = React.useState(false);
  const card = useCardState();
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const mounted = React.useRef(true);
  const pending = React.useRef<Promise<void>>();
  const previewReader = React.useRef<FileReader>();
  const releaseRequest = React.useRef<() => void>();
  const latestCard = React.useRef(card);
  latestCard.current = card;
  const cancelPreviewRead = React.useCallback(() => {
    const reader = previewReader.current;
    previewReader.current = undefined;
    if (reader) {
      reader.onload = null;
      reader.onerror = null;
      reader.onabort = null;
      if (reader.readyState === FileReader.LOADING) {
        reader.abort();
      }
    }
  }, []);
  React.useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      cancelPreviewRead();
      pending.current = undefined;
      releaseRequest.current?.();
      releaseRequest.current = undefined;
    };
  }, [cancelPreviewRead]);

  const {
    onAvatarChange,
    onAvatarRemove,
    title,
    avatarPreview,
    avatarPreviewPlaceholder,
    rounded = true,
    isDisabled = false,
    ...rest
  } = props;

  const disabled = isDisabled || card.isLoading;
  const openDialog = () => {
    if (!disabled) {
      inputRef.current?.click();
    }
  };

  const readPreview = (file: File) => {
    cancelPreviewRead();
    const reader = new FileReader();
    previewReader.current = reader;
    reader.onload = () => {
      if (mounted.current && previewReader.current === reader && typeof reader.result === 'string') {
        setObjectUrl(reader.result);
      }
      if (previewReader.current === reader) {
        cancelPreviewRead();
      }
    };
    reader.onerror = reader.onabort = () => {
      if (previewReader.current === reader) {
        cancelPreviewRead();
      }
    };
    try {
      reader.readAsDataURL(file);
    } catch {
      cancelPreviewRead();
    }
  };

  const runChange = (action: () => void | Promise<unknown>) => {
    if (!mounted.current || isDisabled) {
      return Promise.resolve();
    }
    if (pending.current) {
      return pending.current;
    }
    const release = latestCard.current.beginRequest();
    if (!release) {
      return Promise.resolve();
    }
    releaseRequest.current = release;
    latestCard.current.setError(undefined);
    const ownsRequest = () => mounted.current && pending.current === request;
    const request = (async () => {
      await action();
    })()
      .catch(error => {
        if (ownsRequest()) {
          handleError(error, [], latestCard.current.setError);
        }
      })
      .finally(() => {
        if (ownsRequest()) {
          pending.current = undefined;
          if (inputRef.current) {
            inputRef.current.value = '';
          }
          releaseRequest.current = undefined;
          release();
        }
      });
    pending.current = request;
    return request;
  };

  const handleRemove = () => {
    if (disabled || pending.current || !mounted.current) {
      return Promise.resolve();
    }
    return runChange(() => {
      cancelPreviewRead();
      setObjectUrl('');
      return onAvatarRemove?.();
    });
  };

  const upload = (file: File | undefined) => {
    if (!file || disabled || pending.current || !mounted.current) {
      return Promise.resolve();
    }
    if (!validType(file)) {
      card.setError(t(localizationKeys('unstable__errors.avatar_file_type_invalid')));
      return Promise.resolve();
    }
    if (!validSize(file)) {
      card.setError(t(localizationKeys('unstable__errors.avatar_file_size_exceeded')));
      return Promise.resolve();
    }
    return runChange(() => {
      readPreview(file);
      return onAvatarChange(file);
    });
  };

  const isFileDrag = (e: React.DragEvent) => e.dataTransfer?.types?.includes('Files') ?? false;

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    if (disabled || !isFileDrag(e)) {
      return;
    }
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    if (disabled || !isFileDrag(e)) {
      return;
    }
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    // Only reset when leaving the container entirely, not when moving between children.
    // SAFETY: e.relatedTarget is typed as EventTarget | null, but in drag events it is always
    // a DOM Node (or null). Element.contains() requires Node | null; the cast is safe here.
    if (e.currentTarget.contains(e.relatedTarget as Node | null)) {
      return;
    }
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    if (!isFileDrag(e)) {
      return;
    }
    e.preventDefault();
    setIsDraggingOver(false);
    if (disabled) {
      return;
    }
    void upload(e.dataTransfer.files?.[0]);
  };

  const hasExistingImage = !!(avatarPreview.props as { imageUrl?: string })?.imageUrl;
  const previewElement = objectUrl
    ? React.cloneElement(avatarPreview, { imageUrl: objectUrl })
    : avatarPreviewPlaceholder && !hasExistingImage
      ? React.cloneElement(avatarPreviewPlaceholder, { onClick: openDialog, isDisabled: disabled })
      : avatarPreview;

  return (
    <Col gap={4}>
      <input
        type='file'
        disabled={disabled}
        accept={SUPPORTED_MIME_TYPES.join(',')}
        style={{ display: 'none' }}
        ref={inputRef}
        onChange={e => void upload(e.currentTarget.files?.[0])}
      />

      <Flex
        {...rest}
        gap={4}
        align='center'
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Flex
          sx={t => ({
            borderRadius: isDraggingOver && rounded ? t.radii.$circle : t.radii.$md,
            transitionProperty: t.transitionProperty.$common,
            transitionDuration: t.transitionDuration.$controls,
            transitionTimingFunction: t.transitionTiming.$common,
            ...(isDraggingOver && {
              outline: `${t.borderWidths.$normal} dashed ${t.colors.$primary500}`,
              outlineOffset: t.space.$0x5,
            }),
          })}
        >
          {previewElement}
        </Flex>
        <Col gap={1}>
          <Flex
            elementDescriptor={descriptors.avatarImageActions}
            gap={2}
          >
            <SimpleButton
              elementDescriptor={descriptors.avatarImageActionsUpload}
              localizationKey={localizationKeys('userProfile.profilePage.imageFormSubtitle')}
              isDisabled={disabled}
              variant='outline'
              size='xs'
              onClick={openDialog}
            />

            {!!onAvatarRemove && (
              <Button
                elementDescriptor={descriptors.avatarImageActionsRemove}
                localizationKey={localizationKeys('userProfile.profilePage.imageFormDestructiveActionSubtitle')}
                isDisabled={disabled}
                sx={t => ({ color: t.colors.$danger500 })}
                variant='ghost'
                colorScheme='danger'
                onClick={() => void handleRemove()}
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
