"use client";

import { useEffect, useRef, useState } from "react";

import {
  clearAiDraft,
  clearChatSession,
  getAiDraft,
  getChatSession,
  saveChatSession,
} from "@/lib/storage";
import type { ChatMessage, ChatSession } from "@/lib/types";

function buildMessage(role: ChatMessage["role"], content: string): ChatMessage {
  return {
    id: crypto.randomUUID(),
    role,
    content,
    timestamp: new Date().toISOString(),
  };
}

export function AiPanel() {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (typeof window === "undefined") {
      return [];
    }

    return getChatSession()?.messages ?? [];
  });
  const [input, setInput] = useState(() => {
    if (typeof window === "undefined") {
      return "";
    }

    return getAiDraft();
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [errorDetails, setErrorDetails] = useState("");
  const [copyFeedback, setCopyFeedback] = useState("");
  const [lastModel, setLastModel] = useState("");
  const messageListRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleDraft = (event: Event) => {
      const customEvent = event as CustomEvent<string>;
      setInput(customEvent.detail);
    };

    window.addEventListener("myworld:ai-draft", handleDraft);

    return () => {
      window.removeEventListener("myworld:ai-draft", handleDraft);
    };
  }, []);

  useEffect(() => {
    const list = messageListRef.current;

    if (!list) {
      return;
    }

    list.scrollTop = list.scrollHeight;
  }, [messages, isLoading]);

  useEffect(() => {
    if (!copyFeedback) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setCopyFeedback("");
    }, 1800);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [copyFeedback]);

  async function copyText(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopyFeedback("已复制到剪贴板");
    } catch {
      setCopyFeedback("复制失败，请检查浏览器权限");
    }
  }

  function handleClearSession() {
    setMessages([]);
    setError("");
    setErrorDetails("");
    setLastModel("");
    clearChatSession();
  }

  async function submitMessage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedInput = input.trim();

    if (!trimmedInput || isLoading) {
      return;
    }

    setError("");
    setErrorDetails("");
    clearAiDraft();

    const userMessage = buildMessage("user", trimmedInput);
    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: nextMessages.map((message) => ({
            role: message.role,
            content: message.content,
          })),
        }),
      });

      const data = (await response.json()) as {
        code?: string;
        details?: string;
        error?: string;
        message?: string;
        model?: string;
      };

      if (!response.ok || !data.message) {
        setErrorDetails(data.details ?? "");
        throw new Error(data.error ?? "AI request failed.");
      }

      const assistantMessage = buildMessage("assistant", data.message);
      const persistedMessages = [...nextMessages, assistantMessage];
      const session: ChatSession = {
        id: "default-session",
        messages: persistedMessages,
        updatedAt: new Date().toISOString(),
      };

      setMessages(persistedMessages);
      saveChatSession(session);
      setLastModel(data.model ?? "");
    } catch (caughtError) {
      const message =
        caughtError instanceof Error ? caughtError.message : "AI request failed.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section id="ai-panel" className="panel rounded-[2rem] p-6">
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="section-label">AI Panel</p>
            <h2 className="text-2xl font-semibold text-slate-950">DeepSeek 问答入口</h2>
            <p className="text-sm leading-6 text-slate-600">
              临时问题、整理想法和继续追问都放在这里。最近会话会保存在本机浏览器中。
            </p>
          </div>
          <button
            type="button"
            onClick={handleClearSession}
            className="rounded-full border border-sky-200/70 bg-white/55 px-4 py-2 text-sm text-slate-700 transition hover:border-rose-300/40 hover:text-slate-950"
          >
            清空会话
          </button>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
          <span className="rounded-full border border-sky-300/30 bg-sky-100 px-3 py-1 text-sky-700">
            Provider: DeepSeek
          </span>
          {lastModel ? (
            <span className="rounded-full border border-sky-200/70 bg-white/55 px-3 py-1 text-slate-700">
              Model: {lastModel}
            </span>
          ) : null}
          {copyFeedback ? (
            <span className="rounded-full border border-emerald-300/30 bg-emerald-50 px-3 py-1 text-emerald-700">
              {copyFeedback}
            </span>
          ) : null}
        </div>

        <div
          ref={messageListRef}
          className="max-h-[420px] min-h-[260px] space-y-3 overflow-y-auto rounded-3xl border border-sky-200/60 bg-white/94 p-4"
        >
          {messages.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-sky-200/60 bg-white/72 p-4 text-sm leading-6 text-slate-500">
              还没有对话。直接输入问题，或从搜索框切到 AI 模式后发送。
            </div>
          ) : (
            messages.map((message) => (
              <article
                key={message.id}
                className={`rounded-2xl px-4 py-3 text-sm leading-7 ${
                  message.role === "user"
                    ? "ml-auto max-w-[88%] border border-sky-200/70 bg-sky-50 text-sky-900"
                    : "mr-auto max-w-[92%] border border-sky-200/60 bg-white text-slate-700"
                }`}
              >
                <div className="mb-2 flex items-center justify-between gap-3">
                  <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-slate-400">
                    {message.role}
                  </p>
                  {message.role === "assistant" ? (
                    <button
                      type="button"
                      onClick={() => copyText(message.content)}
                      className="text-[11px] uppercase tracking-[0.16em] text-slate-400 transition hover:text-sky-500"
                    >
                      复制回复
                    </button>
                  ) : null}
                </div>
                <p className="whitespace-pre-wrap">{message.content}</p>
              </article>
            ))
          )}

          {isLoading ? (
            <div className="rounded-2xl border border-sky-200/70 bg-white/70 px-4 py-3 text-sm text-slate-600">
              DeepSeek 正在返回内容...
            </div>
          ) : null}
        </div>

        {error ? (
          <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
            <p>{error}</p>
            {errorDetails ? (
              <p className="mt-2 text-xs leading-6 text-rose-100/80">{errorDetails}</p>
            ) : null}
          </div>
        ) : null}

        <form onSubmit={submitMessage} className="space-y-3">
          <label className="sr-only" htmlFor="ai-input">
            AI 输入框
          </label>
          <textarea
            id="ai-input"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="向 DeepSeek 提一个问题"
            className="min-h-32 w-full rounded-3xl border border-sky-200/70 bg-white/70 px-5 py-4 text-sm leading-7 text-slate-900 outline-none placeholder:text-slate-400 focus:border-sky-300"
          />
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs leading-6 text-slate-500">
              最近会话仅保存在当前浏览器。
            </p>
            <button
              type="submit"
              disabled={isLoading}
              className="rounded-full bg-sky-500 px-5 py-3 text-sm font-medium text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              发送到 DeepSeek
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
