'use client';

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import { AVAILABLE_CARDS } from '@/lib/dashboard-cards';

const STORAGE_KEY = 'fluxdash-dashboard-settings';

const DEFAULT_ACTIVE_CARDS = ['USD-BRL', 'EUR-BRL', 'weather', 'time'];

interface DashboardSettingsContextType {
  activeCardIds: string[];
  setActiveCardIds: (ids: string[]) => void;
  isLoaded: boolean;
}

const DashboardSettingsContext = createContext<DashboardSettingsContextType | undefined>(undefined);

export function DashboardSettingsProvider({ children }: { children: ReactNode }) {
  const [activeCardIds, setActiveCardIdsState] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedSettings = window.localStorage.getItem(STORAGE_KEY);
      if (storedSettings) {
        const parsedSettings = JSON.parse(storedSettings);
        // Validate that saved IDs are still valid cards
        const validIds = parsedSettings.activeCardIds.filter((id: string) => 
            AVAILABLE_CARDS.some(card => card.id === id)
        );
        setActiveCardIdsState(validIds);
      } else {
        // Set default cards for new users
        setActiveCardIdsState(DEFAULT_ACTIVE_CARDS);
      }
    } catch (error) {
      console.error('Failed to load dashboard settings from local storage:', error);
      setActiveCardIdsState(DEFAULT_ACTIVE_CARDS);
    }
    setIsLoaded(true);
  }, []);

  const updateLocalStorage = (updatedIds: string[]) => {
    try {
      const settings = { activeCardIds: updatedIds };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save dashboard settings to local storage:', error);
    }
  };

  const setActiveCardIds = useCallback((ids: string[]) => {
    setActiveCardIdsState(ids);
    updateLocalStorage(ids);
  }, []);
  
  const value = { activeCardIds, setActiveCardIds, isLoaded };

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
