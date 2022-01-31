import React from 'react';
import { Button } from '../button';
import { Spinner } from '../spinner';
import { ImageDefaultIcon, UploadIcon } from '../../assets/icons';
import { SupportedMimeType } from '../../utils/mimeTypeExtensions';
//@ts-ignore
import styles from './FileDropArea.module.scss';

enum UIState {
  Idle = 'idle',
  Hover = 'hover',
  Invalid = 'invalid',
  Uploading = 'uploading',
}

export type FileDropAreaProps = {
  acceptedTypes: SupportedMimeType[];
  sizeLimitBytes: number;
  handleSuccess: (file: File) => void;
  handleError?: () => void;
};

export function FileDropArea({
  acceptedTypes,
  sizeLimitBytes,
  handleSuccess,
  handleError,
}: FileDropAreaProps): JSX.Element {
  const [uiState, setUiState] = React.useState<UIState>(UIState.Idle);

  const fileRef = React.useRef<HTMLInputElement>(null);

  const promptForFile = () => {
    fileRef.current?.click();
  };

  const fileIsValid = (f: File): boolean => {
    return fileTypeIsValid(f.type) && fileSizeIsValid(f.size);
  };

  const fileTypeIsValid = (mime: string): mime is SupportedMimeType => {
    return acceptedTypes.includes(mime as SupportedMimeType);
  };

  const fileSizeIsValid = (bytes: number): boolean => {
    if (!sizeLimitBytes) {
      return true;
    }
    return bytes <= sizeLimitBytes;
  };

  const handleDragEnter = (ev: React.DragEvent) => {
    const files = ev.dataTransfer.items;
    if (files.length > 0 && !fileTypeIsValid(files[0].type)) {
      setUiState(UIState.Invalid);
    } else {
      setUiState(UIState.Hover);
    }
  };

  const handleDragLeave = (ev: React.DragEvent) => {
    const dropArea = ev.currentTarget,
      elLeaving = ev.relatedTarget as Element;
    if (dropArea.contains(elLeaving)) {
      return;
    }
    setUiState(UIState.Idle);
  };

  const handleOver = (ev: React.DragEvent) => {
    ev.preventDefault();
  };

  const handleDrop = (ev: React.DragEvent) => {
    ev.preventDefault();
    handleDragLeave(ev);
    const files = ev.dataTransfer.files;
    validateAndUpload(files[0]);
  };

  const areaHandlers = {
    onDragEnter: handleDragEnter,
    onDragLeave: handleDragLeave,
    onDragOver: handleOver,
    onDrop: handleDrop,
  };

  const handleInput = (ev: React.ChangeEvent<HTMLInputElement>) => {
    const files = ev.currentTarget.files || [];
    validateAndUpload(files[0]);
  };

  const validateAndUpload = (file: File) => {
    if (!file) {
      return;
    }
    if (!fileIsValid(file)) {
      handleError && handleError();
      return;
    }
    void uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    setUiState(UIState.Uploading);
    handleSuccess(file);
  };

  const buttonEl = () => {
    const v = uiState == UIState.Idle ? 'visible' : 'hidden';
    return (
      <div style={{ visibility: v }}>
        <Button
          hoverable={true}
          buttonSize='small'
          flavor='text'
          onClick={promptForFile}
        >
          <UploadIcon style={{ marginRight: '0.5em' }} /> Select file to upload
        </Button>
        <input
          type='file'
          accept={acceptedTypes.join(',')}
          className={styles.fileInput}
          ref={fileRef}
          onChange={handleInput}
        />
      </div>
    );
  };

  const states = {
    idle: (
      <div className={styles.dropArea} {...areaHandlers}>
        <ImageDefaultIcon className={styles.icon} />
        <p>Drag file here, or</p>
        {buttonEl()}
      </div>
    ),
    hover: (
      <div
        className={`${styles.dropArea} ${styles.fileHover}`}
        {...areaHandlers}
      >
        <ImageDefaultIcon className={styles.icon} />
        <p>Drop photo to upload</p>
        {buttonEl()}
      </div>
    ),
    invalid: (
      <div className={`${styles.dropArea} ${styles.invalid}`} {...areaHandlers}>
        <ImageDefaultIcon className={styles.icon} />
        <p>Unsupported file type</p>
        {buttonEl()}
      </div>
    ),
    uploading: (
      <div className={styles.dropArea} {...areaHandlers}>
        <Spinner />
        <p style={{ marginTop: '3em' }}>Uploading file</p>
      </div>
    ),
  };

  return states[uiState];
}
