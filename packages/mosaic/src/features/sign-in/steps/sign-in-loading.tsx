import { Card } from '../../../components/card';
import { Spinner } from '../../../components/spinner';
import { useMessages } from '../../../localization';
import { styles } from '../sign-in.styles';
import { SignInCaptcha } from './sign-in-captcha';

interface SignInLoadingProps {
  globalErrorMessage?: string;
}

export function SignInLoading({ globalErrorMessage }: SignInLoadingProps) {
  const m = useMessages('signIn');

  return (
    <>
      <Card.Banner
        role='alert'
        color='negative'
      >
        {globalErrorMessage}
      </Card.Banner>
      <Card.Content xstyle={styles.loading}>
        <Spinner label={m.loading} />
        <SignInCaptcha />
      </Card.Content>
    </>
  );
}
