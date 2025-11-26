'use client';
import React, { createContext, useContext, useState, useEffect } from "react";
import Cookies from "js-cookie";
import { ChevronDown } from "lucide-react";
import ReactCountryFlag from "react-country-flag";

const LANGUAGES = [
  { code: "pt", name: "Português", countryCode: "PT" },
  { code: "en", name: "English", countryCode: "GB" },
  { code: "es", name: "Español", countryCode: "ES" },
  { code: "hi", name: "हिन्दी", countryCode: "IN" },
  { code: "zh", name: "中文", countryCode: "CN" },
  { code: "pl", name: "Polski", countryCode: "PL" },
];

const LanguageContext = createContext();

export const LanguageManager = ({ children, translations }) => {
  const [currentLang, setCurrentLang] = useState("pt");
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);

  useEffect(() => {
    const savedLang = Cookies.get("language");
    if (savedLang && translations[savedLang]) {
      setCurrentLang(savedLang);
    } else {
      const browserLang = navigator.language.split("-")[0];
      if (translations[browserLang]) {
        setCurrentLang(browserLang);
        Cookies.set("language", browserLang, { expires: 365 });
      }
    }
  }, [translations]);

  const changeLang = (lang) => {
    setCurrentLang(lang);
    Cookies.set("language", lang, { expires: 365 });
    setIsLangMenuOpen(false);
  };

  const LanguageSelector = () => {
    const currentLanguage = LANGUAGES.find((lang) => lang.code === currentLang);

    return (
      <div className="relative z-20">
        <button
          onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
          className="flex cursor-pointer items-center space-x-2 px-2 py-2 border border-[#FFCD00] bg-black/50 text-white rounded-2xl transition duration-300 hover:bg-[#FFCD00] hover:text-black"
        >
          <ReactCountryFlag
            countryCode={currentLanguage?.countryCode}
            svg
            className="rounded-sm"
            style={{ width: '22px', height: '16px' }}
          />
          <span className="uppercase ml-1">{currentLang}</span>
          <ChevronDown className="w-4 h-4" />
        </button>

        {isLangMenuOpen && (
          <div
            className="absolute right-0 mt-2 min-w-[180px] bg-[#0a0a0a] border border-[#FFCD00] rounded-xl shadow-xl origin-top-right"
          >
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => changeLang(lang.code)}
                className={`flex cursor-pointer items-center w-full px-4 py-2 text-sm text-white hover:bg-[#FFCD00] hover:text-black transition duration-200 ${
                  currentLang === lang.code ? "bg-[#1e1e1e]" : ""
                }`}
              >
                <ReactCountryFlag
                  countryCode={lang.countryCode}
                  svg
                  className="rounded-sm"
                  style={{ width: '22px', height: '16px' }}
                />
                <span className="ml-2">{lang.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <LanguageContext.Provider
      value={{
        currentLang,
        t: translations[currentLang],
        LanguageSelector,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

export default LanguageManager;
