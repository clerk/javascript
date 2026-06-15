export interface NativeSessionSnapshot {
  sessionId?: string | null;
  session?: { id?: string | null } | null;
  user?: {
    id: string;
    firstName?: string | null;
    lastName?: string | null;
    imageUrl?: string | null;
    primaryEmailAddress?: string | null;
    primaryPhoneNumber?: string | null;
  } | null;
  clientToken?: string | null;
}

type NativeSessionListener = (snapshot?: NativeSessionSnapshot) => void;

const listeners = new Set<NativeSessionListener>();

export function addNativeSessionListener(listener: NativeSessionListener): () => void {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

export function notifyNativeSessionChanged(snapshot?: NativeSessionSnapshot): void {
  listeners.forEach(listener => listener(snapshot));
}
