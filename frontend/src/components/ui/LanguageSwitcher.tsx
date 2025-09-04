import { useTranslation } from "@/translationContext";
import { useEffect, useState } from "react";

function LanguageSw() {



  const { currentLanguage, setLanguage} = useTranslation();
  const [showLanguageDropdown, setShowLanguageDropdown] = useState<boolean>(false);


  const handleLanguageChange = (languageCode: string) => {


    console.log('Language changed to:', languageCode);
    setLanguage(languageCode as any);
    setShowLanguageDropdown(false);
  };

  // Debug logging
  useEffect(() => {
    console.log('Current language:', currentLanguage);
    console.log('Show dropdown:', showLanguageDropdown);
  }, [currentLanguage, showLanguageDropdown]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.language-dropdown')) {
        setShowLanguageDropdown(false);
      }
    };

    if (showLanguageDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showLanguageDropdown]);


  const languages = [
    { code: 'english', name: 'English', flag: '🇺🇸' },
    { code: 'hindi', name: 'हिंदी', flag: '🇮🇳' },
    { code: 'telugu', name: 'తెలుగు', flag: '🇮🇳' },
    { code: 'marathi', name: 'मराठी', flag: '🇮🇳' },
    { code: 'tamil', name: 'தமிழ்', flag: '🇮🇳' },
    { code: 'malayalam', name: 'മലയാളം', flag: '🇮🇳' },
    { code: 'urdu', name: 'اردو', flag: '🇵🇰' },
    { code: 'bengali', name: 'বাংলা', flag: '🇧🇩' },
    { code: 'kannada', name: 'ಕನ್ನಡ', flag: '🇮🇳' }
  ];


  return (
    <div className="fixed top-4 right-4 z-[9999] language-dropdown">
      <div className="relative">
        <button
          onClick={() => {
            console.log('Dropdown button clicked!');
            setShowLanguageDropdown(!showLanguageDropdown);
          }}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-3 rounded-xl shadow-2xl hover:shadow-3xl transition-all duration-300 border-4 border-yellow-400 text-white font-bold animate-pulse"
          style={{
            minWidth: '140px',
            boxShadow: '0 0 20px rgba(255, 255, 0, 0.8)',
            textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
          }}
        >
          <span className="text-xl">
            {languages.find(lang => lang.code === currentLanguage)?.flag}
          </span>
          <span className="text-sm">
            {languages.find(lang => lang.code === currentLanguage)?.name}
          </span>
          <svg
            className={`w-5 h-5 text-white transition-transform duration-300 ${showLanguageDropdown ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showLanguageDropdown && (
          <div className="absolute top-full right-0 mt-2 bg-red-600 rounded-xl shadow-2xl border-2 border-white overflow-hidden min-w-48">
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language.code)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-red-700 transition-colors duration-200 ${currentLanguage === language.code ? 'bg-red-800 text-white' : 'text-white'
                  }`}
              >
                <span className="text-lg">{language.flag}</span>
                <span className="text-sm font-medium">{language.name}</span>
                {currentLanguage === language.code && (
                  <svg className="w-4 h-4 ml-auto text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
      </div>
      );
}


export default LanguageSw;