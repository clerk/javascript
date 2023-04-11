import type { Options, ZxcvbnResult } from '@zxcvbn-ts/core';
import type { ChangeEvent } from 'react';
import { useCallback, useRef } from 'react';
import React, { forwardRef } from 'react';

import { loadScript } from '../../utils';
import { useEnvironment } from '../contexts';
import { descriptors, Flex, Input } from '../customizables';
import { usePasswordComplexity, usePasswordStrength } from '../hooks';
import { EyeSlash } from '../icons';
import { useFormControl } from '../primitives/hooks';
import type { PropsOfComponent } from '../styledSystem';
import { IconButton } from './IconButton';

declare global {
  export interface Window {
    zxcvbnts: {
      core: {
        zxcvbn: (password: string, userInputs?: (string | number)[]) => ZxcvbnResult;
        zxcvbnOptions: {
          setOptions: (options: Partial<Options>) => void;
        };
      };
      'language-common'?: {
        dictionary: Options['dictionary'];
        adjacencyGraphs: Options['graphs'];
      };
    };
  }
}

type PasswordInputProps = PropsOfComponent<typeof Input> & {
  strengthMeter?: boolean;
  complexity?: boolean;
};

/**
 * Coordinate the success and error states between password complexity and strength
 * `usePasswordStrength` and `usePasswordComplexity` will fire callbacks to handle error state for their own
 * cases.
 * This hook aims to synchronize those states and throw 1 error if such exists
 * - Complexity errors has priority over strength errors.
 * - To set a field as successful, both complexity and strength need to be successful
 */
const useComplexityOverStrength = ({ strengthMeter }: Required<Pick<PasswordInputProps, 'strengthMeter'>>) => {
  const formControlProps = useFormControl();
  const hasComplexityError = useRef(false);
  const hasComplexitySuccess = useRef(false);
  return {
    setStrengthSuccess: useCallback(() => {
      if (!hasComplexityError.current) {
        formControlProps.setSuccessful?.(true);
      }
    }, []),

    setStrengthError: useCallback((errorMessage: string) => {
      if (!hasComplexityError.current) {
        formControlProps.setError?.(errorMessage);
      }
    }, []),

    setComplexityError: useCallback((errorMessage: string) => {
      hasComplexityError.current = !!errorMessage;
      formControlProps.setError?.(errorMessage);
    }, []),

    setComplexitySuccess: useCallback(() => {
      hasComplexityError.current = false;
      hasComplexitySuccess.current = true;
      if (!strengthMeter) {
        formControlProps.setSuccessful?.(true);
      }
    }, []),
  };
};

const loadZxcvbn = () => {
  return Promise.all([
    loadScript('https://cdn.jsdelivr.net/npm/@zxcvbn-ts/core@2.2.1/dist/zxcvbn-ts.min.js', {
      globalObject: window.zxcvbnts,
    }),
    loadScript('https://cdn.jsdelivr.net/npm/@zxcvbn-ts/language-common@2.0.1/dist/zxcvbn-ts.min.js', {
      globalObject: window.zxcvbnts,
    }),
  ]).then(() => {
    const core = window.zxcvbnts.core;
    const zxcvbnCommonPackage = window.zxcvbnts['language-common'];
    core.zxcvbnOptions.setOptions({
      dictionary: {
        ...zxcvbnCommonPackage?.dictionary,
      },
      graphs: zxcvbnCommonPackage?.adjacencyGraphs,
    });
    return core.zxcvbn;
  });
};

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>((props, ref) => {
  const [hidden, setHidden] = React.useState(true);
  const { id, onChange: onChangeProp, strengthMeter = false, complexity = false, ...rest } = props;
  const {
    userSettings: { passwordSettings },
  } = useEnvironment();

  const { show_zxcvbn } = passwordSettings;

  const { setStrengthError, setComplexityError, setStrengthSuccess, setComplexitySuccess } = useComplexityOverStrength({
    strengthMeter: strengthMeter && show_zxcvbn,
  });

  const { getScore } = usePasswordStrength({
    onValidationFailed: (_, errorMessage) => {
      setStrengthError(errorMessage);
    },
    onValidationSuccess: () => setStrengthSuccess(),
  });

  const { setPassword } = usePasswordComplexity(passwordSettings, {
    onValidationFailed: (_, errorMessage) => {
      setComplexityError(errorMessage);
    },
    onValidationSuccess: () => setComplexitySuccess(),
  });

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    // Lazy load `zxcvbn` on interaction
    if (strengthMeter && show_zxcvbn) {
      void loadZxcvbn().then(zxcvbn => getScore(zxcvbn)(e.target.value));
    }

    if (complexity) {
      /**
       * Avoid introducing internal state, treat complexity calculation within callback.
       * This removes the overhead of keeping state of whether the component has been touched or not.
       */
      setPassword(e.target.value);
    }
    return onChangeProp?.(e);
  };

  return (
    <Flex
      elementDescriptor={descriptors.formFieldInputGroup}
      direction='col'
      justify='center'
      sx={{ position: 'relative' }}
    >
      <Input
        {...rest}
        onChange={onChange}
        ref={ref}
        type={hidden ? 'password' : 'text'}
        sx={theme => ({ paddingRight: theme.space.$10 })}
      />

      <IconButton
        elementDescriptor={descriptors.formFieldInputShowPasswordButton}
        iconElementDescriptor={descriptors.formFieldInputShowPasswordIcon}
        aria-label={`${hidden ? 'Show' : 'Hide'} password`}
        variant='ghostIcon'
        tabIndex={-1}
        colorScheme={hidden ? 'neutral' : 'primary'}
        onClick={() => setHidden(s => !s)}
        sx={theme => ({
          position: 'absolute',
          right: 0,
          marginRight: theme.space.$3,
          ...(hidden && { color: theme.colors.$blackAlpha400 }),
        })}
        icon={EyeSlash}
      />
    </Flex>
  );
});
