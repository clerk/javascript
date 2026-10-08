import { useId, useMemo, useState } from 'react';

import type { useKeylessPromptModel } from './keyless-prompt.model';
import { getCurrentState, getResolvedContent } from './keyless-prompt-content';
import { useDragToCorner } from './use-drag-to-corner';

export const useKeylessPromptController = (model: ReturnType<typeof useKeylessPromptModel>) => {
  const id = useId();
  const { isDragging, cornerStyle, containerRef, onPointerDown, preventClick, isInitialized } = useDragToCorner();
  const [isOpen, setIsOpen] = useState(true);
  const currentState = getCurrentState(
    model.claimed,
    typeof model.onDismiss === 'function' && model.claimed,
    model.isSignedIn,
  );
  const resolvedContent = useMemo(
    () =>
      getResolvedContent(currentState, {
        appName: model.appName,
        instanceUrl: model.instanceUrlToDashboard,
        claimUrl: model.claimUrlToDashboard,
        onDismiss: model.onDismiss,
      }),
    [currentState, model.appName, model.instanceUrlToDashboard, model.claimUrlToDashboard, model.onDismiss],
  );

  return {
    id,
    isDragging,
    cornerStyle,
    containerRef,
    onPointerDown,
    preventClick,
    isInitialized,
    isOpen,
    setIsOpen,
    resolvedContent,
  };
};
