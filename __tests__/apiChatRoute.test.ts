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
  test('rejects url containing message', () => {
    const r = validateMessages([{ role: 'user', content: 'http://evil.com' }]);
    expect(r.ok).toBe(false);
  });
  test('rejects too many messages', () => {
    const arr = Array.from({ length: 31 }, (_, i) => ({ role: 'user', content: 'a'+i }));
    const r = validateMessages(arr as any);
    expect(r.ok).toBe(false);
  });
});
