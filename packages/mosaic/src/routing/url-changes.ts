type Listener = () => void;

const listeners = new Set<Listener>();
let installed = false;

function notify() {
  queueMicrotask(() => {
    for (const listener of listeners) {
      listener();
    }
  });
}

function patchHistory(method: 'pushState' | 'replaceState') {
  const original = history[method];
  history[method] = function (...args: Parameters<History['pushState']>) {
    original.apply(this, args);
    notify();
  };
}

function install() {
  if (installed || typeof window === 'undefined') {
    return;
  }
  installed = true;
  window.addEventListener('hashchange', notify);
  const navigation: Navigation | undefined = window.navigation;
  if (navigation) {
    navigation.addEventListener('currententrychange', notify);
    return;
  }
  window.addEventListener('popstate', notify);
  patchHistory('pushState');
  patchHistory('replaceState');
}

export function subscribeToUrlChanges(listener: Listener): () => void {
  install();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
