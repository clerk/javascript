import { render } from '@clerk/shared/testUtils';
import React from 'react';

import { useMaxAllowedInstancesGuard, withMaxAllowedInstancesGuard } from '../useMaxAllowedInstancesGuard';

const originalError = console.error;
const ERR = 'usedMoreThanOnceError';

describe('Max allowed instances Hook & Hoc', () => {
  beforeAll(() => {
    console.error = jest.fn();
  });

  afterAll(() => {
    console.error = originalError;
  });

  describe('useMaxAllowedInstancesGuard()', () => {
    const TestingComponent = () => {
      useMaxAllowedInstancesGuard('TestingComponent', ERR);
      return <div>hello</div>;
    };

    it('renders normally if not used more than N times', () => {
      expect(() => {
        render(
          <div>
            <TestingComponent />
          </div>,
        );
      }).not.toThrowError(ERR);
    });

    it('throws an error if component is used more than N times', () => {
      expect(() => {
        render(
          <div>
            <TestingComponent />
            <TestingComponent />
          </div>,
        );
      }).toThrowError(ERR);
    });
  });

  describe('withMaxAllowedInstancesGuard()', () => {
    const TestingComponentBase = () => {
      useMaxAllowedInstancesGuard('TestingComponent', ERR);
      return <div>hello</div>;
    };

    const TestingComp = withMaxAllowedInstancesGuard(TestingComponentBase, 'TestingComp', ERR);

    it('renders normally if not used more than N times', () => {
      expect(() => {
        render(
          <div>
            <TestingComp />
          </div>,
        );
      }).not.toThrowError(ERR);
    });

    it('throws an error if component is used more than N times', () => {
      expect(() => {
        render(
          <div>
            <TestingComp />
            <TestingComp />
          </div>,
        );
      }).toThrowError(ERR);
    });
  });
});
