export interface ChatMessage { role: string; content: string }

export function validateMessages(messages: ChatMessage[] | undefined) {
  if (!messages || messages.length === 0) return { ok: false, reason: 'empty' };
  const last = messages[messages.length - 1];
  if (!last.content || !last.content.trim()) return { ok: false, reason: 'last-empty' };
  return { ok: true };
}
