import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type {Complaint}  from '../ComplaintCard'; // Re-using the Complaint interface
import axios from 'axios';
import toast from 'react-hot-toast';
import { useTranslation } from '../translationContext';

const Complaints: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const {currentLanguage} = useTranslation();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);


  const fetchComplaint = async ()=>{
    if (!id) {
      setError('No complaint ID provided.');
      setLoading(false);
      return;
    }
    try {
      const response = await axios.post(`http://localhost:4000/api/complaints/id/${id}`,{language:currentLanguage},{withCredentials:true});
      setComplaint(response.data);
      setLoading(false);

    }catch (err:any) {
      if(err.response.data.error !== undefined){
        toast.error(err.response.data.error)
        navigate("/login");
      }
      else{
      toast.error(err.response.data.message)
      setComplaint(null);
      setError('Failed to fetch complaint details.');
      setLoading(false);
      }
    }
  }


  useEffect(() => {
    console.log("i got called")
    fetchComplaint();
  }, []);

  if (loading == true) {
    return <div className="text-center mt-20 text-black text-xl">Loading complaint details...</div>;
  }

  if (error) {
    return <div className="text-center mt-20 text-xl text-red-600">Error: {error}</div>;
  }

  if (!complaint) {
    return <div className="text-center mt-20 text-xl text-gray-600">No complaint data available.</div>;
  }

  const getStatusColor = (status: Complaint['status']) => {
    switch (status) {
      case 'Closed':
        return 'bg-green-500';
      case 'Pending':
        return 'bg-yellow-500';
      case 'Assigned':
        return 'bg-blue-500';
      case 'In-progress':
        return 'bg-purple-500';
      case 'Upshift':
        return 'bg-red-500';
      case 'Resolved':
        return 'bg-indigo-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <>
    <div className="min-h-screen bg-gray-100 md:p-8 p-2">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-4xl font-extrabold text-[#0a3d91] mb-2">Complaint Details</h1>
          <button
            onClick={() => navigate(-1)}
            className="mb-4 px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition duration-200"
          >
            &larr; Back to Complaints
          </button>
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-gray-600"><strong className="text-gray-800">Complaint ID:</strong> {complaint._id}</p>
            <span className={`px-4 py-1 text-md font-semibold text-white rounded-full ${getStatusColor(complaint.status)}`}>
              {complaint.status}
            </span>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">Problem Report</h2>
            <p className="text-gray-700 text-lg leading-relaxed">{complaint.problemReport}</p>

            <div className="mt-5">
              <p className="text-gray-600 text-sm"><strong className="text-gray-800">Category:</strong> {complaint.category}</p>
              <p className="text-gray-600 text-sm">
                <strong className="text-gray-800">Complained At:</strong>{' '}
                {complaint.createdAt
                  ? new Date(complaint.createdAt).toLocaleString()
                  : 'N/A'}
              </p>
              {complaint.Affects && <p className="text-gray-600 text-sm"><strong className="text-gray-800">Affects:</strong> {complaint.Affects}</p>}
              {complaint.urgencyLevel && <p className="text-gray-600 text-sm"><strong className="text-gray-800">Urgency Level:</strong> {complaint.urgencyLevel}</p>}
              {complaint.closedAt && <p className="text-gray-600 text-sm"><strong className="text-gray-800">Closed At:</strong> {new Date(complaint.closedAt).toLocaleString()}</p>}
            </div>

            {complaint.Images && complaint.Images.length > 0 && (
              <div className="mt-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Attached Images</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {complaint.Images.map((image, index) => (
                    <img key={index} src={image} alt={`Complaint Image ${index + 1}`} className="w-full h-40 object-cover rounded-md shadow-sm" />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">Solution & Comments</h2>
            {complaint.solutionReport && (
              <div className="mb-5 p-3 bg-green-50 rounded-md border-l-4 border-green-200">
                <p className="text-green-700 text-sm font-medium">Solution Report:</p>
                <p className="text-green-600 text-sm">{complaint.solutionReport}</p>
              </div>
            )}

            {complaint.comments && complaint.comments.length > 0 && (
              <div className="mt-4 p-3 bg-blue-50 rounded-md border-l-4 border-blue-200">
                <p className="text-blue-700 text-sm font-medium">Comments:</p>
                <ul className="list-disc list-inside text-blue-600 text-sm">
                  {complaint.comments.map((comment, index) => (
                    <li key={index}>{comment}</li>
                  ))}
                </ul>
              </div>
            )}

            {complaint.rating !== undefined && complaint.rating > 0 && (
              <div className="mt-4">
                <p className="mb-1 font-semibold text-black">Your Rating:</p>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      xmlns="http://www.w3.org/2000/svg"
                      className={`h-6 w-6 ${complaint.rating && complaint.rating >= star ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.974a1 1 0 00.95.69h4.18c.969 0 1.371 1.24.588 1.81l-3.386 2.462a1 1 0 00-.364 1.118l1.287 3.974c.3.921-.755 1.688-1.54 1.118L10 13.347l-3.386 2.462c-.784.57-1.838-.197-1.539-1.118l1.287-3.974a1 1 0 00-.364-1.118L3.612 9.4c-.783-.57-.38-1.81.588-1.81h4.18a1 1 0 00.95-.69l1.286-3.974z" />
                    </svg>
                  ))}
                  <span className="ml-2 text-yellow-600 font-semibold">
                    {complaint.rating} star{complaint.rating > 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default Complaints;
