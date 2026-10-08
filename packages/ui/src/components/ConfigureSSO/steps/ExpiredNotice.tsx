import { useExpiredNoticeController } from './expired-notice.controller';
import { ExpiredNoticeView } from './expired-notice.view';

type ExpiredNoticeProps = {
  expiresAt: Date | null;
  onPrepareOwnershipVerification: () => Promise<void>;
};

export const ExpiredNotice = ({ expiresAt, onPrepareOwnershipVerification }: ExpiredNoticeProps): JSX.Element => {
  const controller = useExpiredNoticeController(onPrepareOwnershipVerification);
  return (
    <ExpiredNoticeView
      expiresAt={expiresAt}
      {...controller}
    />
  );
};
