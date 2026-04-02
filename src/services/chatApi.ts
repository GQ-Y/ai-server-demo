export interface HazardSource {
  pk: string;
  code: string;
  level: string;
  sheetName: string;
  category: string;
  subcategory: string;
  fineCategory: string;
  checkContent: string;
  rectifyDays: string;
  score: number;
}

export type SSEEvent =
  | { type: 'thinking'; data: string }
  | { type: 'sources'; data: HazardSource[] }
  | { type: 'token'; data: string }
  | { type: 'done' }
  | { type: 'error'; data: string };

/**
 * 向 /api/chat 发起 SSE 流式请求，通过回调逐步返回事件
 */
export async function sendChatQuery(
  query: string,
  onEvent: (event: SSEEvent) => void,
  signal?: AbortSignal,
): Promise<void> {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
    signal,
  });

  if (!res.ok) {
    throw new Error(`请求失败: ${res.status} ${res.statusText}`);
  }

  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const raw = line.slice(6).trim();
      if (!raw) continue;
      try {
        const event = JSON.parse(raw) as SSEEvent;
        onEvent(event);
      } catch {
        // skip malformed chunks
      }
    }
  }
}
