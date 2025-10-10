import { describe, it, expect } from 'vitest';
import { createApp } from 'vue';
import { createFhevm } from '../src/plugin';
import { useStatus } from '../src/useStatus';

describe('useStatus', () => {
  it('should return initial status', () => {
    let statusValue: any;

    const app = createApp({
      setup() {
        const { status, isIdle } = useStatus();
        statusValue = { status: status.value, isIdle: isIdle.value };
        return {};
      },
      template: '<div>Test</div>',
    });

    const plugin = createFhevm();
    app.use(plugin);
    app.mount(document.createElement('div'));

    expect(statusValue.status).toBe('idle');
    expect(statusValue.isIdle).toBe(true);
  });
});
