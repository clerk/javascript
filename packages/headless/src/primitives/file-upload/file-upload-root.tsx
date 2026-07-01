'use client';

import { type CSSProperties, type ReactNode, useCallback, useId, useMemo, useRef } from 'react';

import { useControllableState } from '../../hooks/use-controllable-state';
import { type ComponentProps, mergeProps, renderElement } from '../../utils/render-element';
import { isFileAccepted } from './accept';
import { FileUploadContext, type FileUploadContextValue } from './file-upload-context';

/** Why a file was rejected when added. */
export type FileRejectionReason = 'accept' | 'size';

export interface FileRejection {
  /** The rejected file. */
  file: File;
  /** `'accept'` for a type/extension mismatch, `'size'` for exceeding `maxSize`. */
  reason: FileRejectionReason;
}

export interface FileUploadProps extends Omit<ComponentProps<'div'>, 'value' | 'defaultValue'> {
  /** Controlled list of selected files. */
  value?: File[];
  /** Initial list of selected files (uncontrolled). @default [] */
  defaultValue?: File[];
  /** Called with the full file list whenever the selection changes. */
  onValueChange?: (files: File[]) => void;
  /** Allow selecting more than one file. @default false */
  multiple?: boolean;
  /** `accept` string (e.g. `image/*,.pdf`) applied to the picker and dropped files. */
  accept?: string;
  /** Maximum size, in bytes, for a single file. Larger files are rejected. */
  maxSize?: number;
  /**
   * Called with every file rejected by `accept` or `maxSize` when a selection is
   * attempted (via the picker or a drop). Use it to surface validation feedback.
   */
  onReject?: (rejections: FileRejection[]) => void;
  /** Disable the trigger, dropzone, and picker. @default false */
  disabled?: boolean;
  children: ReactNode;
}

// The hidden input stays interactive (a keyboard user reaches it through the
// Trigger button, which forwards the click) but is removed from layout.
const visuallyHiddenInputStyle: CSSProperties = {
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0,
};

export function FileUploadRoot(props: FileUploadProps) {
  const {
    render,
    value: valueProp,
    defaultValue,
    onValueChange,
    multiple = false,
    accept,
    maxSize,
    onReject,
    disabled = false,
    children,
    ...otherProps
  } = props;

  const [files, setFiles] = useControllableState(valueProp, defaultValue ?? [], onValueChange);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const rootId = useId();
  const inputId = `${rootId}input`;

  const addFiles = useCallback(
    (incoming: FileList | File[]) => {
      const accepted: File[] = [];
      const rejected: FileRejection[] = [];
      for (const file of Array.from(incoming)) {
        if (!isFileAccepted(file, accept)) {
          rejected.push({ file, reason: 'accept' });
        } else if (maxSize != null && file.size > maxSize) {
          rejected.push({ file, reason: 'size' });
        } else {
          accepted.push(file);
        }
      }

      if (rejected.length > 0) {
        onReject?.(rejected);
      }
      if (accepted.length === 0) {
        return;
      }
      // Single mode keeps only the first accepted file; multiple mode appends.
      setFiles(multiple ? [...files, ...accepted] : [accepted[0]]);
    },
    [files, multiple, accept, maxSize, onReject, setFiles],
  );

  const removeFile = useCallback(
    (file: File) => {
      setFiles(files.filter(f => f !== file));
    },
    [files, setFiles],
  );

  const clearFiles = useCallback(() => {
    setFiles([]);
  }, [setFiles]);

  const openFilePicker = useCallback(() => {
    if (!disabled) {
      inputRef.current?.click();
    }
  }, [disabled]);

  const contextValue = useMemo<FileUploadContextValue>(
    () => ({ files, disabled, multiple, accept, addFiles, removeFile, clearFiles, openFilePicker }),
    [files, disabled, multiple, accept, addFiles, removeFile, clearFiles, openFilePicker],
  );

  const state = { disabled, empty: files.length === 0 };

  const defaultProps: Record<string, unknown> = {
    'data-cl-slot': 'file-upload-root',
    children: (
      <>
        <input
          ref={inputRef}
          id={inputId}
          type='file'
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          // The Trigger button is the accessible control; it forwards clicks to
          // this input, so the input itself is hidden from assistive tech and
          // taken out of the tab order to avoid a redundant, unlabelled field.
          aria-hidden='true'
          tabIndex={-1}
          data-cl-slot='file-upload-input'
          style={visuallyHiddenInputStyle}
          onChange={event => {
            const list = event.currentTarget.files;
            if (list && list.length > 0) {
              addFiles(list);
            }
            // Reset so selecting the same file again still fires `change`.
            event.currentTarget.value = '';
          }}
        />
        {children}
      </>
    ),
  };

  return (
    <FileUploadContext.Provider value={contextValue}>
      {renderElement({
        defaultTagName: 'div',
        render,
        state,
        stateAttributesMapping: {
          disabled: (v: boolean) => (v ? { 'data-cl-disabled': '' } : null),
          empty: (v: boolean) => (v ? { 'data-cl-empty': '' } : null),
        },
        props: mergeProps<'div'>(defaultProps, otherProps),
      })}
    </FileUploadContext.Provider>
  );
}
