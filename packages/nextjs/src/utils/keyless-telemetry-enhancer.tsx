'use client';

import { useEffect } from 'react';

import { useClerk } from '../client-boundary/hooks';
import { canUseKeyless } from './feature-flags';
import { NextJSTelemetryCollector } from './telemetry-collector';

/**
 * Component that enhances the Clerk instance's telemetry collector with keyless boosting
 * when running in Next.js keyless mode.
 */
export const KeylessTelemetryEnhancer = () => {
  const clerk = useClerk();

  useEffect(() => {
    // Only enhance telemetry if we're actually in keyless runtime and telemetry exists
    const isKeylessRuntime = typeof window !== 'undefined' && (window as any).__clerk_keyless === true;
    if (!canUseKeyless || !isKeylessRuntime || !clerk.telemetry) {
      return;
    }

    // Save original collector and avoid double swapping
    const originalCollector = clerk.telemetry;

    // If already wrapped by our NextJSTelemetryCollector, do nothing
    if (originalCollector instanceof NextJSTelemetryCollector) {
      return;
    }

    // Create a new collector that wraps the original with keyless boosting
    const enhancedCollector = new NextJSTelemetryCollector({
      disabled: !originalCollector.isEnabled,
      debug: originalCollector.isDebug,
      publishableKey: clerk.publishableKey,
      samplingRate: 1,
      sdk: PACKAGE_NAME,
      sdkVersion: PACKAGE_VERSION,
    });

    // Replace the telemetry collector
    clerk.telemetry = enhancedCollector;

    // Restore the original collector on cleanup (mainly for HMR in dev)
    return () => {
      if (clerk.telemetry === enhancedCollector) {
        clerk.telemetry = originalCollector;
      }
    };
  }, [clerk]);

  return null;
};
