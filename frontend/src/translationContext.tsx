// TranslationContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { translations } from "./translation"; // your translations object

type LanguageCode = keyof typeof translations;

interface TranslationContextProps {
  currentLanguage: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: keyof typeof translations["english"], options?: { [key: string]: string }) => string;
}

const TranslationContext = createContext<TranslationContextProps | undefined>(undefined);

export const TranslationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>(() => {
    const storedLanguage = localStorage.getItem('selectedLanguage');
    return (storedLanguage as LanguageCode) || "english";
  });

  useEffect(() => {
    localStorage.setItem('selectedLanguage', currentLanguage);
  }, [currentLanguage]);

  const setLanguage = (lang: LanguageCode) => {
    setCurrentLanguage(lang);
  };

  const t = (key: keyof typeof translations["english"], options?: { [key: string]: string }) => {
    let translated = translations[currentLanguage]?.[key] || translations["english"][key];
    if (options) {
      for (const [k, value] of Object.entries(options)) {
        translated = translated.replace(new RegExp(`{{${k}}}`, 'g'), value);
      }
    }
    return translated;
  };

  return (
    <TranslationContext.Provider value={{ currentLanguage, setLanguage, t }}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = () => {
  const ctx = useContext(TranslationContext);
  if (!ctx) throw new Error("useTranslation must be used within TranslationProvider");
  return ctx;
};
