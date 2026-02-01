import type {
  AuthStatus,
  EnvironmentType,
  SessionReplayInitialMeta,
  SessionReplayPostAuthMeta,
  SessionReplayRecorder,
  SessionType,
} from './types';
import { createSessionReplayRecorder } from './recorder';

export interface SessionReplayNamespace {
  startRecording(params: { sessionType: SessionType }): Promise<void>;
  stopRecording(params?: { status?: AuthStatus }): void;
  completeRecording(params: { userId: string; sessionId: string }): void;
  failRecording(): void;
  abandonRecording(): void;
  getRecordingId(): string | null;
  isRecording(): boolean;
  addMeta(meta: Record<string, string>): void;
}

export interface SessionReplayOptions {
  publicAPIKey: string;
  serverUrl?: string;
  clientId: string;
  instanceId: string;
  environment: EnvironmentType;
  userId?: string;
  sessionId?: string;
}

export class SessionReplay implements SessionReplayNamespace {
  #recorder: SessionReplayRecorder | null = null;
  #options: SessionReplayOptions;
  #enabled = false;

  constructor(options: SessionReplayOptions) {
    this.#options = options;

    if (options.publicAPIKey) {
      this.#enabled = true;
      this.#recorder = createSessionReplayRecorder({
        publicAPIKey: options.publicAPIKey,
        serverUrl: options.serverUrl,
      });
    }
  }

  async startRecording(params: { sessionType: SessionType }): Promise<void> {
    if (!this.#enabled || !this.#recorder) {
      return;
    }

    const meta: SessionReplayInitialMeta = {
      client_id: this.#options.clientId,
      instance_id: this.#options.instanceId,
      session_type: params.sessionType,
      environment: this.#options.environment,
      started_at: new Date().toISOString(),
      user_id: this.#options.userId,
      clerk_session_id: this.#options.sessionId,
    };

    await this.#recorder.start(meta);
  }

  stopRecording(params?: { status?: AuthStatus }): void {
    if (!this.#recorder) {
      return;
    }

    if (params?.status) {
      this.#recorder.addMeta({
        auth_status: params.status,
        completed_at: new Date().toISOString(),
      });
    }

    this.#recorder.stop();
  }

  completeRecording(params: { userId: string; sessionId: string }): void {
    if (!this.#recorder) {
      return;
    }

    const meta: SessionReplayPostAuthMeta = {
      user_id: params.userId,
      clerk_session_id: params.sessionId,
      auth_status: 'completed',
      completed_at: new Date().toISOString(),
    };

    this.#recorder.addMeta(meta);
    this.#recorder.stop();
  }

  addMeta(meta: Record<string, string>): void {
    if (!this.#recorder) {
      return;
    }

    this.#recorder.addMeta(meta);
  }

  failRecording(): void {
    this.stopRecording({ status: 'failed' });
  }

  abandonRecording(): void {
    this.stopRecording({ status: 'abandoned' });
  }

  getRecordingId(): string | null {
    return this.#recorder?.getRecordingId() ?? null;
  }

  isRecording(): boolean {
    return this.#recorder?.isRecording() ?? false;
  }
}
