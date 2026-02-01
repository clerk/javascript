import type {
  AuthStatus,
  SessionReplayConfig,
  SessionReplayInitialMeta,
  SessionReplayPostAuthMeta,
  SessionReplayRecorder,
  SessionType,
} from './types';
import { loadRRWebCloud } from '@/utils/rrwebCloud';
import type rrwebCloud from '@rrwebcloud/js-client';

export class SessionReplayRecorderImpl implements SessionReplayRecorder {
  #config: SessionReplayConfig;
  #isRecording = false;
  #recordingId: string | null = null;
  #rrwebCloud: typeof rrwebCloud | null = null;

  constructor(config: SessionReplayConfig) {
    this.#config = config;
  }

  async start(meta: SessionReplayInitialMeta): Promise<void> {
    if (this.#isRecording) {
      return;
    }

    if (typeof window === 'undefined') {
      console.warn('[Clerk] Session replay is only available in browser environments');
      return;
    }

    try {
      const load = loadRRWebCloud();
      this.#rrwebCloud = await load();
    } catch (error) {
      console.warn('[Clerk] Failed to load rrWeb Cloud SDK:', error);
      return;
    }

    const stringMeta: Record<string, string> = {
      client_id: meta.client_id,
      instance_id: meta.instance_id,
      session_type: meta.session_type,
      environment: meta.environment,
      started_at: meta.started_at,
    };

    this.#rrwebCloud.start({
      includePii: true,
      publicApiKey: this.#config.publicAPIKey,
      serverUrl: this.#config.serverUrl || 'https://replay.lclclerk.com/recordings/{recordingId}/ingest/ws',
      autostart: true,
      meta: stringMeta,
      errorHandler(error) {
        console.error('[Clerk] Session replay error:', error);
      },
      captureAssets: {
        stylesheet: 'without-fetch',
      },
      inlineImages: true,
      collectFonts: true,
      recordDOM: true,
      recordCrossOriginIframes: true,
      inlineStylesheet: true,
    });

    this.#isRecording = true;
    this.#recordingId = this.#rrwebCloud.getRecordingId();
  }

  stop(): void {
    if (!this.#isRecording || !this.#rrwebCloud) {
      return;
    }

    this.#rrwebCloud.stop(true);
    this.#isRecording = false;
  }

  addMeta(meta: Partial<SessionReplayPostAuthMeta>): void {
    if (!this.#rrwebCloud) {
      return;
    }

    const stringMeta: Record<string, string> = {};

    if (meta.user_id) {
      stringMeta.user_id = meta.user_id;
    }
    if (meta.clerk_session_id) {
      stringMeta.clerk_session_id = meta.clerk_session_id;
    }
    if (meta.auth_status) {
      stringMeta.auth_status = meta.auth_status;
    }
    if (meta.completed_at) {
      stringMeta.completed_at = meta.completed_at;
    }

    this.#rrwebCloud.addMeta(stringMeta);
  }

  getRecordingId(): string | null {
    if (this.#rrwebCloud) {
      this.#recordingId = this.#rrwebCloud.getRecordingId();
    }
    return this.#recordingId;
  }

  isRecording(): boolean {
    return this.#isRecording;
  }
}

export function createSessionReplayRecorder(config: SessionReplayConfig): SessionReplayRecorder {
  return new SessionReplayRecorderImpl(config);
}

export function formatSessionType(isSignUp: boolean): SessionType {
  return isSignUp ? 'sign_up' : 'sign_in';
}

export function formatAuthStatus(status: 'completed' | 'failed' | 'abandoned'): AuthStatus {
  return status;
}
