import React from 'react';

import { Button, Col, descriptors, localizationKeys, Text } from '../customizables';
import { Folder } from '../icons';
import { animations, mqu } from '../styledSystem';
import { colors } from '../utils';
import { IconCircle } from './IconCircle';

const MAX_SIZE_BYTES = 10 * 1000 * 1000;
const SUPPORTED_MIME_TYPES = Object.freeze(['image/png', 'image/jpeg', 'image/gif', 'image/webp']);

const validType = (f: File | DataTransferItem) => SUPPORTED_MIME_TYPES.includes(f.type);
const validSize = (f: File) => f.size <= MAX_SIZE_BYTES;
const validFile = (f: File) => validType(f) && validSize(f);

type FileDropAreaProps = {
  onFileDrop: (file: File) => any;
};

export const FileDropArea = (props: FileDropAreaProps) => {
  const { onFileDrop } = props;
  const [status, setStatus] = React.useState<'idle' | 'valid' | 'invalid' | 'loading'>('idle');
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const openDialog = () => inputRef.current?.click();

  const onDragEnter = (ev: React.DragEvent) => {
    const item = ev.dataTransfer.items[0];
    setStatus(item && !validType(item) ? 'invalid' : 'valid');
  };

  const onDragLeave = (ev: React.DragEvent) => {
    if (!ev.currentTarget.contains(ev.relatedTarget as Element)) {
      setStatus('idle');
    }
  };

  const onDragOver = (ev: React.DragEvent) => {
    ev.preventDefault();
  };

  const onDrop = (ev: React.DragEvent) => {
    ev.preventDefault();
    onDragLeave(ev);
    upload(ev.dataTransfer.files[0]);
  };

  const upload = (f: File | undefined) => {
    if (f && validFile(f)) {
      setStatus('loading');
      onFileDrop(f);
    }
  };

  const events = { onDragEnter, onDragLeave, onDragOver, onDrop };

  return (
    <Col
      elementDescriptor={descriptors.fileDropAreaOuterBox}
      gap={2}
      {...events}
    >
      <input
        type='file'
        accept={SUPPORTED_MIME_TYPES.join(',')}
        style={{ display: 'none' }}
        ref={inputRef}
        onChange={e => upload(e.currentTarget.files?.[0])}
      />
      <Col
        elementDescriptor={descriptors.fileDropAreaBox}
        center
        gap={4}
        sx={t => ({
          height: t.space.$60,
          [mqu.sm]: { height: '10 rem' },
          backgroundColor: {
            idle: t.colors.$blackAlpha50,
            loading: t.colors.$blackAlpha50,
            valid: colors.setAlpha(t.colors.$success500, 0.2),
            invalid: colors.setAlpha(t.colors.$danger500, 0.2),
          }[status],
          borderRadius: t.radii.$xl,
          animation: `${animations.expandIn(t.space.$60)} ${t.transitionDuration.$fast} ease`,
        })}
      >
        <IconCircle
          icon={Folder}
          boxElementDescriptor={descriptors.fileDropAreaIconBox}
          iconElementDescriptor={descriptors.fileDropAreaIcon}
        />
        {status === 'loading' ? (
          <Text colorScheme='neutral'>Uploading...</Text>
        ) : (
          <>
            <Text
              localizationKey={localizationKeys('userProfile.profilePage.fileDropAreaTitle')}
              elementDescriptor={descriptors.fileDropAreaHint}
              sx={{ [mqu.sm]: { display: 'none' } }}
              colorScheme='neutral'
            />
            <Button
              localizationKey={localizationKeys('userProfile.profilePage.fileDropAreaAction')}
              elementDescriptor={descriptors.fileDropAreaButtonPrimary}
              variant='ghost'
              onClick={openDialog}
            />
          </>
        )}
      </Col>
      <Text
        localizationKey={localizationKeys('userProfile.profilePage.fileDropAreaHint')}
        elementDescriptor={descriptors.fileDropAreaFooterHint}
        colorScheme='neutral'
      />
    </Col>
  );
};
