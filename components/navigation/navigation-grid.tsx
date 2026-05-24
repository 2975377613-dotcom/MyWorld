"use client";

import { useMemo, useState } from "react";

import { NAVIGATION_CATEGORIES } from "@/lib/config";
import type {
  AppMode,
  NavigationCategory,
  NavigationItem,
} from "@/lib/types";

type NavigationGridProps = {
  activeMode: AppMode;
  items: NavigationItem[];
  onItemsChange: (items: NavigationItem[]) => void;
};

function buildIcon(title: string) {
  return title.trim().slice(0, 1).toUpperCase() || "•";
}

export function NavigationGrid({
  activeMode,
  items,
  onItemsChange,
}: NavigationGridProps) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [category, setCategory] = useState<NavigationCategory>("开发");

  const groupedItems = useMemo(() => {
    return NAVIGATION_CATEGORIES.map((currentCategory) => ({
      category: currentCategory,
      items: items
        .filter((item) => item.category === currentCategory)
        .sort((left, right) => {
          if (left.pinned !== right.pinned) {
            return left.pinned ? -1 : 1;
          }

          return left.title.localeCompare(right.title);
        }),
    }));
  }, [items]);

  function resetForm() {
    setTitle("");
    setUrl("");
    setCategory("开发");
  }

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

  function handleAddItem(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedTitle = title.trim();
    const normalizedUrl = normalizeUrl(url);

    if (!normalizedTitle || !normalizedUrl) {
      return;
    }

    const nextItem: NavigationItem = {
      id: crypto.randomUUID(),
      title: normalizedTitle,
      url: normalizedUrl,
      category,
      icon: buildIcon(normalizedTitle),
      pinned: false,
    };

    onItemsChange([...items, nextItem]);
    resetForm();
  }

  function handleTogglePinned(itemId: string) {
    onItemsChange(
      items.map((item) =>
        item.id === itemId ? { ...item, pinned: !item.pinned } : item,
      ),
    );
  }

  function handleDeleteItem(itemId: string) {
    onItemsChange(items.filter((item) => item.id !== itemId));
  }

  return (
    <section id="navigation-panel" className="panel module-shell rounded-[2rem] p-6">
      <div className="module-head">
        <div className="module-head-row">
          <div>
            <p className="section-label">Navigation / Local Registry</p>
            <h2 className="module-title">常用网站入口</h2>
          </div>
          <span className="status-chip">
            {activeMode === "navigation" ? "当前模块" : "站点"} / {items.length}
          </span>
        </div>
        <p className="module-copy">
          把每天会打开的网站放在这里。新增内容会保存在本机，并可被 Direct 模式匹配。
        </p>
      </div>

      <div className="module-divider" />

      <form
        onSubmit={handleAddItem}
        className="mt-6 grid gap-4 rounded-[1.7rem] border border-sky-200/60 bg-white/92 p-5 lg:grid-cols-[1.1fr_1.5fr_0.8fr_auto]"
      >
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="网站名称"
          className="console-input px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
        />
        <input
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="网址，如 github.com"
          className="console-input px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
        />
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value as NavigationCategory)}
          className="console-input px-4 py-3 text-sm text-slate-900 outline-none"
        >
          {NAVIGATION_CATEGORIES.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="control-button rounded-2xl"
        >
          添加
        </button>
      </form>

      <div className="mt-6 space-y-6">
        {groupedItems.map((group) => (
          <section key={group.category} className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="section-label">[{group.category}]</h3>
              <span className="text-xs uppercase tracking-[0.14em] text-slate-500">
                {group.items.length} entries
              </span>
            </div>

            {group.items.length === 0 ? (
              <div className="rounded-[1.4rem] border border-dashed border-sky-200/60 bg-white/72 px-4 py-5 text-sm text-slate-500">
                当前分类还没有网站，你可以直接添加。
              </div>
            ) : (
              <div className="space-y-3">
                {group.items.map((item, index) => (
                  <article
                    key={item.id}
                    className={`group relative grid gap-3 overflow-hidden rounded-xl border bg-white/94 p-4 transition hover:border-sky-300 hover:bg-white md:grid-cols-[3rem_1fr_auto] md:items-center ${
                      item.pinned
                        ? "border-sky-300/70 shadow-[inset_4px_0_0_rgba(75,167,238,0.58)]"
                        : "border-sky-200/60"
                    }`}
                  >
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-sky-400/75 via-sky-300/15 to-transparent opacity-80" />
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-sky-200/80 bg-sky-50 font-mono text-sm font-semibold text-sky-700">
                      {index + 1}
                    </div>
                    <div className="flex min-w-0 items-start justify-between gap-3 md:items-center">
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex min-w-0 flex-1 items-center gap-3"
                      >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-sky-200/80 bg-white text-sm font-semibold text-sky-700">
                          {item.icon}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-base font-medium text-slate-900">
                            {item.title}
                          </p>
                          <p className="mt-1 text-sm text-slate-500">{item.category}</p>
                        </div>
                      </a>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 md:justify-end">
                      <p className="max-w-56 truncate text-sm text-slate-500">{item.url}</p>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-slate-700 transition group-hover:text-slate-950"
                      >
                        打开站点
                      </a>
                      <button
                        type="button"
                        onClick={() => handleTogglePinned(item.id)}
                        className="text-sm text-slate-500 transition hover:text-sky-700"
                      >
                        {item.pinned ? "取消置顶" : "置顶"}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteItem(item.id)}
                        className="text-sm text-slate-500 transition hover:text-rose-500"
                      >
                        删除
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        ))}
      </div>
    </section>
  );
}
