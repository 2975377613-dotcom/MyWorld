"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  DEFAULT_SEARCH_PREFERENCE,
  DEFAULT_UI_SETTINGS,
} from "@/lib/config";
import {
  getSearchPreference,
  getUiSettings,
  saveSearchPreference,
  saveUiSettings,
} from "@/lib/storage";
import type { SearchPreference, UISettings } from "@/lib/types";

type SettingsContextValue = {
  searchPreference: SearchPreference;
  setSearchPreference: (preference: SearchPreference) => void;
  uiSettings: UISettings;
  setUiSettings: (settings: UISettings) => void;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

function normalizeSearchPreference(preference: SearchPreference): SearchPreference {
  if (preference.preferredEngine === "google") {
    return {
      ...preference,
      preferredEngine: "bing",
    };
  }

  return preference;
}

function getMotionFactor(level: UISettings["motionLevel"]) {
  switch (level) {
    case "off":
      return "0";
    case "low":
      return "0.4";
    case "high":
      return "1.15";
    default:
      return "0.75";
  }
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [searchPreference, setSearchPreferenceState] = useState<SearchPreference>(() => {
    if (typeof window === "undefined") {
      return DEFAULT_SEARCH_PREFERENCE;
    }

    return normalizeSearchPreference(getSearchPreference());
  });
  const [uiSettings, setUiSettingsState] = useState<UISettings>(() => {
    if (typeof window === "undefined") {
      return DEFAULT_UI_SETTINGS;
    }

    return getUiSettings();
  });

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.motionLevel = uiSettings.motionLevel;
    root.style.setProperty("--motion-factor", getMotionFactor(uiSettings.motionLevel));
  }, [uiSettings.motionLevel]);

  function setSearchPreference(preference: SearchPreference) {
    const normalizedPreference = normalizeSearchPreference(preference);
    setSearchPreferenceState(normalizedPreference);
    saveSearchPreference(normalizedPreference);
  }

  function setUiSettings(settings: UISettings) {
    setUiSettingsState(settings);
    saveUiSettings(settings);
  }

  return (
    <SettingsContext.Provider
      value={{
        searchPreference,
        setSearchPreference,
        uiSettings,
        setUiSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useAppSettings() {
  const context = useContext(SettingsContext);

  if (!context) {
    throw new Error("useAppSettings must be used within SettingsProvider.");
  }

  return context;
}
