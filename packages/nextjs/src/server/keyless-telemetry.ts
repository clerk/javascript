import type { TelemetryEventRaw } from '@clerk/types';

import { createClerkClientWithOptions } from './createClerkClient';

const EVENT_KEYLESS_ENV_DRIFT_DETECTED = 'KEYLESS_ENV_DRIFT_DETECTED';
const EVENT_SAMPLING_RATE = 1; // 100% sampling rate

type EventKeylessEnvDriftPayload = {
  publicKeyMatch: boolean;
  secretKeyMatch: boolean;
  envVarsMissing: boolean;
  keylessFileHasKeys: boolean;
  keylessPublishableKey: string;
  envPublishableKey: string;
};

/**
 * Detects environment variable drift for keyless Next.js applications and fires telemetry events.
 *
 * This function compares the publishableKey and secretKey values from `.clerk/.tmp/keyless.json`
 * with the `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` environment variables.
 *
 * If there's a mismatch, it fires a `KEYLESS_ENV_DRIFT_DETECTED` event.
 * For local testing purposes, it also fires a `KEYLESS_ENV_DRIFT_NOT_DETECTED` event when
 * keys exist and match the environment variables.
 */
export async function detectKeylessEnvDrift(): Promise<void> {
  // Only run on server side
  if (typeof window !== 'undefined') {
    return;
  }

  try {
    // Dynamically import server-side dependencies to avoid client-side issues
    const { safeParseClerkFile } = await import('./keyless-node.js');

    // Read the keyless configuration file
    const keylessFile = safeParseClerkFile();

    if (!keylessFile) {
      return;
    }

    // Get environment variables
    const envPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
    const envSecretKey = process.env.CLERK_SECRET_KEY;

    // Check if environment variables are missing, and keys exist in keyless file
    const envVarsMissing = !envPublishableKey && !envSecretKey;
    const keylessFileHasKeys = Boolean(keylessFile?.publishableKey && keylessFile?.secretKey);

    if (envVarsMissing && keylessFileHasKeys) {
      // Environment variables are missing but keyless file has keys - this is normal for keyless mode
      return;
    }

    // Compare publishable keys
    const publicKeyMatch = Boolean(envPublishableKey === keylessFile?.publishableKey);

    // Compare secret keys
    const secretKeyMatch = Boolean(envSecretKey === keylessFile?.secretKey);

    // Check if there's a drift (mismatch between env vars and keyless file)
    const hasDrift = !publicKeyMatch || !secretKeyMatch;

    const payload: EventKeylessEnvDriftPayload = {
      publicKeyMatch,
      secretKeyMatch,
      envVarsMissing,
      keylessFileHasKeys,
      keylessPublishableKey: keylessFile.publishableKey,
      envPublishableKey: envPublishableKey as string,
    };

    // Create a clerk client to access telemetry
    const clerkClient = createClerkClientWithOptions({
      publishableKey: keylessFile.publishableKey,
      secretKey: keylessFile.secretKey,
    });

    if (hasDrift) {
      // Fire drift detected event
      const driftDetectedEvent: TelemetryEventRaw<EventKeylessEnvDriftPayload> = {
        event: EVENT_KEYLESS_ENV_DRIFT_DETECTED,
        eventSamplingRate: EVENT_SAMPLING_RATE,
        payload,
      };

      clerkClient.telemetry?.record(driftDetectedEvent);
    }
  } catch (error) {
    // Silently handle errors to avoid breaking the application
    console.warn('Failed to detect keyless environment drift:', error);
  }
}
