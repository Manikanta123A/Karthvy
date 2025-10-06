import { useNavigate } from "react-router-dom";
import { useTranslation } from "./translationContext";
import UserNav from "./Users/UserNav";

export default function Test() {
  const { t } = useTranslation();
  const navigator = useNavigate();

  const toggleList = (departmentName: string) => {
    localStorage.setItem('selectedDepartment', departmentName);
    navigator('/select-type-subtype');
  };

  return (
    <div className="font-sans relative min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50">
      {/* Desktop Navbar */}
      <UserNav/>
      {/* Spacer to avoid overlap */}
      <div className="h-16 md:h-20"></div>

      {/* Department Section */}
      <div className="w-full relative py-20 text-center px-4 z-10">
        <h1 className="text-2xl md:text-5xl font-bold text-[#0a3d91] mb-12 drop-shadow-sm">
          {t("selectDepartment")}
        </h1>

        <div className="flex justify-center gap-6 md:gap-8 lg:gap-12 flex-wrap max-w-7xl mx-auto">
          {/* Water Dept */}
          <div
            className="department-card bg-white rounded-2xl p-8 w-72 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 cursor-pointer group relative overflow-hidden"
            onClick={() => toggleList("Water")}
          >
            <div className="text-6xl mb-4 transition-transform duration-300 group-hover:rotate-12 group-hover:animate-bounce">
              🚰
            </div>
            <h2 className="text-xl font-bold text-[#0a3d91] mb-2">
              {t("waterDepartment")}
            </h2>
            <p className="text-gray-600 text-sm md:opacity-0 md:group-hover:opacity-100 md:transition-opacity duration-300">
              {t("waterdetail")}
            </p>
          </div>

          {/* Electricity Dept */}
          <div
            className="department-card bg-white rounded-2xl p-8 w-72 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 cursor-pointer group relative overflow-hidden"
            onClick={() => toggleList("Electricity")}
          >
            <div className="text-6xl mb-4 transition-transform duration-300 group-hover:rotate-12 group-hover:animate-pulse">
              ⚡
            </div>
            <h2 className="text-xl font-bold text-[#0a3d91] mb-2">
              {t("electricityDepartment")}
            </h2>
            <p className="text-gray-600 text-sm md:opacity-0 md:group-hover:opacity-100 md:transition-opacity duration-300">
              {t("electricitydetail")}
            </p>
          </div>

          {/* Municipal Dept */}
          <div
            className="department-card bg-white rounded-2xl p-8 w-72 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 cursor-pointer group relative overflow-hidden"
            onClick={() => toggleList("Municipal")}
          >
            <div className="text-6xl mb-4 transition-transform duration-300 group-hover:rotate-12 group-hover:animate-ping">
              🏛️
            </div>
            <h2 className="text-xl font-bold text-[#0a3d91] mb-2">
              {t("municipalDepartment")}
            </h2>
            <p className="text-gray-600 text-sm md:opacity-0 md:group-hover:opacity-100 md:transition-opacity duration-300">
              {t("municipaldetail")}
            </p>
          </div>

          {/* Query Dept */}
          <div
            className="department-card bg-white rounded-2xl p-8 w-72 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 cursor-pointer group relative overflow-hidden"
            onClick={() => toggleList(t("queryDepartment"))}
          >
            <div className="text-6xl mb-4 transition-transform duration-300 group-hover:rotate-12 group-hover:animate-spin">
              ❓
            </div>
            <h2 className="text-xl font-bold text-[#0a3d91] mb-2">
              {t("queryDepartment")}
            </h2>
            <p className="text-gray-600 text-sm md:opacity-0 md:group-hover:opacity-100 md:transition-opacity duration-300">
              {t("querydetail")}
            </p>
          </div>
        </div>
      </div>

          </div>
  );
}
