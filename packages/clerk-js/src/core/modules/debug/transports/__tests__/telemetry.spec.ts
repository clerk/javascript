import type { TelemetryCollector } from '@clerk/shared/telemetry';
import type { MockedFunction } from 'vitest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { DebugLogEntry } from '../../types';
import { TelemetryTransport } from '../telemetry';

describe('TelemetryTransport', () => {
  let mockCollector: {
    recordLog: MockedFunction<TelemetryCollector['recordLog']>;
    record: MockedFunction<TelemetryCollector['record']>;
    isEnabled: boolean;
    isDebug: boolean;
  };
  let transport: TelemetryTransport;

  beforeEach(() => {
    mockCollector = {
      recordLog: vi.fn(),
      record: vi.fn(),
      isEnabled: true,
      isDebug: false,
    };

    transport = new TelemetryTransport(mockCollector);
  });

  it('should send debug log entries to the telemetry collector', async () => {
    const logEntry: DebugLogEntry = {
      level: 'info',
      message: 'Test message',
      timestamp: Date.now(),
      context: { test: 'value' },
      source: 'test',
      userId: 'user-123',
      sessionId: 'session-456',
      organizationId: 'org-789',
    };

    await transport.send(logEntry);

    expect(mockCollector.recordLog).toHaveBeenCalledWith({
      level: 'info',
      message: 'Test message',
      timestamp: logEntry.timestamp,
      context: { test: 'value' },
      source: 'test',
      userId: 'user-123',
      sessionId: 'session-456',
      organizationId: 'org-789',
    });
  });

  it('should handle missing telemetry collector gracefully', async () => {
    const transportWithoutCollector = new TelemetryTransport();
    const logEntry: DebugLogEntry = {
      level: 'info',
      message: 'Test message',
      timestamp: Date.now(),
    };

    // Should not throw when no collector is provided
    await expect(transportWithoutCollector.send(logEntry)).resolves.toBeUndefined();
  });
});
