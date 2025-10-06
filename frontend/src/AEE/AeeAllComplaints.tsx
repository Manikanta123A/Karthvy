import React, { useState, useEffect } from 'react';
import JeCard from './AeeComplainCard';
import type { Complaint } from './AeeComplainCard';
import axios from 'axios';
import AeeNavBar from './AeeNavbar'; // Import the new JeNavbar component
import { useTranslation } from '../translationContext';

const AeeAllComplaints: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const {currentLanguage} = useTranslation();
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "Pending" | "Assigned" | "visited" | "In-progress" | "Upshift" | "Resolved" | "Closed"
  >("ALL");
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const complaintCategory = complaints.length > 0 ? complaints[0].category : null;

  const fetchComplaints = async (pageNumber: number, append: boolean = false) => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:4000/api/complaints/viewallaee',{
          status:statusFilter,
          language:currentLanguage,
          page: pageNumber,
          limit: 6 // Fetch 6 complaints at a time
        },{withCredentials:true});
        const newComplaints: Complaint[] = response.data.complains;
        if (append) {
          setComplaints((prevComplaints) => [...prevComplaints, ...newComplaints]);
        } else {
          setComplaints(newComplaints);
        }
        setHasMore(newComplaints.length === 6); // Assuming 6 is the limit, if less, no more data
      } catch (error) {
        console.error('Error fetching complaints:', error);
        setComplaints([]);
        setHasMore(false);
      } finally {
        setLoading(false);
      }
  };
  useEffect(() => {
    setComplaints([]); // Clear complaints when status filter changes
    setPage(1); // Reset page to 1
    setHasMore(true); // Assume there's more data when filter changes
    fetchComplaints(1);
  }, [statusFilter,currentLanguage]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
          document.documentElement.offsetHeight - 100 && // -100 to trigger a bit before the very end
        !loading &&
        hasMore
      ) {
        setPage((prevPage) => prevPage + 1);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loading, hasMore]);

  useEffect(() => {
    if (page > 1) {
      fetchComplaints(page, true);
    }
  }, [page]);

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value as typeof statusFilter);
  };

  return (
    <>
      < AeeNavBar category={complaintCategory?.toLowerCase() as 'electricity' | 'water' | 'municipal' | null}/> {/* Render the Navbar here */}
      <div className="container mx-auto p-4 pt-20"> {/* Add padding-top to account for fixed navbar */}
        <h2 className="text-2xl font-bold mb-4">All Complaints (JE)</h2>
        <div className="mb-4 flex justify-center">
          <label htmlFor="statusFilter" className="mr-2 text-lg font-semibold mb-2 text-gray-700">Filter by Status:</label>
          <select id="statusFilter" value={statusFilter} onChange={handleStatusChange} className="px-5 py-4 rounded-md text-blue-600 text-xl font-bold bg-white border border-blue-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            {['ALL', 'Pending', 'Assigned', 'visited', 'In-progress', 'Upshift', 'Resolved', 'Closed'].map((s) => (
              <option key={s} value={s} className='text-blue-600 text-xl'>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div className="md:max-w-4xl w-full mx-auto space-y-6 mb-10">
          {complaints.length > 0 ? (
            complaints.map((complaint) => (
              <JeCard key={complaint._id} complaint={complaint} />
            ))
          ) : (
            !loading && <p className="text-center text-gray-600 text-lg">No complaints found for the selected filter.</p>
          )}
          {loading && <p className="text-center text-gray-600 text-lg">Loading more complaints...</p>}
          {!hasMore && complaints.length > 0 && <p className="text-center text-gray-600 text-lg">You have seen all complaints.</p>}
        </div>
      </div>
    </>
  );
};

export default AeeAllComplaints;
