'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { DEFAULT_TRANSLATIONS, TranslationItem, SupportedLocale } from '@/data/translations';

interface LanguageContextType {
  locale: SupportedLocale;
  setLocale: (locale: SupportedLocale) => void;
  t: (key: string, fallback?: string) => string;
  translations: TranslationItem[];
  updateTranslationLine: (key: string, locale: SupportedLocale, value: string) => Promise<boolean>;
  bulkUpdateTranslations: (items: TranslationItem[]) => Promise<boolean>;
  resetToDefaults: () => void;
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LOCAL_STORAGE_TRANSLATIONS_KEY = 'aamadappetti_custom_translations_v1';
const LOCAL_STORAGE_LOCALE_KEY = 'aamadappetti_active_locale';

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<SupportedLocale>('en');
  const [translations, setTranslations] = useState<TranslationItem[]>(DEFAULT_TRANSLATIONS);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize from localStorage and API
  useEffect(() => {
    try {
      const savedLocale = localStorage.getItem(LOCAL_STORAGE_LOCALE_KEY) as SupportedLocale;
      if (savedLocale === 'en' || savedLocale === 'ta') {
        setLocaleState(savedLocale);
      }

      const savedTranslations = localStorage.getItem(LOCAL_STORAGE_TRANSLATIONS_KEY);
      if (savedTranslations) {
        const parsed = JSON.parse(savedTranslations);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setTranslations(parsed);
        }
      }
    } catch (e) {
      console.warn('Could not load translations from localStorage', e);
    } finally {
      setIsLoading(false);
    }

    // Try fetching live translations from server API in background
    fetch('/api/admin/translations')
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error('No custom translations API response');
      })
      .then((data) => {
        if (data?.translations && Array.isArray(data.translations)) {
          setTranslations(data.translations);
          try {
            localStorage.setItem(LOCAL_STORAGE_TRANSLATIONS_KEY, JSON.stringify(data.translations));
          } catch {
            // ignore
          }
        }
      })
      .catch(() => {
        // Fallback to local state is fine
      });
  }, []);

  const setLocale = useCallback((newLocale: SupportedLocale) => {
    setLocaleState(newLocale);
    try {
      localStorage.setItem(LOCAL_STORAGE_LOCALE_KEY, newLocale);
      document.documentElement.lang = newLocale;
    } catch {
      // ignore
    }
  }, []);

  // Quick lookup table for optimal performance
  const lookupMap = React.useMemo(() => {
    const map = new Map<string, { en: string; ta: string; [k: string]: string }>();
    for (const item of translations) {
      map.set(item.key, item.translations);
    }
    return map;
  }, [translations]);

  const t = useCallback(
    (key: string, fallback?: string): string => {
      const entry = lookupMap.get(key);
      if (!entry) {
        return fallback || key;
      }
      const val = entry[locale];
      if (val && val.trim().length > 0) {
        return val;
      }
      // Fallback to English if translation is blank
      return entry.en || fallback || key;
    },
    [lookupMap, locale]
  );

  const updateTranslationLine = async (
    key: string,
    targetLocale: SupportedLocale,
    value: string
  ): Promise<boolean> => {
    const updated = translations.map((item) => {
      if (item.key === key) {
        return {
          ...item,
          translations: {
            ...item.translations,
            [targetLocale]: value,
          },
        };
      }
      return item;
    });

    setTranslations(updated);

    try {
      localStorage.setItem(LOCAL_STORAGE_TRANSLATIONS_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }

    // Persist to server API
    try {
      await fetch('/api/admin/translations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, locale: targetLocale, value }),
      });
      return true;
    } catch (e) {
      console.error('Failed to sync translation with API', e);
      return false;
    }
  };

  const bulkUpdateTranslations = async (newItems: TranslationItem[]): Promise<boolean> => {
    setTranslations(newItems);
    try {
      localStorage.setItem(LOCAL_STORAGE_TRANSLATIONS_KEY, JSON.stringify(newItems));
    } catch {
      // ignore
    }

    try {
      await fetch('/api/admin/translations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ translations: newItems }),
      });
      return true;
    } catch {
      return false;
    }
  };

  const resetToDefaults = () => {
    setTranslations(DEFAULT_TRANSLATIONS);
    try {
      localStorage.removeItem(LOCAL_STORAGE_TRANSLATIONS_KEY);
    } catch {
      // ignore
    }
  };

  return (
    <LanguageContext.Provider
      value={{
        locale,
        setLocale,
        t,
        translations,
        updateTranslationLine,
        bulkUpdateTranslations,
        resetToDefaults,
        isLoading,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
}
