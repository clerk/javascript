import { act } from '@testing-library/react';

export function dragFilesOver(target: Element, ...files: File[]) {
  dispatchDrag(target, 'dragenter', files);
}

export function dropFiles(target: Element, ...files: File[]) {
  dispatchDrag(target, 'drop', files);
}

function dispatchDrag(target: Element, type: 'dragenter' | 'drop', files: File[]) {
  const dataTransfer = new DataTransfer();
  for (const file of files) {
    dataTransfer.items.add(file);
  }
  act(() => {
    target.dispatchEvent(new DragEvent(type, { bubbles: true, cancelable: true, dataTransfer }));
  });
}
