import { validateMessages } from '@/lib/validateMessages';

describe('validateMessages', () => {
  test('returns error when messages empty', () => {
    const r = validateMessages([] as any);
    expect(r.ok).toBe(false);
  });
  test('returns ok when has user message', () => {
    const r = validateMessages([{ role: 'user', content: 'hi' }]);
    expect(r.ok).toBe(true);
  });
});
