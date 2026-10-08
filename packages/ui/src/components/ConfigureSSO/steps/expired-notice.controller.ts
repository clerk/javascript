import { useEffect, useRef, useState } from 'react';

export const useExpiredNoticeController = (onPrepareOwnershipVerification: () => Promise<void>) => {
  const mounted = useRef(true);
  const pending = useRef<object | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      pending.current = null;
    };
  }, []);

  const handleVerifyAgain = async () => {
    if (!mounted.current || pending.current) {
      return;
    }
    const request = {};
    pending.current = request;
    setIsVerifying(true);
    try {
      await onPrepareOwnershipVerification();
    } catch (error) {
      if (mounted.current && pending.current === request) {
        throw error;
      }
    } finally {
      if (mounted.current && pending.current === request) {
        pending.current = null;
        setIsVerifying(false);
      }
    }
  };

  return { isVerifying, handleVerifyAgain };
};
