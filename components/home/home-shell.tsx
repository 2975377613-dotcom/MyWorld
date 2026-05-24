"use client";

import { useState } from "react";

import { AiPanel } from "@/components/ai/ai-panel";
import { Hero } from "@/components/home/hero";
import { NavigationGrid } from "@/components/navigation/navigation-grid";
import { SearchShell } from "@/components/search/search-shell";
import { DEFAULT_NAVIGATION_ITEMS } from "@/lib/config";
import { getNavigationItems, saveNavigationItems } from "@/lib/storage";
import type { AppMode, NavigationItem } from "@/lib/types";

export function HomeShell() {
  const [activeMode, setActiveMode] = useState<AppMode>("navigation");
  const [navigationItems, setNavigationItems] = useState<NavigationItem[]>(() => {
    if (typeof window === "undefined") {
      return DEFAULT_NAVIGATION_ITEMS;
    }

    return getNavigationItems();
  });

  function updateNavigationItems(items: NavigationItem[]) {
    setNavigationItems(items);
    saveNavigationItems(items);
  }

  function addNavigationItem(item: NavigationItem) {
    updateNavigationItems([...navigationItems, item]);
  }

  function switchMode(nextMode: AppMode) {
    setActiveMode(nextMode);

    const targetId =
      nextMode === "search"
        ? "search-panel"
        : nextMode === "ai"
          ? "ai-panel"
          : "navigation-panel";

    window.requestAnimationFrame(() => {
      document.getElementById(targetId)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }

  return (
    <main className="relative overflow-hidden">
      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-8 px-6 py-8 md:px-10 lg:px-12">
        <header className="flex items-center justify-between border-b border-cyan-200/10 pb-4">
          <div>
            <p className="section-label">MyWorld</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-normal">个人数字入口</h1>
          </div>
          <a
            href="/settings"
            className="rounded-full border border-sky-200/70 bg-white/55 px-4 py-2 text-sm text-slate-700 transition hover:border-sky-300 hover:text-slate-950"
          >
            打开设置
          </a>
        </header>

        <Hero activeMode={activeMode} onModeChange={switchMode} />

        <section className="grid gap-6 xl:grid-cols-[1.35fr_0.95fr]">
          <div className="space-y-6">
            <SearchShell
              activeMode={activeMode}
              navigationItems={navigationItems}
              onAddNavigationItem={addNavigationItem}
              onModeChange={setActiveMode}
            />
            <NavigationGrid
              activeMode={activeMode}
              items={navigationItems}
              onItemsChange={updateNavigationItems}
            />
          </div>
          <AiPanel />
        </section>
      </div>
    </main>
  );
}
