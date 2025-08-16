export interface ChatMessage { role: string; content: string }

export type ValidateResult = { ok: true } | { ok: false; reason: string };

export function validateMessages(messages: ChatMessage[] | undefined): ValidateResult {
  if (!messages || messages.length === 0) return { ok: false, reason: 'empty' };
  if (messages.length > 30) return { ok: false, reason: 'too-many' };
  let total = 0;
  for (const m of messages) {
    if (!m.content || !m.content.trim()) return { ok: false, reason: 'empty-item' };
    if (m.content.length > 2000) return { ok: false, reason: 'too-long' };
    total += m.content.length;
  }
  if (total > 8000) return { ok: false, reason: 'total-too-large' };
  const last = messages[messages.length - 1];
  if (/https?:\/\//i.test(last.content)) return { ok: false, reason: 'url-not-allowed' };
  return { ok: true };
}
