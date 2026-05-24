"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { useAppSettings } from "@/components/providers/settings-provider";
import { DEFAULT_SEARCH_PREFERENCE, NAVIGATION_CATEGORIES } from "@/lib/config";
import { buildWebSearchUrl, findNavigationMatch } from "@/lib/search";
import {
  pushSearchHistory,
  setAiDraft,
} from "@/lib/storage";
import type {
  AppMode,
  NavigationCategory,
  NavigationItem,
  SearchMode,
} from "@/lib/types";

const SEARCH_MODES: Array<{
  mode: SearchMode;
  label: string;
  description: string;
}> = [
  { mode: "web", label: "Web", description: "网页搜索" },
  { mode: "ai", label: "AI", description: "把输入交给 DeepSeek 面板" },
  { mode: "direct", label: "Direct", description: "命中常用站点后直接跳转" },
];

type SearchShellProps = {
  activeMode: AppMode;
  navigationItems: NavigationItem[];
  onAddNavigationItem: (item: NavigationItem) => void;
  onModeChange: (mode: AppMode) => void;
};

function normalizeUrl(rawUrl: string) {
  const trimmedUrl = rawUrl.trim();

  if (!trimmedUrl) {
    return "";
  }

  if (/^https?:\/\//i.test(trimmedUrl)) {
    return trimmedUrl;
  }

  return `https://${trimmedUrl}`;
}

function isNavigationCategory(value: string): value is NavigationCategory {
  return NAVIGATION_CATEGORIES.includes(value as NavigationCategory);
}

function buildIcon(title: string) {
  return title.trim().slice(0, 1).toUpperCase() || "N";
}

export function SearchShell({
  activeMode,
  navigationItems,
  onAddNavigationItem,
  onModeChange,
}: SearchShellProps) {
  const { searchPreference, setSearchPreference } = useAppSettings();
  const [query, setQuery] = useState("");
  const [commandFeedback, setCommandFeedback] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const mode = searchPreference.defaultMode ?? DEFAULT_SEARCH_PREFERENCE.defaultMode;
  const preferredEngine =
    searchPreference.preferredEngine ?? DEFAULT_SEARCH_PREFERENCE.preferredEngine;

  const activeSearchMode = useMemo(
    () => SEARCH_MODES.find((item) => item.mode === mode) ?? SEARCH_MODES[0],
    [mode],
  );

  function updateMode(nextMode: SearchMode) {
    setSearchPreference({
      defaultMode: nextMode,
      preferredEngine,
    });
  }

  useEffect(() => {
    if (activeMode === "search") {
      inputRef.current?.focus();
    }
  }, [activeMode]);

  const inputIntent = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (normalizedQuery.startsWith("/") || normalizedQuery.startsWith("nav ")) {
      return "Command";
    }

    if (normalizedQuery.startsWith("ai ")) {
      return "AI";
    }

    return activeMode === "search" ? "Search" : activeMode;
  }, [activeMode, query]);

  function sendToAi(value: string) {
    setAiDraft(value);
    window.dispatchEvent(
      new CustomEvent("myworld:ai-draft", { detail: value }),
    );
    onModeChange("ai");
    document.getElementById("ai-panel")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  function handleCommand(value: string) {
    const normalizedValue = value.replace(/^\/+/, "").trim();
    const parts = normalizedValue.split(/\s+/);
    const [command, action, ...rest] = parts;

    if (command === "ai") {
      const prompt = [action, ...rest].join(" ").trim();

      if (!prompt) {
        setCommandFeedback("AI 命令需要内容。");
        return true;
      }

      sendToAi(prompt);
      setCommandFeedback("已发送到 AI 面板。");
      return true;
    }

    if (command === "nav" && action === "add") {
      const [rawTitle, rawUrl, rawCategory] = rest;
      const category = rawCategory && isNavigationCategory(rawCategory)
        ? rawCategory
        : "开发";
      const url = normalizeUrl(rawUrl ?? "");

      if (!rawTitle || !url) {
        setCommandFeedback("命令格式：/nav add 名称 网址 分类");
        return true;
      }

      onAddNavigationItem({
        id: crypto.randomUUID(),
        title: rawTitle,
        url,
        category,
        icon: buildIcon(rawTitle),
        pinned: false,
      });
      onModeChange("navigation");
      setCommandFeedback("已添加到本地导航。");
      return true;
    }

    return false;
  }

  function submitSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedQuery = query.trim();

    if (!normalizedQuery) {
      return;
    }

    setCommandFeedback("");

    if (
      normalizedQuery.startsWith("/") ||
      normalizedQuery.toLowerCase().startsWith("nav ") ||
      normalizedQuery.toLowerCase().startsWith("ai ")
    ) {
      const handled = handleCommand(normalizedQuery);

      if (handled) {
        setQuery("");
        return;
      }
    }

    pushSearchHistory({
      id: crypto.randomUUID(),
      query: normalizedQuery,
      mode,
      timestamp: new Date().toISOString(),
    });

    if (mode === "ai") {
      sendToAi(normalizedQuery);
      setQuery("");
      return;
    }

    if (mode === "direct") {
      const match = findNavigationMatch(normalizedQuery, navigationItems);

      if (match) {
        window.open(match.url, "_blank", "noopener,noreferrer");
        setQuery("");
        return;
      }
    }

    window.open(
      buildWebSearchUrl(normalizedQuery, preferredEngine),
      "_blank",
      "noopener,noreferrer",
    );
    setQuery("");
  }

  return (
    <section id="search-panel" className="panel module-shell rounded-[2rem] p-6">
      <div className="module-head">
        <div className="module-head-row">
          <div>
            <p className="section-label">Search / Command Input</p>
            <h2 className="module-title">统一搜索入口</h2>
          </div>
          <span className="status-chip">{inputIntent} / {preferredEngine}</span>
        </div>
        <p className="module-copy">
          输入关键词会按当前模式执行。常用网站可用 Direct 直达，临时问题可发送到 AI。
        </p>
      </div>

      <div className="module-divider" />

      <div className="mt-6 console-strip">
        <div className="min-w-28">
          <p className="metric-label">Default Mode</p>
          <p className="mt-2 text-sm text-slate-900">{activeSearchMode.label}</p>
        </div>
        <div className="min-w-36">
          <p className="metric-label">Engine</p>
          <p className="mt-2 text-sm text-slate-900">{preferredEngine}</p>
        </div>
        <div className="min-w-44">
          <p className="metric-label">Behavior</p>
          <p className="mt-2 text-sm text-slate-600">{activeSearchMode.description}</p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        {SEARCH_MODES.map((item) => {
          const selected = item.mode === mode;

          return (
            <button
              key={item.mode}
              type="button"
              onClick={() => updateMode(item.mode)}
              className={`control-pill ${selected ? "control-pill-active" : ""}`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <form onSubmit={submitSearch} className="mt-5 flex flex-col gap-4">
        <label className="sr-only" htmlFor="search-query">
          搜索内容
        </label>
        <div className="console-input overflow-hidden p-2">
          <input
            ref={inputRef}
            id="search-query"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索关键词、网站名，或输入 /ai 问题"
            className="w-full rounded-[1.1rem] bg-transparent px-4 py-4 text-base text-slate-900 outline-none ring-0 placeholder:text-slate-400"
          />
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-slate-600">
            <span className="text-sky-700">
              {commandFeedback || activeSearchMode.description}
            </span>
          </p>
          <button type="submit" className="control-button">
            执行操作
          </button>
        </div>
      </form>
    </section>
  );
}
