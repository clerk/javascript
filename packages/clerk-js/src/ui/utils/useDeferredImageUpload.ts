import React from 'react';

type UseDeferredImageUploadReturn = {
  pendingImageFile: File | null;
  imageRemoved: boolean;
  previewUrl: string | null;
  hasImageChanges: boolean;
  shouldShowRemoveButton: boolean;
  handleImageChange: (file: File) => void;
  handleImageRemove: () => void;
  handleReset: () => void;
  uploadImage: (uploadFn: (file: File | null) => Promise<void>) => Promise<void>;
};

export const useDeferredImageUpload = (hasExistingImage: boolean = false): UseDeferredImageUploadReturn => {
  const [pendingImageFile, setPendingImageFile] = React.useState<File | null>(null);
  const [imageRemoved, setImageRemoved] = React.useState(false);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);

  const hasImageChanges = React.useMemo(() => {
    if (pendingImageFile !== null) {
      return true;
    }

    if (imageRemoved) {
      return hasExistingImage;
    }

    return false;
  }, [pendingImageFile, imageRemoved, hasExistingImage]);

  const shouldShowRemoveButton = hasExistingImage || pendingImageFile !== null;

  const handleImageChange = React.useCallback((file: File) => {
    setPendingImageFile(file);
    setImageRemoved(false);
  }, []);

  const handleImageRemove = React.useCallback(() => {
    setPendingImageFile(null);
    setImageRemoved(true);
    setPreviewUrl(null);
  }, []);

  const handleReset = React.useCallback(() => {
    setPendingImageFile(null);
    setImageRemoved(false);
    setPreviewUrl(null);
  }, []);

  const uploadImage = React.useCallback(
    async (uploadFn: (file: File | null) => Promise<void>) => {
      if (pendingImageFile) {
        await uploadFn(pendingImageFile);
      } else if (imageRemoved) {
        await uploadFn(null);
      }
    },
    [pendingImageFile, imageRemoved],
  );

  React.useEffect(() => {
    if (!pendingImageFile) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(pendingImageFile);
    setPreviewUrl(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [pendingImageFile]);

  return {
    pendingImageFile,
    imageRemoved,
    previewUrl,
    hasImageChanges,
    shouldShowRemoveButton,
    handleImageChange,
    handleImageRemove,
    handleReset,
    uploadImage,
  };
};
