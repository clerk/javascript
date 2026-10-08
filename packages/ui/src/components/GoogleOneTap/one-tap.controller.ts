import { useEffect, useRef } from 'react';

import type { OneTapModel } from './one-tap.model';

export function useOneTapController(model: OneTapModel): void {
  const prompted = useRef(false);
  const modelRef = useRef(model);
  modelRef.current = model;

  useEffect(() => {
    modelRef.current.setCredentialHandler(credential => {
      prompted.current = false;
      void modelRef.current.authenticateCredential(credential).catch(error => console.error(error));
    });
  }, []);

  useEffect(() => {
    if (model.isReady && !model.userId && !prompted.current) {
      modelRef.current.prompt(() => modelRef.current.close());
      prompted.current = true;
    }
  }, [model.isReady, model.userId]);

  useEffect(() => {
    return () => {
      if (model.isReady && prompted.current) {
        prompted.current = false;
        modelRef.current.cancel();
      }
    };
  }, [model.isReady]);
}
