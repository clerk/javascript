import { QueryErrorResetBoundary } from '@clerk/loom/react';
import { Component, type ReactNode, Suspense } from 'react';

export function LoomSectionBoundary({ children, failure }: { children: ReactNode; failure: string }) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <SectionErrorBoundary
          reset={reset}
          failure={failure}
        >
          <Suspense fallback={null}>{children}</Suspense>
        </SectionErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}

class SectionErrorBoundary extends Component<
  { children: ReactNode; reset: () => void; failure: string },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <div role='alert'>
        <p>{this.props.failure}</p>
        <button
          type='button'
          onClick={() => {
            this.props.reset();
            this.setState({ failed: false });
          }}
        >
          Try again
        </button>
      </div>
    ) : (
      this.props.children
    );
  }
}
