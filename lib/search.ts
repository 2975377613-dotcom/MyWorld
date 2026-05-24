import { SEARCH_ENGINES } from "@/lib/config";
import type { NavigationItem } from "@/lib/types";

export function buildWebSearchUrl(query: string, preferredEngine: string) {
  const engine =
    SEARCH_ENGINES[preferredEngine as keyof typeof SEARCH_ENGINES] ??
    SEARCH_ENGINES.google;

  return engine.buildUrl(query);
}

export function findNavigationMatch(
  query: string,
  navigationItems: NavigationItem[],
) {
  const normalizedQuery = query.trim().toLowerCase();

  return navigationItems.find((item) => {
    const haystack = `${item.title} ${item.url} ${item.category}`.toLowerCase();
    return haystack.includes(normalizedQuery);
  });
}
