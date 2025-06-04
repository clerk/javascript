declare global {
  namespace NodeJS {
    interface ProcessEnv {
      GOOGLE_SERVICE_ACCOUNT_KEY?: string;
      GOOGLE_APPLICATION_CREDENTIALS?: string;
      GCS_PROJECT_ID?: string;
      GCS_BUCKET?: string;
      OPENAI_API_KEY?: string;
      ANTHROPIC_API_KEY?: string;
      GITHUB_TOKEN?: string;
    }
  }
}
