import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import UserNav from './Users/UserNav';
import { useTranslation } from "./translationContext";

interface DepartmentData {
  [department: string]: {
    types: {
      [type: string]: string[]; // Array of subtypes
    };
  };
}

const departmentData: DepartmentData = {
  Electricity: {
    types: {
      'Meter Issue':['New meter Installation','Old Meter Replacement','Meter not working','Meter Tampering','Inaccurate Reading'],
      'Supply Issue':['No Power Supply','Low Voltage','High Voltage','Phase Failure','Load Enhancement'],
      'Transformer Issue':['Transformer Failure (Burnt/Damaged)', 'Transformer Oil leakage','Transformer Fuse blown','Transformer overload','New Transformer Request'],
      'Line & Pole Issue':['Line Snapped/Fallen wire','Line sparking/arcing','Conductor Sagging(Low hanging wire)','Pole Damaged','New Pole Request','Tree Touching Line'],
      'Billing Issue':['Excess bill/wrong bill','Bill not Received','Bill Correction Request','Duplicate Bill Request', 'Name/address correction in bill'],
      'Theft & Unauthorized Usage':['Electricity Theft','Meter Bypass','Illegal Connection in neighbourhood','Unauthorized extension of load'],
      'New Connection & Service Request':['New Connection Application','Temporary Connection Request','Load Enhancement Request','Service Wire replacement request'],
      'Street Light Issue':['Street Light Not working','Street Light Flickering','New Street Light Request'],
      'Others':['Safety Hazard','Delay in Service Request','General Grievance']
    },
  },
  Water: {
    types: {
      'Water Supply Issue':['No Water Supply','"Low Pressure Supply','Intermittent Supply','Containination Issue'],
      'Pipeline Issue':['Leakage','Illegal Connections','Damaged Pipes/Old Pipes'],
      'Meter Issue':['New water meter installation','Faulty/ Broken Meter','Meter Reading MisMatch'],
      'Billing Issue':['Incorrect Bill','Duplicate Bill','Bill Not Generated'],
      'Sewage & Drainage Issues':['Sewer blockage', 'Manhole damage', 'Sewage mixing with Drinking Water'],
      'Other':['Water Theft','Delay in Service Request','General Grievance']
    },
  }
  // Add more departments, types, and subtypes as needed
};

const TypeSubtypeSelection: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  useEffect(() => {
    const department = localStorage.getItem('selectedDepartment');
    if (department) {
      setSelectedDepartment(department);
    } else {
      navigate('/'); 
    }
  }, [navigate]);

  const handleTypeSelect = (type: string) => {
    setSelectedType(type);
    localStorage.setItem('selectedType', type);
  };

  const handleSubtypeSelect = (subtype: string) => {
    localStorage.setItem('selectedSubtype', subtype);
    navigate('/chat');
  };

  if (!selectedDepartment) {
    return <div>Loading department information...</div>;
  }

  const departmentInfo = departmentData[selectedDepartment];

  if (!departmentInfo) {
    return <div>Department data not found for {selectedDepartment}.</div>;
  }

  const types = Object.keys(departmentInfo.types);
  const subtypes = selectedType ? departmentInfo.types[selectedType] : [];

  return (
    <div className="font-sans relative min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50">
      <UserNav />
      <div className="h-16 md:h-20"></div>

      <div className="w-full relative py-20 text-center px-4 z-10">
        <h1 className="text-2xl md:text-2xl font-bold text-[#0a3d91] mb-12 drop-shadow-sm">
          {selectedType
            ? t("selectSubtype", { type: selectedType } as any)
            : t("selectType", { department: selectedDepartment } as any)}
        </h1>

        <div className="flex justify-center gap-6 md:gap-8 lg:gap-12 flex-wrap max-w-7xl mx-auto">
          {(!selectedType ? types : subtypes).map((item) => (
            <div
              key={item}
              className="department-card bg-white rounded-2xl p-8 w-72 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 cursor-pointer group relative overflow-hidden"
              onClick={() => (!selectedType ? handleTypeSelect(item) : handleSubtypeSelect(item))}
            >
              <div className="text-6xl mb-4 transition-transform duration-300 group-hover:rotate-12 group-hover:animate-bounce">
                💡 {/* Placeholder for icon */}
              </div>
              <h2 className="text-xl font-bold text-[#0a3d91] mb-2">
                {t(item as any)}
              </h2>
              
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TypeSubtypeSelection;
