import React, { useCallback, useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  BotMessageSquare,
  Send,
  User,
  Building2,
  Calendar,
  ChevronRight,
  Loader2,
  Search,
  BookOpen,
  RotateCcw,
} from 'lucide-react';
import { sendChatQuery } from '../services/chatApi';
import type { HazardSource } from '../services/chatApi';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: HazardSource[];
  isStreaming?: boolean;
  thinkingStatus?: string;
}

interface AIChatViewProps {
  initialQuery?: string;
  onSelectHazard?: (hazardId: string) => void;
}

function levelColor(level: string) {
  const t = level.replace(/\s/g, '');
  if (/[ⅠI1一]/.test(t) && t.length <= 4) return 'text-error bg-error-container/40 border-error/30';
  if (/[ⅡI2二]/.test(t) && t.length <= 4) return 'text-amber-700 bg-amber-50 border-amber-300/50';
  if (/[ⅢI3三]/.test(t) && t.length <= 4) return 'text-blue-700 bg-blue-50 border-blue-300/50';
  return 'text-on-surface-variant bg-surface-container border-outline-variant/30';
}

function scoreBar(score: number) {
  const pct = Math.round(score * 100);
  let color = 'bg-emerald-500';
  if (pct < 70) color = 'bg-amber-400';
  if (pct < 50) color = 'bg-outline';
  return { pct, color };
}

// 将隐患 pk（"sheetName::code::seq"）转换为 DetailView 兼容的 id
function pkToHazardId(source: HazardSource): string {
  return source.pk;
}

function SourceCard({
  source,
  onSelectHazard,
}: {
  source: HazardSource;
  onSelectHazard?: (id: string) => void;
}) {
  const bar = scoreBar(source.score);
  const path = [source.category, source.subcategory, source.fineCategory].filter(Boolean).join(' → ');
  return (
    <div className="rounded-xl border border-outline-variant/20 bg-surface-container-lowest p-4 space-y-3 ambient-shadow">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-mono font-bold text-primary-container">
            {source.code || '—'}
          </span>
          <span
            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${levelColor(source.level)}`}
          >
            {source.level || '—'}
          </span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <div className="w-14 h-1.5 rounded-full bg-surface-container overflow-hidden">
            <div className={`h-full rounded-full ${bar.color}`} style={{ width: `${bar.pct}%` }} />
          </div>
          <span className="text-[10px] text-on-surface-variant font-mono tabular-nums">{bar.pct}%</span>
        </div>
      </div>

      {path && (
        <div className="flex items-start gap-1.5 text-[11px] text-on-surface-variant">
          <Building2 className="w-3.5 h-3.5 shrink-0 mt-0.5 text-primary" />
          <span className="break-words">{path}</span>
        </div>
      )}

      <p className="text-sm text-on-surface leading-relaxed line-clamp-3">{source.checkContent || '（无排查内容）'}</p>

      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-1 text-[10px] text-outline">
          <Calendar className="w-3 h-3" />
          {source.rectifyDays ? `整改 ${source.rectifyDays} 天` : '整改期限未填'}
          <span className="mx-1">·</span>
          <Building2 className="w-3 h-3" />
          {source.sheetName}
        </div>
        {onSelectHazard && (
          <button
            type="button"
            onClick={() => onSelectHazard(pkToHazardId(source))}
            className="flex items-center gap-0.5 text-[11px] text-primary font-semibold hover:underline"
          >
            查看详情 <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

function MessageBubble({
  message,
  onSelectHazard,
}: {
  message: Message;
  onSelectHazard?: (id: string) => void;
}) {
  const isUser = message.role === 'user';
  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div
        className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser ? 'bg-primary text-white' : 'bg-primary/10 text-primary border border-primary/20'
        }`}
      >
        {isUser ? <User className="w-4 h-4" /> : <BotMessageSquare className="w-4 h-4" />}
      </div>

      <div className={`max-w-[80%] space-y-3 ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
        {/* AI 来源卡片 */}
        {!isUser && message.sources && message.sources.length > 0 && (
          <div className="w-full space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-on-surface-variant">
              <BookOpen className="w-3.5 h-3.5 text-primary" />
              检索到 {message.sources.length} 条相关隐患记录
            </div>
            {message.sources.map((src) => (
              <SourceCard key={src.pk} source={src} onSelectHazard={onSelectHazard} />
            ))}
          </div>
        )}

        {/* 文字气泡 */}
        {(message.content || message.isStreaming) && (
          <div
            className={`rounded-2xl px-4 py-3 text-sm ${
              isUser
                ? 'bg-primary text-white rounded-tr-none leading-relaxed whitespace-pre-wrap'
                : 'bg-surface-container-lowest border border-outline-variant/20 text-on-surface rounded-tl-none ambient-shadow'
            }`}
          >
            {isUser ? (
              <>
                {message.content}
                {message.isStreaming && (
                  <span className="inline-block w-1.5 h-4 bg-white/70 ml-0.5 animate-pulse rounded-sm align-text-bottom" />
                )}
              </>
            ) : message.content ? (
              <>
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    p: ({ children }) => (
                      <p className="leading-relaxed mb-2 last:mb-0">{children}</p>
                    ),
                    h1: ({ children }) => (
                      <h1 className="text-base font-bold mt-3 mb-1.5 first:mt-0">{children}</h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="text-sm font-bold mt-3 mb-1.5 first:mt-0">{children}</h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-sm font-semibold mt-2.5 mb-1 first:mt-0">{children}</h3>
                    ),
                    ul: ({ children }) => (
                      <ul className="list-disc list-inside space-y-0.5 mb-2 pl-1">{children}</ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="list-decimal list-inside space-y-0.5 mb-2 pl-1">{children}</ol>
                    ),
                    li: ({ children }) => (
                      <li className="leading-relaxed text-sm">{children}</li>
                    ),
                    strong: ({ children }) => (
                      <strong className="font-semibold text-on-surface">{children}</strong>
                    ),
                    code: ({ children, className }) => {
                      const isBlock = className?.includes('language-');
                      return isBlock ? (
                        <code className="block bg-surface-container rounded-lg px-3 py-2 text-xs font-mono my-2 overflow-x-auto">
                          {children}
                        </code>
                      ) : (
                        <code className="bg-surface-container rounded px-1 py-0.5 text-xs font-mono text-primary">
                          {children}
                        </code>
                      );
                    },
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-2 border-primary/40 pl-3 text-on-surface-variant my-1.5 italic">
                        {children}
                      </blockquote>
                    ),
                    hr: () => <hr className="border-outline-variant/30 my-2" />,
                  }}
                >
                  {message.content}
                </ReactMarkdown>
                {message.isStreaming && (
                  <span className="inline-block w-1.5 h-4 bg-primary ml-0.5 animate-pulse rounded-sm align-text-bottom" />
                )}
              </>
            ) : (
              /* 来源已到、等待模型首个 Token */
              <div className="flex items-center gap-2 text-on-surface-variant py-0.5">
                <span className="flex gap-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:0ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:150ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:300ms]" />
                </span>
                <span className="text-xs">AI 正在组织回答…</span>
              </div>
            )}
          </div>
        )}

        {!isUser && !message.content && !message.sources && message.isStreaming && (
          <div className="flex items-center gap-2 text-sm text-on-surface-variant px-1">
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
            {message.thinkingStatus || '正在处理…'}
          </div>
        )}
      </div>
    </div>
  );
}

const WELCOME_MSG: Message = {
  id: 'welcome',
  role: 'assistant',
  content:
    '你好！我是 AI 隐患知识助手。\n\n你可以向我提问，例如：\n• 高处作业有哪些常见隐患？\n• 消防安全的整改要求是什么？\n• 基坑工程需要注意什么？\n\n我会从知识库中检索相关记录，并给出专业解读。',
};

export function AIChatView({ initialQuery = '', onSelectHazard }: AIChatViewProps) {
  const [messages, setMessages] = useState<Message[]>([WELCOME_MSG]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // 初始问题自动发送
  useEffect(() => {
    if (initialQuery && initialQuery.trim()) {
      handleSend(initialQuery.trim());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSend = useCallback(
    async (queryOverride?: string) => {
      const query = (queryOverride ?? input).trim();
      if (!query || isLoading) return;

      setInput('');
      setIsLoading(true);

      const userMsg: Message = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: query,
      };

      const assistantId = `assistant-${Date.now()}`;
      const assistantMsg: Message = {
        id: assistantId,
        role: 'assistant',
        content: '',
        isStreaming: true,
      };

      setMessages((prev) => [...prev, userMsg, assistantMsg]);

      abortRef.current?.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;

      try {
        await sendChatQuery(
          query,
          (event) => {
            if (event.type === 'thinking') {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId ? { ...m, thinkingStatus: event.data } : m,
                ),
              );
            } else if (event.type === 'sources') {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId ? { ...m, sources: event.data, thinkingStatus: undefined } : m,
                ),
              );
            } else if (event.type === 'token') {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? { ...m, content: m.content + event.data }
                    : m,
                ),
              );
            } else if (event.type === 'done') {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId ? { ...m, isStreaming: false } : m,
                ),
              );
              setIsLoading(false);
            } else if (event.type === 'error') {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? { ...m, content: `查询出错：${event.data}`, isStreaming: false }
                    : m,
                ),
              );
              setIsLoading(false);
            }
          },
          ctrl.signal,
        );
      } catch (err) {
        if ((err as Error)?.name === 'AbortError') return;
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? {
                  ...m,
                  content: `网络错误：${(err as Error).message}`,
                  isStreaming: false,
                }
              : m,
          ),
        );
        setIsLoading(false);
      }
    },
    [input, isLoading],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  const handleReset = useCallback(() => {
    abortRef.current?.abort();
    setMessages([WELCOME_MSG]);
    setInput('');
    setIsLoading(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
      {/* 顶栏 */}
      <div className="shrink-0 h-12 flex items-center justify-between px-6 bg-surface-container-lowest/80 backdrop-blur-sm border-b border-outline-variant/20">
        <div className="flex items-center gap-2 text-sm font-semibold text-on-surface">
          <BotMessageSquare className="w-4 h-4 text-primary" />
          AI 隐患知识助手
          <span className="text-[10px] font-normal px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 ml-1">
            RAG 语义检索
          </span>
        </div>
        <button
          type="button"
          onClick={handleReset}
          title="新建对话"
          className="flex items-center gap-1 text-xs text-on-surface-variant hover:text-primary transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          新建对话
        </button>
      </div>

      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-6 space-y-6">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} onSelectHazard={onSelectHazard} />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* 输入区 */}
      <div className="shrink-0 border-t border-outline-variant/20 bg-surface-container-lowest/80 backdrop-blur-sm px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-end gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3.5 w-4 h-4 text-outline pointer-events-none" />
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              rows={1}
              placeholder="输入问题，例如：高处作业有哪些隐患？（Enter 发送，Shift+Enter 换行）"
              className="w-full pl-9 pr-4 py-3 bg-surface-container-lowest border border-outline-variant/30 rounded-xl text-sm resize-none focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all disabled:opacity-60 max-h-36 overflow-y-auto"
              style={{ minHeight: '48px' }}
              onInput={(e) => {
                const el = e.currentTarget;
                el.style.height = 'auto';
                el.style.height = `${Math.min(el.scrollHeight, 144)}px`;
              }}
            />
          </div>
          <button
            type="button"
            onClick={() => handleSend()}
            disabled={isLoading || !input.trim()}
            className="shrink-0 w-11 h-11 rounded-xl bg-primary text-white flex items-center justify-center hover:bg-primary-container transition-colors shadow-md active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
        <p className="text-center text-[10px] text-on-surface-variant mt-2 opacity-60">
          AI 回答基于隐患知识库语义检索，仅供参考，重要决策请以实际规范为准
        </p>
      </div>
    </div>
  );
}
