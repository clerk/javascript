type NativeSessionListener = () => void;

const listeners = new Set<NativeSessionListener>();

export function addNativeSessionListener(listener: NativeSessionListener): () => void {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

export function notifyNativeSessionChanged(): void {
  listeners.forEach(listener => listener());
}
