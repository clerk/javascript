export type SessionType = 'sign_in' | 'sign_up';
export type AuthStatus = 'started' | 'completed' | 'failed' | 'abandoned';
export type EnvironmentType = 'production' | 'development';

export interface SessionReplayInitialMeta {
  client_id: string;
  instance_id: string;
  session_type: SessionType;
  environment: EnvironmentType;
  started_at: string;
  user_id?: string;
  clerk_session_id?: string;
}

export interface SessionReplayPostAuthMeta {
  user_id: string;
  clerk_session_id: string;
  auth_status: AuthStatus;
  completed_at: string;
}

export interface SessionReplayConfig {
  publicAPIKey: string;
  serverUrl?: string;
  autostart?: boolean;
  includePii?: boolean;
}

export interface SessionReplayRecorder {
  start(meta: SessionReplayInitialMeta): void;
  stop(): void;
  addMeta(meta: Partial<SessionReplayPostAuthMeta>): void;
  getRecordingId(): string | null;
  isRecording(): boolean;
}

declare global {
  interface Window {
    rrwebCloud?: {
      start: (config?: Partial<SessionReplayConfig & { meta: Record<string, string> }>) => void;
      stop: () => void;
      addMeta: (meta: Record<string, string>) => void;
      getRecordingId: () => string | null;
    };
  }
}
