const originalDocument = globalThis.document;
const originalDocumentDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'document');
const originalHasFocusDescriptor = originalDocument
  ? Object.getOwnPropertyDescriptor(originalDocument, 'hasFocus')
  : undefined;
const originalVisibilityStateDescriptor = originalDocument
  ? Object.getOwnPropertyDescriptor(originalDocument, 'visibilityState')
  : undefined;

export const setDocumentHasFocus = (value: boolean) => {
  Object.defineProperty(globalThis.document, 'hasFocus', { configurable: true, value: () => value });
};

export const setDocumentHasFocusValue = (value: unknown) => {
  Object.defineProperty(globalThis.document, 'hasFocus', { configurable: true, value });
};

export const setDocumentVisibilityState = (value: DocumentVisibilityState) => {
  Object.defineProperty(globalThis.document, 'visibilityState', { configurable: true, value });
};

export const setDocument = (value: unknown) => {
  Object.defineProperty(globalThis, 'document', { configurable: true, value });
};

export const restoreDocument = () => {
  if (originalDocumentDescriptor) {
    Object.defineProperty(globalThis, 'document', originalDocumentDescriptor);
  } else {
    Reflect.deleteProperty(globalThis, 'document');
  }

  if (!originalDocument) {
    return;
  }

  if (originalHasFocusDescriptor) {
    Object.defineProperty(originalDocument, 'hasFocus', originalHasFocusDescriptor);
  } else {
    Reflect.deleteProperty(originalDocument, 'hasFocus');
  }

  if (originalVisibilityStateDescriptor) {
    Object.defineProperty(originalDocument, 'visibilityState', originalVisibilityStateDescriptor);
  } else {
    Reflect.deleteProperty(originalDocument, 'visibilityState');
  }
};
