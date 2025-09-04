import React, { useState } from 'react';
import ComplaintCard from './ComplaintCard';

interface Complaint {
  id: string;
  image: string;
  description: string;
  status: 'Closed' | 'Pending' | 'Assigned' | 'Working';
  submittedDate: string;
  closedDate?: string; // Optional, only for 'Closed' status
  personnelComment?: string; // Optional comment from personnel
}

const dummyComplaints: Complaint[] = [
  {
    id: '1',
    image: 'https://via.placeholder.com/100',
    description: 'Water leakage in Sector 5, Block A, causing damage to public property and road erosion. Needs urgent attention.',
    status: 'Pending',
    submittedDate: '2023-10-26',
  },
  {
    id: '2',
    image: 'https://via.placeholder.com/100',
    description: 'Frequent power outages in Green Valley area, affecting essential services and daily life. Residents are facing severe inconvenience.',
    status: 'Assigned',
    submittedDate: '2023-10-25',
    personnelComment: 'Team assigned. Investigation in progress. Expect updates within 24 hours.',
  },
  {
    id: '3',
    image: 'https://via.placeholder.com/100',
    description: 'Garbage collection irregular in City Park residential area, leading to unhygienic conditions and foul smell. Health hazard concerns.',
    status: 'Working',
    submittedDate: '2023-10-24',
    personnelComment: 'Garbage trucks dispatched. Collection expected to be completed by end of day.',
  },
  {
    id: '4',
    image: 'https://via.placeholder.com/100',
    description: 'Broken street light on Main Street near the market, increasing risk of accidents at night. Requires immediate repair.',
    status: 'Closed',
    submittedDate: '2023-10-23',
    closedDate: '2023-10-24',
    personnelComment: 'Street light repaired and tested. Area is now properly illuminated.',
  },
  {
    id: '5',
    image: 'https://via.placeholder.com/100',
    description: 'Potholes on Highway 7, causing traffic congestion and potential harm to vehicles. Needs road maintenance.',
    status: 'Pending',
    submittedDate: '2023-10-22',
  },
];

const ComplaintsPage: React.FC = () => {
  const [filter, setFilter] = useState<'All' | 'Closed' | 'Pending' | 'Assigned' | 'Working'>('All');

  const filteredComplaints = dummyComplaints.filter(complaint => {
    if (filter === 'All') {
      return true;
    }
    return complaint.status === filter;
  });


  return (
    <div className=" bg-white p-4 flex flex-col overflow-y-auto">
      <h1 className="text-3xl font-bold text-center mb-6 text-[#0a3d91]">My Complaints</h1>

      <div className="flex justify-center space-x-2 mb-8">
        {['All', 'Closed', 'Pending', 'Assigned', 'Working'].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s as typeof filter)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
              ${filter === s ? 'bg-[#0a3d91] text-white shadow-md' : 'bg-gray-200 text-white hover:bg-gray-300'}`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="md:max-w-4xl w-full mx-auto space-y-6 overflow-y-auto flex-grow">
        {filteredComplaints.length > 0 ? (
          filteredComplaints.map(complaint => (
            <ComplaintCard key={complaint.id} complaint={complaint} />
          ))
        ) : (
          <p className="text-center text-gray-600 text-lg">No complaints found for the selected filter.</p>
        )}
      </div>
    </div>
  );
};

export default ComplaintsPage;
