import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Complaint } from './complainCard';
import axios from 'axios';
// import toast from 'react-hot-toast';
// import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
// import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useTranslation } from '../translationContext';

const LinemanComplaint: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const {currentLanguage} = useTranslation();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
//   const [AssetType,SetAssestType] = useState<string[]>([]);
//   const [mapAssets, setMapAssets] = useState<any[]>([]);
//   const [selectedAssetType, setSelectedAssetType] = useState<string>('All');
//   const dropdown: { [key: string]: string[] } = {
//     "Water": ["Pipes", "Water Tanks", "Valves"],
//     "Electricity": ["Poles", "Transformers", "Wires"],
//     "Municipal": ["Street Lights", "Garbage Bins", "Benches"],
//   }

  const complaintCache = useRef<{ [key: string]: Complaint | null }>({});

  const fetchComplaint = async () => {
      if (!id) {
        setError('No complaint ID provided.');
        setLoading(false);
        return;
      }

      const cacheKey = `${id}-${currentLanguage}`;
      if (complaintCache.current[cacheKey]) {
        setComplaint(complaintCache.current[cacheKey]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const response = await axios.post(`http://localhost:4000/api/complaints/Lineman/complaints/${id}`,{language:currentLanguage},{
          withCredentials:true
        });
        const fetchedComplaint = response.data.complaint;
        setComplaint(fetchedComplaint);
        complaintCache.current[cacheKey] = fetchedComplaint;
        setLoading(false);
      } catch (err) {
        console.error('Error fetching complaint details:', err);
        setComplaint(null);
        setError('Failed to fetch complaint details.');
        setLoading(false);
      }
    };
  useEffect(() => {
    fetchComplaint();
  }, [id, currentLanguage]);

//   useEffect(() => {
//     const fetchMapAssets = async () => {
//       if (!complaint || !complaint.latitude || !complaint.longitude) return; // Don't fetch if complaint location is not available
//       try {
//         const response = await axios.post(
//           `http://localhost:4000/api/assets/fetchMap`,
//           { 
//             longitude: complaint.longitude,
//             latitude: complaint.latitude,
//             assetType: selectedAssetType
//           },
//           { withCredentials: true }
//         );
//         setMapAssets(response.data);
//         SetAssestType(dropdown[complaint.category])
//       } catch (err) {
//         console.error('Error fetching map assets:', err);
//         toast.error('Failed to fetch assets for map.');
//       }
//     };
//     fetchMapAssets();
//   }, [complaint?.latitude, complaint?.longitude, selectedAssetType]);

  // Separate handlers for each action
  
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
        return 'bg-orange-500';
      case 'Resolved':
        return 'bg-teal-500';
      case 'visited':
        return 'bg-indigo-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (loading) {
    return <div className="text-center mt-20 text-black text-xl">Loading complaint details...</div>;
  }

  if (error) {
    return <div className="text-center mt-20 text-xl text-red-600">Error: {error}</div>;
  }

  if (!complaint) {
    return <div className="text-center mt-20 text-xl text-gray-600">No complaint data available.</div>;
  }

  return (
    <>
    <div className="min-h-screen bg-gray-100 md:p-8 p-2">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-4xl font-extrabold text-[#0a3d91] mb-2">Complaint Details (JE)</h1>
          <button
            onClick={() => navigate(-1)}
            className="mb-4 px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition duration-200"
          >
            &larr; Back to All Complaints
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
            <h2 className="text-2xl font-bold text-gray-800 mb-3">{complaint.Problem}</h2>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">{complaint.SubProblem}</h3>
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
                    <li key={index} className="mb-2 p-2 bg-blue-100 rounded-md text-gray-800 text-sm">{comment}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default LinemanComplaint;
