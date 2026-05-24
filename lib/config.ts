import type {
  NavigationCategory,
  NavigationItem,
  SearchPreference,
  UISettings,
} from "@/lib/types";

export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? "MyWorld";

export const NAVIGATION_CATEGORIES: NavigationCategory[] = [
  "教学",
  "开发",
  "AI",
  "工作流",
  "科研",
];

function deriveIcon(title: string, category: NavigationCategory) {
  const iconByCategory: Record<NavigationCategory, string> = {
    教学: "ED",
    开发: "DV",
    AI: "AI",
    工作流: "WK",
    科研: "RS",
  };

  const trimmedTitle = title.trim();
  const firstCharacter = trimmedTitle.slice(0, 1).toUpperCase();

  if (firstCharacter) {
    return firstCharacter;
  }

  return iconByCategory[category];
}

export const DEFAULT_NAVIGATION_ITEMS: NavigationItem[] = [
  {
    id: "github",
    title: "GitHub",
    url: "https://github.com",
    category: "开发",
    icon: deriveIcon("GitHub", "开发"),
    pinned: true,
  },
  {
    id: "notion",
    title: "Notion",
    url: "https://www.notion.so",
    category: "工作流",
    icon: deriveIcon("Notion", "工作流"),
    pinned: true,
  },
  {
    id: "deepseek",
    title: "DeepSeek",
    url: "https://chat.deepseek.com",
    category: "AI",
    icon: deriveIcon("DeepSeek", "AI"),
    pinned: false,
  },
  {
    id: "chatgpt",
    title: "ChatGPT",
    url: "https://chatgpt.com",
    category: "AI",
    icon: deriveIcon("ChatGPT", "AI"),
    pinned: false,
  },
  {
    id: "tongji-portal",
    title: "1系统",
    url: "https://1.tongji.edu.cn",
    category: "教学",
    icon: deriveIcon("1系统", "教学"),
    pinned: false,
  },
  {
    id: "google-scholar",
    title: "Google Scholar",
    url: "https://scholar.google.com/",
    category: "科研",
    icon: deriveIcon("Google Scholar", "科研"),
    pinned: false,
  },
];

export const DEFAULT_SEARCH_PREFERENCE: SearchPreference = {
  defaultMode: "web",
  preferredEngine: "bing",
};

export const DEFAULT_UI_SETTINGS: UISettings = {
  themeVariant: "cold-blue-industrial",
  motionLevel: "normal",
  layoutDensity: "comfortable",
};

export const SEARCH_ENGINES = {
  google: {
    label: "Google",
    buildUrl: (query: string) =>
      `https://www.google.com/search?q=${encodeURIComponent(query)}`,
  },
  bing: {
    label: "Bing",
    buildUrl: (query: string) =>
      `https://www.bing.com/search?q=${encodeURIComponent(query)}`,
  },
  baidu: {
    label: "Baidu",
    buildUrl: (query: string) =>
      `https://www.baidu.com/s?wd=${encodeURIComponent(query)}`,
  },
} as const;
