"use client";

import Link from "next/link";

import { useAppSettings } from "@/components/providers/settings-provider";
import { SEARCH_ENGINES } from "@/lib/config";
import type { SearchMode, UISettings } from "@/lib/types";

const SEARCH_MODE_OPTIONS: Array<{
  value: SearchMode;
  label: string;
  description: string;
}> = [
  { value: "web", label: "Web", description: "默认将输入发给网页搜索引擎" },
  { value: "ai", label: "AI", description: "默认把输入交给 DeepSeek 面板" },
  { value: "direct", label: "Direct", description: "默认优先匹配本地导航直达" },
];

const MOTION_OPTIONS: Array<{
  value: UISettings["motionLevel"];
  label: string;
  description: string;
}> = [
  { value: "off", label: "关闭", description: "保留静态工业背景，不执行鼠标跟随" },
  { value: "low", label: "低", description: "保留少量粒子和轻微鼠标响应" },
  { value: "normal", label: "标准", description: "默认粒子层和玻璃动效强度" },
  { value: "high", label: "增强", description: "更明显的粒子密度与鼠标位移" },
];

export default function SettingsPage() {
  const {
    searchPreference,
    setSearchPreference,
    uiSettings,
    setUiSettings,
  } = useAppSettings();

  function updateMotionLevel(nextLevel: UISettings["motionLevel"]) {
    setUiSettings({
      ...uiSettings,
      motionLevel: nextLevel,
      themeVariant: "cold-blue-industrial",
    });
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-8 px-6 py-10 md:px-10">
      <header className="flex flex-col gap-4 border-b border-cyan-200/10 pb-6 md:flex-row md:items-end md:justify-between">
        <div className="space-y-3">
          <p className="section-label">Settings</p>
          <h1 className="text-3xl font-semibold tracking-normal text-slate-950">偏好设置</h1>
          <p className="max-w-2xl text-sm leading-7 text-slate-600">
            调整打开首页后的默认行为。修改会保存在本机浏览器中。
          </p>
        </div>
        <Link
          href="/"
          className="rounded-full border border-sky-200/70 bg-white/55 px-4 py-2 text-sm text-slate-700 transition hover:border-sky-300 hover:text-slate-950"
        >
          返回首页
        </Link>
      </header>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <article className="panel rounded-[2rem] p-6">
            <div className="space-y-2">
              <p className="section-label">Search Defaults</p>
              <h2 className="text-2xl font-semibold text-slate-950">默认搜索模式</h2>
              <p className="text-sm leading-6 text-slate-600">
                选择搜索框打开时优先执行的动作。
              </p>
            </div>

            <div className="mt-6 grid gap-3">
              {SEARCH_MODE_OPTIONS.map((option) => {
                const selected = searchPreference.defaultMode === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() =>
                      setSearchPreference({
                        ...searchPreference,
                        defaultMode: option.value,
                      })
                    }
                    className={`rounded-3xl border px-4 py-4 text-left transition ${
                      selected
                        ? "border-sky-300/45 bg-sky-100/70"
                        : "border-sky-200/70 bg-white/58 hover:border-sky-300 hover:bg-white/75"
                    }`}
                  >
                    <p className="text-sm font-medium text-slate-900">{option.label}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      {option.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </article>

          <article className="panel rounded-[2rem] p-6">
            <div className="space-y-2">
              <p className="section-label">Search Engine</p>
              <h2 className="text-2xl font-semibold text-slate-950">默认搜索引擎</h2>
              <p className="text-sm leading-6 text-slate-600">
                Web 模式下会使用这里选择的搜索引擎。
              </p>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-3">
              {Object.entries(SEARCH_ENGINES).map(([engineKey, engine]) => {
                const selected = searchPreference.preferredEngine === engineKey;

                return (
                  <button
                    key={engineKey}
                    type="button"
                    onClick={() =>
                      setSearchPreference({
                        ...searchPreference,
                        preferredEngine: engineKey,
                      })
                    }
                    className={`rounded-3xl border px-4 py-4 text-left transition ${
                      selected
                        ? "border-sky-300/45 bg-sky-100/70"
                        : "border-sky-200/70 bg-white/58 hover:border-sky-300 hover:bg-white/75"
                    }`}
                  >
                    <p className="text-sm font-medium text-slate-900">{engine.label}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.14em] text-slate-500">
                      {engineKey}
                    </p>
                  </button>
                );
              })}
            </div>
          </article>
        </div>

        <div className="space-y-6">
          <article className="panel rounded-[2rem] p-6">
            <div className="space-y-2">
              <p className="section-label">Motion</p>
              <h2 className="text-2xl font-semibold text-slate-950">动效强度</h2>
              <p className="text-sm leading-6 text-slate-600">
                调整背景粒子和鼠标响应强度。
              </p>
            </div>

            <div className="mt-6 grid gap-3">
              {MOTION_OPTIONS.map((option) => {
                const selected = uiSettings.motionLevel === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => updateMotionLevel(option.value)}
                    className={`rounded-3xl border px-4 py-4 text-left transition ${
                      selected
                        ? "border-sky-300/45 bg-sky-100/70"
                        : "border-sky-200/70 bg-white/58 hover:border-sky-300 hover:bg-white/75"
                    }`}
                  >
                    <p className="text-sm font-medium text-slate-900">{option.label}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      {option.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </article>

          <article className="panel rounded-[2rem] p-6">
            <p className="section-label">Appearance</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">界面外观</h2>
            <div className="mt-5 space-y-3 text-sm leading-7 text-slate-600">
              <p>当前主题：白色玻璃</p>
              <p>强调色：冰蓝</p>
              <p>背景：浅色粒子与细网格</p>
            </div>
            <div className="mt-6 rounded-3xl border border-sky-200/70 bg-[linear-gradient(135deg,rgba(190,231,255,0.82),rgba(255,255,255,0.74))] p-5">
              <p className="text-sm font-medium text-sky-700">
                当前主题：白色冰蓝
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                主题暂时固定，避免首页入口出现过多配置项。
              </p>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
