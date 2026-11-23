import { Card } from '../../components/card';
import { Spinner } from '../../components/spinner';
import { styles } from './auth.styles';
import { AuthCaptcha } from './auth-captcha';

export interface AuthLoadingMessages {
  loading: string;
}

interface AuthLoadingProps {
  messages: AuthLoadingMessages;
  globalErrorMessage?: string;
}

export function AuthLoading({ messages, globalErrorMessage }: AuthLoadingProps) {
  return (
    <>
      <Card.Banner
        role='alert'
        color='negative'
      >
        {globalErrorMessage}
      </Card.Banner>
      <Card.Content xstyle={styles.loading}>
        <Spinner label={messages.loading} />
        <AuthCaptcha />
      </Card.Content>
    </>
  );
}
