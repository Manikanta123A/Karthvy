import React, { useEffect, useState, useRef } from 'react';
import ComplaintCard from '../ComplaintCard';
import UserNav from './UserNav';
import axios from 'axios';
import type { Complaint } from '../ComplaintCard';
import toast from 'react-hot-toast';
import { useTranslation } from '../translationContext';
import { useNavigate } from 'react-router-dom';

const ComplaintsPage: React.FC = () => {
  const navigate = useNavigate();
  const {currentLanguage} = useTranslation();
  const [filter, setFilter] = useState<'ALL' | 'visited' | 'Pending' | 'Assigned' | 'In-progress' | 'Upshift' | 'Resolved' | 'Closed'>('ALL');
  const [category, setCategory] = useState<'All' | 'Water' | 'Electricity' | 'Municipal' | 'Query'>('All');
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const cache = useRef<{ [key: string]: { complaints: Complaint[], hasMore: boolean, page: number } }>({});

  const fetchComplaints = async (pageNumber: number, append: boolean = false) => {
    const cacheKey = `${filter}-${category}-${currentLanguage}`;
    console.log(`[ComplaintsPage] Fetching complaints. Page: ${pageNumber}, Append: ${append}, Filter: ${filter}, Category: ${category}, Language: ${currentLanguage}`);
    console.log('[ComplaintsPage] Cache Key:', cacheKey);

    if (!append && cache.current[cacheKey] && cache.current[cacheKey].page >= pageNumber) {
      console.log('[ComplaintsPage] Serving from cache for key:', cacheKey);
      // If not appending and data is in cache for this page or later, use cached data
      const cachedData = cache.current[cacheKey];
      setComplaints(cachedData.complaints.slice(0, pageNumber * 6)); // Display up to current page's data
      setHasMore(cachedData.hasMore);
      setLoading(false);
      return;
    }

    console.log('[ComplaintsPage] Making API call for key:', cacheKey);
    setLoading(true);
    
    if (!append) {
      setComplaints([]);
      setPage(1);
      setHasMore(true);
    }

    try {
      const response = await axios.post("http://localhost:4000/api/complaints/my", {
        filter: filter,
        category: category,
        language: currentLanguage,
        page: pageNumber,
        limit: 6 // Fetch 6 complaints at a time
      },{
        withCredentials:true
      });
      const newComplaints: Complaint[] = response.data.complaints;
      const newHasMore: boolean = response.data.hasMore;

      setComplaints((prevComplaints) => {
        const updatedComplaints = append ? [...prevComplaints, ...newComplaints] : newComplaints;
        
        // Update cache
        cache.current[cacheKey] = {
          complaints: updatedComplaints,
          hasMore: newHasMore,
          page: pageNumber
        };
        return updatedComplaints;
      });
      setHasMore(newHasMore);
    } catch (err:any) {
       if(err.response.data.error !== undefined){
        console.log(err)
        toast.error(err.response.data.error)
        navigate("/login");
      }else{
         toast.error(err.response.data.message)
      }
      setComplaints([]);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Reset pagination states and fetch new complaints when filters or language change
    fetchComplaints(1);
  }, [filter, category, currentLanguage]);

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
              {['ALL', 'Closed', 'visited','Pending', 'Assigned', 'In-Progress', 'Upshift', 'Resolved'].map((s) => (
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
          {complaints.length > 0 ? (
            complaints.map(complaint => (
              <ComplaintCard key={complaint._id} complaint={complaint} />
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

export default ComplaintsPage;
