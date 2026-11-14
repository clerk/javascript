import { Card } from '../../../components/card';
import { Spinner } from '../../../components/spinner';
import { useMessages } from '../../../localization';
import { styles } from '../auth-flow.styles';
import { FlowCaptcha } from './captcha';

interface LoadingNoticeProps {
  globalErrorMessage?: string;
}

export function LoadingNotice({ globalErrorMessage }: LoadingNoticeProps) {
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
        <FlowCaptcha />
      </Card.Content>
    </>
  );
}
