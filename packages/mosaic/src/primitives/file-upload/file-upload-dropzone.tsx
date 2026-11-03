'use client';

import React, { type DragEvent, useRef, useState } from 'react';

import { type ComponentProps, type DefaultProps, mergeProps, useRender } from '../utils';
import { mayAcceptType } from './accept';
import { useFileUploadContext } from './file-upload-context';

export type FileUploadDropzoneProps = ComponentProps<'div'>;

export const FileUploadDropzone = React.forwardRef<HTMLDivElement, FileUploadDropzoneProps>(
  function FileUploadDropzone(props, ref) {
    const { render, ...otherProps } = props;
    const { disabled, multiple, accept, addFiles } = useFileUploadContext();

    const [dragging, setDragging] = useState(false);
    const [dragRejected, setDragRejected] = useState(false);
    // Counts enter/leave events so dragging over child elements does not flicker
    // the drag state (dragenter/dragleave fire per nested element).
    const dragDepth = useRef(0);

    const state = { dragging, dragRejected, disabled };

    const defaultProps = {
      'aria-disabled': disabled || undefined,
      onDragEnter: (event: DragEvent<HTMLDivElement>) => {
        if (!carriesFiles(event)) {
          return;
        }
        event.preventDefault();
        if (disabled) {
          return;
        }
        dragDepth.current += 1;
        setDragging(true);
        setDragRejected(isDragRejected(event, accept, multiple));
      },
      onDragOver: (event: DragEvent<HTMLDivElement>) => {
        if (!carriesFiles(event)) {
          return;
        }
        // Required for the element to be a valid drop target.
        event.preventDefault();
        if (!disabled) {
          event.dataTransfer.dropEffect = 'copy';
        }
      },
      onDragLeave: (event: DragEvent<HTMLDivElement>) => {
        if (!carriesFiles(event)) {
          return;
        }
        event.preventDefault();
        if (disabled) {
          return;
        }
        dragDepth.current -= 1;
        if (dragDepth.current <= 0) {
          dragDepth.current = 0;
          setDragging(false);
          setDragRejected(false);
        }
      },
      onDrop: (event: DragEvent<HTMLDivElement>) => {
        if (!carriesFiles(event)) {
          return;
        }
        event.preventDefault();
        dragDepth.current = 0;
        setDragging(false);
        setDragRejected(false);
        if (disabled) {
          return;
        }
        const { files } = event.dataTransfer;
        if (files.length > 0) {
          addFiles(files);
        }
      },
    } satisfies DefaultProps<'div'>;

    return useRender({
      defaultTagName: 'div',
      ref,
      render,
      state,
      stateAttributesMapping: {
        dragging: (v: boolean) => (v ? { 'data-dragging': '' } : null),
        dragRejected: (v: boolean) => (v ? { 'data-drag-rejected': '' } : null),
        disabled: (v: boolean) => (v ? { 'data-disabled': '' } : null),
      },
      props: mergeProps<'div'>(defaultProps, otherProps),
    });
  },
);

function carriesFiles(event: DragEvent<HTMLElement>) {
  return Array.from(event.dataTransfer.types).includes('Files');
}

function isDragRejected(event: DragEvent<HTMLElement>, accept: string | undefined, multiple: boolean) {
  const types = Array.from(event.dataTransfer.items ?? [])
    .filter(item => item.kind === 'file')
    .map(item => item.type);
  const candidates = multiple ? types : types.slice(0, 1);
  return candidates.length > 0 && candidates.every(type => !mayAcceptType(type, accept));
}
