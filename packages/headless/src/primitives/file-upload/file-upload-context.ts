import { createContext, useContext } from 'react';

export interface FileUploadContextValue {
  /** The currently selected files. */
  files: File[];
  /** Whether the whole upload is disabled. */
  disabled: boolean;
  /** Whether more than one file can be selected. */
  multiple: boolean;
  /** The `accept` string forwarded to the hidden input and used to filter drops. */
  accept: string | undefined;
  /** Add files, applying `accept` filtering and single/multiple semantics. */
  addFiles: (incoming: FileList | File[]) => void;
  /** Remove a single file by identity. */
  removeFile: (file: File) => void;
  /** Remove every selected file. */
  clearFiles: () => void;
  /** Open the native file picker (clicks the hidden input). */
  openFilePicker: () => void;
}

export const FileUploadContext = createContext<FileUploadContextValue | null>(null);

export function useFileUploadContext(): FileUploadContextValue {
  const ctx = useContext(FileUploadContext);
  if (!ctx) {
    throw new Error('FileUpload compound components must be used within <FileUpload.Root>');
  }
  return ctx;
}

export interface FileUploadItemContextValue {
  /** The file this item represents. */
  file: File;
  /** Remove this file from the upload. */
  remove: () => void;
}

export const FileUploadItemContext = createContext<FileUploadItemContextValue | null>(null);

export function useFileUploadItemContext(): FileUploadItemContextValue {
  const ctx = useContext(FileUploadItemContext);
  if (!ctx) {
    throw new Error('FileUpload item parts must be used within <FileUpload.Item>');
  }
  return ctx;
}

/**
 * Reads the current upload state and actions. Use this to render your own list
 * of files (wrapping each in `<FileUpload.Item>`), a file count, or a custom
 * clear button. Must be called inside `<FileUpload.Root>`.
 */
export function useFileUpload(): Pick<
  FileUploadContextValue,
  'files' | 'addFiles' | 'removeFile' | 'clearFiles' | 'openFilePicker' | 'disabled'
> {
  const { files, addFiles, removeFile, clearFiles, openFilePicker, disabled } = useFileUploadContext();
  return { files, addFiles, removeFile, clearFiles, openFilePicker, disabled };
}
