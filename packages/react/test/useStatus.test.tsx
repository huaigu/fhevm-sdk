import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { FhevmProvider } from '../src/FhevmContext';
import { useStatus } from '../src/useStatus';

describe('useStatus', () => {
  it('should return initial status', () => {
    const { result } = renderHook(() => useStatus(), {
      wrapper: ({ children }) => <FhevmProvider>{children}</FhevmProvider>,
    });

    expect(result.current.status).toBe('idle');
    expect(result.current.isIdle).toBe(true);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isReady).toBe(false);
    expect(result.current.isError).toBe(false);
  });
});
