import { Link, useNavigate } from 'react-router-dom';
import React from 'react';
import { useTranslation } from '../translationContext';
import axios from 'axios';

interface LinemanNavProps {
  category: 'electricity' | 'water' | 'municipal' | null;
}

function LinemanNav({ category }: LinemanNavProps) {
  const { currentLanguage, setLanguage } = useTranslation();
  const navigate = useNavigate();

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value as any);
  };

  const handleLogout = async () => {
    try {
      await axios.get('http://localhost:4000/api/auth/logout',{ withCredentials: true });
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Fixed blue navbar color for all categories
  const navbarColorClass = 'bg-gradient-to-r from-[#0a3d91] via-[#0f4fb2] to-[#0a3d91]';

  return (
    <>
      <header className={`fixed top-0 md:left-0 w-full ${navbarColorClass} shadow-md z-50`}>
        <div className="max-w-7xl md:mx-auto px-6 py-4 md:flex justify-between items-center">
          <h1 className="text-white font-bold text-xl text-center tracking-wide">
            KARTHVY - JE
          </h1>

          <nav className="hidden md:flex space-x-8 mr-4">
            <Link
              to="/linemanall"
              className="relative text-white text-2xl font-medium group"
            >
              My Complaints
              <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-yellow-300 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <button
              onClick={handleLogout}
              className="relative text-white text-2xl font-bold group"
            >
              Logout
              <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-yellow-300 transition-all duration-300 group-hover:w-full"></span>
            </button>
          </nav>
          <div className="language-switcher">
            <select
              value={currentLanguage}
              onChange={handleLanguageChange}
              className="bg-blue-600 text-white p-2 rounded-md"
            >
              <option value="english">English</option>
              <option value="hindi">हिंदी</option>
              <option value="telugu">తెలుగు</option>
              <option value="marathi">मराठी</option>
              <option value="tamil">தமிழ்</option>
              <option value="malayalam">മലയാളം</option>
              <option value="urdu">اردو</option>
              <option value="kannada">ಕನ್ನಡ</option>
            </select>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navbar */}
      <footer className="fixed bottom-0 left-0 w-full bg-white border-t shadow-lg z-50 md:hidden">
        <nav className="flex justify-around py-2">
          <Link
            to="/linemanall"
            className="flex flex-col items-center text-gray-600 hover:text-[#0a3d91] transition-colors duration-300"
          >
            📝
            <span className="text-sm">Complaints</span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex flex-col items-center text-gray-600 hover:text-[#0a3d91] transition-colors duration-300"
          >
            🚪
            <span className="text-sm">Logout</span>
          </button>
        </nav>
      </footer>
    </>
  );
}

export default LinemanNav;
