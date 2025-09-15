import React, { useEffect, useState } from 'react';
import ComplaintCard from '../ComplaintCard';
import UserNav from './UserNav';
import axios from 'axios';
import type { Complaint } from '../ComplaintCard';

const ComplaintsPage: React.FC = () => {
  const [filter, setFilter] = useState<'ALL' | 'Visited' | 'Pending' | 'Assigned' | 'In0progress' | 'UpShift' | 'Resolved' | 'Closed'>('ALL');
  const [category, setCategory] = useState<'All' | 'Water' | 'Electricity' | 'Municipal' | 'Query'>('All');
  const [filteredComplaints, setComplaints] = useState<Complaint[]>([]);

  const fetchComplaints = async () => {
    try {
      const response = await axios.post("http://localhost:4000/api/complaints/my", {
        userid: localStorage.getItem('userId'),
        filter: filter,
        category: category,
      });
      console.log(response)
      setComplaints(response.data.complaints);
    } catch (err) {
      console.log(err);
      setComplaints([]);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [filter, category]);



  return (
    <>
      <UserNav />
      <div className=" bg-white p-4 mt-20 flex flex-col ">
        <h1 className="text-3xl font-bold text-center mb-6 text-[#0a3d91]">My Complaints</h1>

        <div className="flex flex-col md:flex-row justify-center gap-4 mb-8">
          <div className="flex flex-col">
            <label htmlFor="status-filter" className="text-lg font-semibold mb-2 text-gray-700">Filter by Status:</label>
            <select
              id="status-filter"
              value={filter}
              onChange={(e) => setFilter(e.target.value as typeof filter)}
              className="px-5 py-4 rounded-md text-blue-600 text-xl font-bold bg-white border border-blue-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {['ALL', 'Closed', 'Pending', 'Assigned', 'In Progress', 'UpShift', 'Resolved'].map((s) => (
                <option key={s} value={s} className='text-blue-600 text-xl'>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col">
            <label htmlFor="department-filter" className="text-lg font-semibold mb-2 text-gray-700">Filter by Department:</label>
            <select
              id="department-filter"
              value={category}
              onChange={(e) => setCategory(e.target.value as typeof category)}
              className="px-5 py-4 rounded-md text-blue-600 text-xl font-bold bg-white border border-blue-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {['All', 'Water', 'Electricity', 'Municipal', 'Query'].map((s) => (
                <option key={s} value={s} className='text-blue-600 text-xl'>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="md:max-w-4xl w-full mx-auto space-y-6 mb-10">
          {filteredComplaints.length > 0 ? (
            filteredComplaints.map(complaint => (
              <ComplaintCard key={complaint._id} complaint={complaint} />
            ))
          ) : (
            <p className="text-center text-gray-600 text-lg">No complaints found for the selected filter.</p>
          )}
        </div>
      </div>
    </>
  );
};

export default ComplaintsPage;
