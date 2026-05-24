import type { AppMode } from "@/lib/types";

type CoreModule = {
  mode: AppMode;
  label: string;
  title: string;
  description: string;
};

const CORE_MODULES: CoreModule[] = [
  {
    mode: "navigation",
    label: "常用入口",
    title: "Navigation",
    description: "打开教学、开发、AI、科研等常用网站。",
  },
  {
    mode: "search",
    label: "快速检索",
    title: "Search",
    description: "默认使用 Bing，也可以切换到 AI 或直达模式。",
  },
  {
    mode: "ai",
    label: "即时问答",
    title: "DeepSeek AI",
    description: "把临时问题交给 DeepSeek，并保留最近对话。",
  },
];

type HeroProps = {
  activeMode: AppMode;
  onModeChange: (mode: AppMode) => void;
};

export function Hero({ activeMode, onModeChange }: HeroProps) {
  return (
    <section className="panel module-shell rounded-[2rem] px-6 py-8 md:px-8 md:py-10">
      <div className="module-head">
        <div className="module-head-row">
          <div>
            <p className="section-label">MyWorld / Start Here</p>
            <h2 className="mt-4 max-w-4xl text-4xl font-semibold tracking-normal text-slate-950 md:text-5xl">
              今天从哪里开始？
            </h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <span className="status-chip">Bing Search</span>
            <span className="status-chip">DeepSeek Ready</span>
          </div>
        </div>

        <p className="module-copy max-w-3xl">
          选择一个入口进入常用网站，或者直接在下方搜索、提问、跳转。这里只放每天会用到的动作。
        </p>
      </div>

      <div className="module-divider" />

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="grid gap-4 sm:grid-cols-3">
          {CORE_MODULES.map((module) => {
            const selected = module.mode === activeMode;

            return (
              <button
                key={module.mode}
                type="button"
                onClick={() => onModeChange(module.mode)}
                className={`metric-card text-left ${
                  selected ? "metric-card-active" : ""
                }`}
              >
                <p className="metric-label">{module.label}</p>
                <p className="metric-title">{module.title}</p>
                <p className="metric-copy">{module.description}</p>
              </button>
            );
          })}
        </div>

        <div className="rounded-[1.7rem] border border-sky-200/60 bg-white/88 p-5">
          <p className="section-label">Current Setup</p>
          <div className="mt-4 space-y-3 text-sm leading-7 text-slate-600">
            <p>默认搜索引擎：Bing</p>
            <p>导航分类：教学、开发、AI、工作流、科研</p>
            <p>AI 面板：DeepSeek，可继续追问和复制回复</p>
          </div>
        </div>
      </div>
    </section>
  );
}
