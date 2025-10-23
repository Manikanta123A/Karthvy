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
      'Meter Issue': ['New meter Installation', 'Old Meter Replacement', 'Meter not working', 'Meter Tampering', 'Inaccurate Reading'],
      'Supply Issue': ['No Power Supply', 'Low Voltage', 'High Voltage', 'Phase Failure', 'Load Enhancement'],
      'Transformer Issue': ['Transformer Failure (Burnt/Damaged)', 'Transformer Oil leakage', 'Transformer Fuse blown', 'Transformer overload', 'New Transformer Request'],
      'Line & Pole Issue': ['Line Snapped/Fallen wire', 'Line sparking/arcing', 'Conductor Sagging(Low hanging wire)', 'Pole Damaged', 'New Pole Request', 'Tree Touching Line'],
      'Billing Issue': ['Excess bill/wrong bill', 'Bill not Received', 'Bill Correction Request', 'Duplicate Bill Request', 'Name/address correction in bill'],
      'Theft & Unauthorized Usage': ['Electricity Theft', 'Meter Bypass', 'Illegal Connection in neighbourhood', 'Unauthorized extension of load'],
      'New Connection & Service Request': ['New Connection Application', 'Temporary Connection Request', 'Load Enhancement Request', 'Service Wire replacement request'],
      'Street Light Issue': ['Street Light Not working', 'Street Light Flickering', 'New Street Light Request'],
      'Others': ['Safety Hazard', 'Delay in Service Request', 'General Grievance']
    },
  },
  Water: {
    types: {
      'Water Supply Issue': ["No Water Supply", "Low Pressure Supply", "Intermittent Supply", "Contamination Issue"],
      'Pipeline Issue': ['Leakage', 'Illegal Connections', 'Damaged Pipes/Old Pipes'],
      'Meter Issue': ['New water meter installation', 'Faulty/ Broken Meter', 'Meter Reading MisMatch'],
      'Billing Issue': ['Incorrect Bill', 'Duplicate Bill', 'Bill Not Generated'],
      'Sewage & Drainage Issues': ['Sewer blockage', 'Manhole damage', 'Sewage mixing with Drinking Water'],
      'Other': ['Water Theft', 'Delay in Service Request', 'General Grievance']
    },
  },
  Municipal: {
  types: {
    'Garbage & Waste Management': [
      'Garbage Not Collected',
      'Irregular Collection Schedule',
      'Overflowing Dustbins',
      'Dead Animal Removal',
      'Segregation of Waste Not Done',
      'Illegal Dumping of Garbage',
      'Request for New Dustbin'
    ],
    'Roads & Footpaths': [
      'Potholes on Road',
      'Damaged Footpath',
      'Road Not Swept/Cleaned',
      'Waterlogging on Road',
      'New Road Construction Request',
      'Encroachment on Footpath'
    ],
    'Drainage & Sewage': [
      'Choked Drain',
      'Open Drain',
      'Broken Drain Cover',
      'Sewage Overflow',
      'Stormwater Drain Blockage'
    ],
    'Public Toilets & Sanitation': [
      'Public Toilet Not Cleaned',
      'Broken/Non-functional Toilet',
      'Water Not Available in Toilet',
      'New Public Toilet Request'
    ],
    'Parks & Public Spaces': [
      'Park Not Maintained',
      'Broken Benches/Play Equipment',
      'Overgrown Grass/Weeds',
      'Request for New Park',
      'Tree Pruning Required'
    ],
    'Street Lighting': [
      'Street Light Not Working',
      'Street Light Flickering',
      'Request for New Street Light',
      'Broken Street Light Pole'
    ],
    'Animal Control': [
      'Stray Dogs Menace',
      'Stray Cattle Causing Obstruction',
      'Animal Carcass Removal',
      'Request for Animal Birth Control Drive'
    ],
    'Building & Encroachment': [
      'Illegal Construction',
      'Encroachment on Public Land',
      'Building Debris Not Removed',
      'Unauthorized Banner/Advertisement'
    ],
    'Public Health & Mosquito Control': [
      'Mosquito Breeding Site',
      'Fogging/Spraying Not Done',
      'Open Garbage Causing Health Hazard',
      'Request for Anti-larva Treatment'
    ],
    'Others': [
      'Delay in Grievance Resolution',
      'Staff Misbehavior',
      'General Complaint/Feedback'
    ]
  }
}
 
};

const TypeSubtypeSelection: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  useEffect(() => {
    const department = localStorage.getItem('selectedDepartment');
    if (department !== "Query") {
      setSelectedDepartment(department);
    } else {
      console.log("We will navigate")
      navigate('/chat');
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
            ? t(selectedType as any)
            : t(selectedDepartment as any)}
        </h1>

        <div className="flex justify-center gap-6 md:gap-8 lg:gap-12 flex-wrap max-w-7xl mx-auto">
          {(!selectedType ? types : subtypes).map((item) => (
            <div className="flex justify-center gap-6 md:gap-8 lg:gap-12 flex-wrap max-w-7xl mx-auto px-4">
              <div
                  key={item}
                  className="bg-white rounded-2xl w-72 p-6 shadow-lg hover:shadow-2xl transition-transform duration-300 transform hover:-translate-y-2 hover:scale-105 cursor-pointer group overflow-hidden border border-gray-200"
                  onClick={() => (!selectedType ? handleTypeSelect(item) : handleSubtypeSelect(item))}
                >
                  <h2 className="text-xl font-semibold text-center text-[#0a3d91] mb-2 group-hover:text-blue-700 transition-colors">
                    {item}
                  </h2>
                </div>
            </div>

          ))}
        </div>
      </div>
    </div>
  );
};

export default TypeSubtypeSelection;
