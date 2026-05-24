export type AppMode = "navigation" | "search" | "ai";

export type SearchMode = "web" | "ai" | "direct";

export type NavigationCategory =
  | "教学"
  | "开发"
  | "AI"
  | "工作流"
  | "科研";

export type NavigationItem = {
  id: string;
  title: string;
  url: string;
  category: NavigationCategory;
  icon: string;
  pinned: boolean;
};

export type SearchPreference = {
  defaultMode: SearchMode;
  preferredEngine: string;
};

export type SearchHistoryItem = {
  id: string;
  query: string;
  mode: SearchMode;
  timestamp: string;
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
};

export type ChatSession = {
  id: string;
  messages: ChatMessage[];
  updatedAt: string;
};

export type UISettings = {
  themeVariant: string;
  motionLevel: "off" | "low" | "normal" | "high";
  layoutDensity: "compact" | "comfortable";
};
