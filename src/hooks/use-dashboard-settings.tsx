'use client';

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import { AVAILABLE_CARDS } from '@/lib/dashboard-cards';

const STORAGE_KEY = 'fluxdash-dashboard-settings-v2';

const DEFAULT_ACTIVE_CARDS = ['USD-BRL', 'EUR-BRL', 'weather', 'time'];

interface DashboardSettings {
    activeCardIds: string[];
    backgroundUrl: string | null;
}

interface DashboardSettingsContextType {
  settings: DashboardSettings;
  setSettings: (settings: DashboardSettings) => void;
  isLoaded: boolean;
}

const DEFAULT_SETTINGS: DashboardSettings = {
    activeCardIds: DEFAULT_ACTIVE_CARDS,
    backgroundUrl: null,
};

const DashboardSettingsContext = createContext<DashboardSettingsContextType | undefined>(undefined);

export function DashboardSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettingsState] = useState<DashboardSettings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedSettings = window.localStorage.getItem(STORAGE_KEY);
      if (storedSettings) {
        const parsedSettings = JSON.parse(storedSettings) as Partial<DashboardSettings>;
        
        const validIds = parsedSettings.activeCardIds?.filter((id: string) => 
            AVAILABLE_CARDS.some(card => card.id === id)
        ) || DEFAULT_ACTIVE_CARDS;
        
        setSettingsState({
            activeCardIds: validIds,
            backgroundUrl: parsedSettings.backgroundUrl || null,
        });
      } else {
        setSettingsState(DEFAULT_SETTINGS);
      }
    } catch (error) {
      console.error('Failed to load dashboard settings from local storage:', error);
      setSettingsState(DEFAULT_SETTINGS);
    }
    setIsLoaded(true);
  }, []);

  const setSettings = useCallback((newSettings: DashboardSettings) => {
    setSettingsState(newSettings);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
    } catch (error) {
      console.error('Failed to save dashboard settings to local storage:', error);
    }
  }, []);
  
  const value = { settings, setSettings, isLoaded };

  return (
    <DashboardSettingsContext.Provider value={value}>
      {children}
    </DashboardSettingsContext.Provider>
  );
};

export const useDashboardSettings = (): DashboardSettingsContextType => {
  const context = useContext(DashboardSettingsContext);
  if (context === undefined) {
    throw new Error('useDashboardSettings must be used within a DashboardSettingsProvider');
  }
  return context;
};
