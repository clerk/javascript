'use client';

import { useCallback, useMemo } from 'react';

import { type ComponentProps, mergeProps, useRender } from '../../utils';
import { FileUploadItemContext, type FileUploadItemContextValue, useFileUploadContext } from './file-upload-context';

export interface FileUploadItemProps extends ComponentProps<'div'> {
  /** The file this item represents (typically from `useFileUpload().files`). */
  file: File;
}

export function FileUploadItem(props: FileUploadItemProps) {
  const { render, file, ...otherProps } = props;
  const { removeFile } = useFileUploadContext();

  const remove = useCallback(() => removeFile(file), [removeFile, file]);

  const itemContextValue = useMemo<FileUploadItemContextValue>(() => ({ file, remove }), [file, remove]);

  const state = { image: file.type.startsWith('image/') };

  const defaultProps: Record<string, unknown> = {
    'data-cl-slot': 'file-upload-item',
  };

  return (
    <FileUploadItemContext.Provider value={itemContextValue}>
      {useRender({
        defaultTagName: 'div',
        render,
        state,
        stateAttributesMapping: {
          image: (v: boolean) => (v ? { 'data-cl-image': '' } : null),
        },
        props: mergeProps<'div'>(defaultProps, otherProps),
      })}
    </FileUploadItemContext.Provider>
  );
}
