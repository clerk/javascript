import React from 'react';

import { Button, Col, Flex, Icon, Text } from '../customizables';
import { Folder } from '../icons';
import { animations } from '../styledSystem';
import { colors } from '../utils';

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
        center
        gap={4}
        sx={theme => ({
          height: theme.space.$60,
          backgroundColor: {
            idle: theme.options.$darkMode ? theme.colors.$blackAlpha100 : theme.colors.$blackAlpha50,
            loading: theme.options.$darkMode ? theme.colors.$blackAlpha100 : theme.colors.$blackAlpha50,
            valid: theme.options.$darkMode
              ? colors.makeTransparent(theme.colors.$primary300, 0.8)
              : theme.colors.$primary50,
            invalid: theme.options.$darkMode
              ? colors.makeTransparent(theme.colors.$danger300, 0.8)
              : theme.colors.$danger50,
          }[status],
          borderRadius: theme.radii.$xl,
          animation: `${animations.expandIn(theme.space.$60)} ${theme.transitionDuration.$fast} ease`,
        })}
      >
        <Flex
          center
          sx={theme => ({
            backgroundColor: theme.colors.$blackAlpha50,
            width: theme.sizes.$16,
            height: theme.sizes.$16,
            borderRadius: theme.radii.$circle,
          })}
        >
          <Icon
            icon={Folder}
            size='lg'
            sx={theme => ({ color: theme.colors.$blackAlpha600 })}
          />
        </Flex>
        {status === 'loading' ? (
          <Text colorScheme='neutral'>Uploading...</Text>
        ) : (
          <>
            <Text colorScheme='neutral'>Drag file here</Text>
            <Button
              variant='ghost'
              onClick={openDialog}
            >
              Or select file
            </Button>
          </>
        )}
      </Col>
      <Text
        variant='smallRegular'
        colorScheme='neutral'
      >
        Upload a JPG, PNG, GIF, or WEBP image smaller than 10 MB
      </Text>
    </Col>
  );
};
