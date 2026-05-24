import {
  DEFAULT_NAVIGATION_ITEMS,
  DEFAULT_SEARCH_PREFERENCE,
  DEFAULT_UI_SETTINGS,
} from "@/lib/config";
import type {
  ChatSession,
  NavigationItem,
  SearchHistoryItem,
  SearchPreference,
  UISettings,
} from "@/lib/types";

const STORAGE_KEYS = {
  aiDraft: "myworld.ai-draft",
  chatSession: "myworld.chat-session",
  navigationItems: "myworld.navigation-items",
  searchHistory: "myworld.search-history",
  searchPreference: "myworld.search-preference",
  uiSettings: "myworld.ui-settings",
} as const;

function canUseStorage() {
  return typeof window !== "undefined";
}

function readJson<T>(key: string, fallback: T): T {
  if (!canUseStorage()) {
    return fallback;
  }

  try {
    const rawValue = window.localStorage.getItem(key);
    return rawValue ? (JSON.parse(rawValue) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}

export function getSearchPreference() {
  return readJson<SearchPreference>(
    STORAGE_KEYS.searchPreference,
    DEFAULT_SEARCH_PREFERENCE,
  );
}

export function saveSearchPreference(preference: SearchPreference) {
  writeJson(STORAGE_KEYS.searchPreference, preference);
}

export function getNavigationItems() {
  return readJson<NavigationItem[]>(
    STORAGE_KEYS.navigationItems,
    DEFAULT_NAVIGATION_ITEMS,
  );
}

export function saveNavigationItems(items: NavigationItem[]) {
  writeJson(STORAGE_KEYS.navigationItems, items);
}

export function getSearchHistory() {
  return readJson<SearchHistoryItem[]>(STORAGE_KEYS.searchHistory, []);
}

export function pushSearchHistory(item: SearchHistoryItem) {
  const history = getSearchHistory();
  writeJson(STORAGE_KEYS.searchHistory, [item, ...history].slice(0, 12));
}

export function getUiSettings() {
  return readJson<UISettings>(STORAGE_KEYS.uiSettings, DEFAULT_UI_SETTINGS);
}

export function saveUiSettings(settings: UISettings) {
  writeJson(STORAGE_KEYS.uiSettings, settings);
}

export function getChatSession() {
  return readJson<ChatSession | null>(STORAGE_KEYS.chatSession, null);
}

export function saveChatSession(session: ChatSession) {
  writeJson(STORAGE_KEYS.chatSession, session);
}

export function clearChatSession() {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEYS.chatSession);
}

export function getAiDraft() {
  if (!canUseStorage()) {
    return "";
  }

  return window.localStorage.getItem(STORAGE_KEYS.aiDraft) ?? "";
}

export function setAiDraft(value: string) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEYS.aiDraft, value);
}

export function clearAiDraft() {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEYS.aiDraft);
}
