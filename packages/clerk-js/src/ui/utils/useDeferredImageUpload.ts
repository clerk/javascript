import React from 'react';

import { useCardState } from '../elements/contexts';

type ResourceWithImage = {
  imageUrl?: string;
};

type UseDeferredImageUploadOptions<T extends ResourceWithImage> = {
  resource: T;
  onReset?: () => void;
};

type UseDeferredImageUploadReturn<T extends ResourceWithImage> = {
  pendingFile: File | null;
  imageRemoved: boolean;
  imageChanged: boolean;
  resourceForPreview: T;
  handleImageChange: (file: File) => Promise<void>;
  handleImageRemove: () => void;
  handleReset: () => void;
  saveImage: (uploadFn: (file: File) => Promise<unknown>) => Promise<void>;
};

/**
 * Custom hook to manage deferred image upload state for profile forms.
 * Allows users to preview image changes before committing them via the Save button.
 *
 * @param options - Configuration options
 * @param options.resource - The resource object (user/organization) with imageUrl
 * @param options.onReset - Optional callback when reset is triggered
 * @returns Object containing state, handlers, and save function
 */
export const useDeferredImageUpload = <T extends ResourceWithImage>({
  resource,
  onReset,
}: UseDeferredImageUploadOptions<T>): UseDeferredImageUploadReturn<T> => {
  const card = useCardState();
  const [pendingFile, setPendingFile] = React.useState<File | null>(null);
  const [imageRemoved, setImageRemoved] = React.useState(false);

  const imageChanged = pendingFile !== null || imageRemoved;

  const handleImageChange = async (file: File) => {
    setPendingFile(file);
    setImageRemoved(false);
    card.setIdle();
  };

  const handleImageRemove = () => {
    setPendingFile(null);
    setImageRemoved(true);
    card.setIdle();
  };

  const handleReset = () => {
    setPendingFile(null);
    setImageRemoved(false);
    onReset?.();
  };

  const saveImage = async (uploadFn: (file: File) => Promise<unknown>) => {
    if (pendingFile) {
      await uploadFn(pendingFile);
    } else if (imageRemoved) {
      await uploadFn(null as unknown as File);
    }

    setPendingFile(null);
    setImageRemoved(false);
  };

  const resourceForPreview = React.useMemo(() => {
    if (imageRemoved) {
      return { ...resource, imageUrl: '' };
    }
    return resource;
  }, [resource, imageRemoved]);

  return {
    pendingFile,
    imageRemoved,
    imageChanged,
    resourceForPreview,
    handleImageChange,
    handleImageRemove,
    handleReset,
    saveImage,
  };
};
