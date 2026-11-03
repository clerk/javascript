'use client';

import React, { useCallback, useMemo } from 'react';

import { type ComponentProps, mergeProps, useRender } from '../utils';
import { FileUploadItemContext, type FileUploadItemContextValue, useFileUploadContext } from './file-upload-context';

export interface FileUploadItemProps extends ComponentProps<'div'> {
  /** The file this item represents (typically from `useFileUpload().files`). */
  file: File;
}

export const FileUploadItem = React.forwardRef<HTMLDivElement, FileUploadItemProps>(
  function FileUploadItem(props, ref) {
    const { render, file, ...otherProps } = props;
    const { removeFile } = useFileUploadContext();

    const remove = useCallback(() => removeFile(file), [removeFile, file]);

    const itemContextValue = useMemo<FileUploadItemContextValue>(() => ({ file, remove }), [file, remove]);

    const state = { image: file.type.startsWith('image/') };

    const defaultProps: Record<string, unknown> = {};

    return (
      <FileUploadItemContext.Provider value={itemContextValue}>
        {useRender({
          defaultTagName: 'div',
          ref,
          render,
          state,
          stateAttributesMapping: {
            image: (v: boolean) => (v ? { 'data-image': '' } : null),
          },
          props: mergeProps<'div'>(defaultProps, otherProps),
        })}
      </FileUploadItemContext.Provider>
    );
  },
);
