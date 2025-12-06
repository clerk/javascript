import type { TelemetryEventRaw } from '@clerk/types';

import { canUseKeyless } from '../utils/feature-flags';
import { createClerkClientWithOptions } from './createClerkClient';
import { nodeFsOrThrow, nodePathOrThrow } from './fs/utils';

const EVENT_KEYLESS_ENV_DRIFT_DETECTED = 'KEYLESS_ENV_DRIFT_DETECTED';
const EVENT_SAMPLING_RATE = 1; // 100% sampling rate
const TELEMETRY_FLAG_FILE_TEMPLATE = '.clerk/.tmp/telemetry.{pk}.log';
type EventKeylessEnvDriftPayload = {
  publicKeyMatch: boolean;
  secretKeyMatch: boolean;
  envVarsMissing: boolean;
  keylessFileHasKeys: boolean;
  keylessPublishableKey: string;
  envPublishableKey: string;
};

/**
 * Gets the absolute path to the telemetry flag file.
 *
 * This file is used to track whether telemetry events have already been fired
 * to prevent duplicate event reporting during the application lifecycle.
 *
 * @returns The absolute path to the telemetry flag file in the project's .clerk/.tmp directory
 */
function getTelemetryFlagFilePath(pk: string): string {
  const path = nodePathOrThrow();
  return path.join(process.cwd(), TELEMETRY_FLAG_FILE_TEMPLATE.replace('{pk}', pk));
}

/**
 * Attempts to create a telemetry flag file to mark that a telemetry event has been fired.
 *
 * This function uses the 'wx' flag to create the file atomically - it will only succeed
 * if the file doesn't already exist. This ensures that telemetry events are only fired
 * once per application lifecycle, preventing duplicate event reporting.
 *
 * @returns Promise<boolean> - Returns true if the flag file was successfully created (meaning
 *   the event should be fired), false if the file already exists (meaning the event was
 *   already fired) or if there was an error creating the file
 */
function tryMarkTelemetryEventAsFired(pk: string): boolean {
  if (!canUseKeyless) {
    return false;
  }
  try {
    const { mkdirSync, writeFileSync } = nodeFsOrThrow();
    const path = nodePathOrThrow();
    const flagFilePath = getTelemetryFlagFilePath(pk);
    const flagDirectory = path.dirname(flagFilePath);

    // Ensure the directory exists before attempting to write the file
    mkdirSync(flagDirectory, { recursive: true });

    const fileContent = `Content not important. File name is the identifier for the telemetry event.`;
    writeFileSync(flagFilePath, fileContent, { flag: 'wx' });
    return true;
  } catch (error: unknown) {
    if ((error as { code?: string })?.code === 'EEXIST') {
      return false;
    }
    console.warn('Failed to create telemetry flag file:', error);
    return false;
  }
}

/**
 * Detects and reports environment drift between keyless configuration and environment variables.
 *
 * This function compares the Clerk keys stored in the keyless configuration file (.clerk/clerk.json)
 * with the keys set in environment variables (NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY).
 * It only reports drift when there's an actual mismatch between existing keys, not when keys are simply missing.
 *
 * The function handles several scenarios and only reports drift in specific cases:
 * - **Normal keyless mode**: env vars missing but keyless file has keys → no drift (expected)
 * - **No configuration**: neither env vars nor keyless file have keys → no drift (nothing to compare)
 * - **Actual drift**: env vars exist and don't match keyless file keys → drift detected
 * - **Empty keyless file**: keyless file exists but has no keys → no drift (nothing to compare)
 *
 * Drift is only detected when:
 * 1. Both environment variables and keyless file contain keys
 * 2. The keys in environment variables don't match the keys in the keyless file
 *
 * Telemetry events are only fired once per application lifecycle using a flag file mechanism
 * to prevent duplicate reporting.
 *
 * @returns Promise<void> - Function completes silently, errors are logged but don't throw
 */
export async function detectKeylessEnvDrift(): Promise<void> {
  if (!canUseKeyless) {
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

    // Check the state of environment variables and keyless file
    const hasEnvVars = Boolean(envPublishableKey || envSecretKey);
    const keylessFileHasKeys = Boolean(keylessFile?.publishableKey && keylessFile?.secretKey);
    const envVarsMissing = !envPublishableKey && !envSecretKey;

    // Early return conditions - no drift to detect in these scenarios:
    if (!hasEnvVars && !keylessFileHasKeys) {
      // Neither env vars nor keyless file have keys - nothing to compare
      return;
    }

    if (envVarsMissing && keylessFileHasKeys) {
      // Environment variables are missing but keyless file has keys - this is normal for keyless mode
      return;
    }

    if (!keylessFileHasKeys) {
      // Keyless file doesn't have keys, so no drift can be detected
      return;
    }

    // Only proceed with drift detection if we have something meaningful to compare
    if (!hasEnvVars) {
      return;
    }

    // Compare keys only when both sides have values to compare
    const publicKeyMatch = Boolean(
      envPublishableKey && keylessFile.publishableKey && envPublishableKey === keylessFile.publishableKey,
    );

    const secretKeyMatch = Boolean(envSecretKey && keylessFile.secretKey && envSecretKey === keylessFile.secretKey);

    // Determine if there's an actual drift:
    // Drift occurs when we have env vars that don't match the keyless file keys
    const hasActualDrift =
      (envPublishableKey && keylessFile.publishableKey && !publicKeyMatch) ||
      (envSecretKey && keylessFile.secretKey && !secretKeyMatch);

    // Only fire telemetry if there's an actual drift (not just missing keys)
    if (!hasActualDrift) {
      return;
    }

    const payload: EventKeylessEnvDriftPayload = {
      publicKeyMatch,
      secretKeyMatch,
      envVarsMissing,
      keylessFileHasKeys,
      keylessPublishableKey: keylessFile.publishableKey,
      envPublishableKey: envPublishableKey ?? '',
    };

    // Create a clerk client to access telemetry
    const clerkClient = createClerkClientWithOptions({
      publishableKey: keylessFile.publishableKey,
      secretKey: keylessFile.secretKey,
      telemetry: {
        samplingRate: 1,
      },
    });

    const shouldFireEvent = tryMarkTelemetryEventAsFired(keylessFile.publishableKey);

    if (shouldFireEvent) {
      // Fire drift detected event only if we successfully created the flag
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
