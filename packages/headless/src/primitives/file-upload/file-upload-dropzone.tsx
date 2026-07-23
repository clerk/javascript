'use client';

import { type DragEvent, useRef, useState } from 'react';

import { type ComponentProps, mergeProps, useRender } from '../../utils';
import { useFileUploadContext } from './file-upload-context';

export type FileUploadDropzoneProps = ComponentProps<'div'>;

export function FileUploadDropzone(props: FileUploadDropzoneProps) {
  const { render, ...otherProps } = props;
  const { disabled, addFiles } = useFileUploadContext();

  const [dragging, setDragging] = useState(false);
  // Counts enter/leave events so dragging over child elements does not flicker
  // the drag state (dragenter/dragleave fire per nested element).
  const dragDepth = useRef(0);

  const state = { dragging, disabled };

  const defaultProps: Record<string, unknown> = {
    'data-cl-slot': 'file-upload-dropzone',
    'aria-disabled': disabled || undefined,
    onDragEnter: (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      if (disabled) {
        return;
      }
      dragDepth.current += 1;
      setDragging(true);
    },
    onDragOver: (event: DragEvent<HTMLDivElement>) => {
      // Required for the element to be a valid drop target.
      event.preventDefault();
      if (!disabled) {
        event.dataTransfer.dropEffect = 'copy';
      }
    },
    onDragLeave: (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      if (disabled) {
        return;
      }
      dragDepth.current -= 1;
      if (dragDepth.current <= 0) {
        dragDepth.current = 0;
        setDragging(false);
      }
    },
    onDrop: (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      dragDepth.current = 0;
      setDragging(false);
      if (disabled) {
        return;
      }
      const { files } = event.dataTransfer;
      if (files && files.length > 0) {
        addFiles(files);
      }
    },
  };

  return useRender({
    defaultTagName: 'div',
    render,
    state,
    stateAttributesMapping: {
      dragging: (v: boolean) => (v ? { 'data-cl-dragging': '' } : null),
      disabled: (v: boolean) => (v ? { 'data-cl-disabled': '' } : null),
    },
    props: mergeProps<'div'>(defaultProps, otherProps),
  });
}
