import { Component, type ReactNode, Suspense } from 'react';

export function LoomSectionBoundary({ children, failure }: { children: ReactNode; failure: string }) {
  return (
    <SectionErrorBoundary failure={failure}>
      <Suspense fallback={null}>{children}</Suspense>
    </SectionErrorBoundary>
  );
}

class SectionErrorBoundary extends Component<{ children: ReactNode; failure: string }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? <div role='alert'>{this.props.failure}</div> : this.props.children;
  }
}
