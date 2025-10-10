import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { FhevmProvider, useFhevmContext } from '../src/FhevmContext';
import { MemoryStorage } from '@fhevm/core';

describe('FhevmProvider', () => {
  it('should provide context to children', () => {
    const TestComponent = () => {
      const { client, status } = useFhevmContext();
      expect(client).toBeDefined();
      expect(status).toBe('idle');
      return <div>Test</div>;
    };

    render(
      <FhevmProvider>
        <TestComponent />
      </FhevmProvider>
    );
  });

  it('should accept custom config', () => {
    const storage = new MemoryStorage();
    const TestComponent = () => {
      const { client } = useFhevmContext();
      expect(client).toBeDefined();
      return <div>Test</div>;
    };

    render(
      <FhevmProvider config={{ storage }}>
        <TestComponent />
      </FhevmProvider>
    );
  });

  it('should throw error when used outside provider', () => {
    const TestComponent = () => {
      expect(() => useFhevmContext()).toThrow(
        'useFhevmContext must be used within a FhevmProvider'
      );
      return <div>Test</div>;
    };

    render(<TestComponent />);
  });
});
