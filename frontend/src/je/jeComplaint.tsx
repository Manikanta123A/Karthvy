import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Complaint } from './jeCard';
import axios from 'axios';
import toast from 'react-hot-toast';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useTranslation } from '../translationContext';

const JeComplaint: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { currentLanguage } = useTranslation();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState<string>('');
  const [newSolution, setNewSolution] = useState<string>('');
  const [AssetType, SetAssestType] = useState<string[]>([]);
  const [newStatus, setNewStatus] = useState<Complaint['status']>('Pending');
  const [assignedLineman, setAssignedLineman] = useState<string>('');
  const [upshiftReason, setUpshiftReason] = useState<string>('');
  const [mapAssets, setMapAssets] = useState<any[]>([]);
  const [runEffect, setRunEffect] = useState<boolean>(false);
  const [selectedAssetType, setSelectedAssetType] = useState<string>('All');
  const dropdown: { [key: string]: string[] } = {
    "Water": ["Pipes", "Water Tanks", "Valves"],
    "Electricity": ["Poles", "Transformers", "Wires"],
    "Municipal": ["Street Lights", "Garbage Bins", "Benches"],
  }
  const [linemen, setLinemen] = useState<any[]>([]); // New state for linemen

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
      const response = await axios.post(`http://localhost:4000/api/complaints/viewJeCompalint/${id}`, { language: currentLanguage }, {
        withCredentials: true
      });
      const fetchedComplaint = response.data.complaint;
      setComplaint(fetchedComplaint);
      setLinemen(response.data.linemen); 
      console.log(response.data.linemen);
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
  }, [id, currentLanguage, runEffect]);

  useEffect(() => {
    const fetchMapAssets = async () => {
      if (!complaint || !complaint.latitude || !complaint.longitude) return; // Don't fetch if complaint location is not available
      try {
        const response = await axios.post(
          `http://localhost:4000/api/assets/fetchMap`,
          {
            longitude: complaint.longitude,
            latitude: complaint.latitude,
            assetType: selectedAssetType
          },
          { withCredentials: true }
        );
        setMapAssets(response.data);
        SetAssestType(dropdown[complaint.category])
      } catch (err) {
        console.error('Error fetching map assets:', err);
        toast.error('Failed to fetch assets for map.');
      }
    };
    fetchMapAssets();
  }, [complaint?.latitude, complaint?.longitude, selectedAssetType]);

  // Separate handlers for each action
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaint || !newComment.trim()) return;

    try {
      await axios.post(`http://localhost:4000/api/complaints/writeComment`, {
        id: complaint._id,
        comment: newComment
      }, {
        withCredentials: true
      });
      setComplaint(prevComplaint => {
        if (!prevComplaint) return null;
        return {
          ...prevComplaint,
          comments: [...(prevComplaint.comments || []), newComment]
        };
      });
      setNewComment('');
    } catch (err: any) {
      console.error('Error adding comment:', err);
      toast.error(err.response.data.error)

    }
  };

  const handleSolutionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaint || !newSolution.trim()) return;

    try {
      await axios.post(`http://localhost:4000/api/complaints/writeSolution`, { id: complaint._id, solution: newSolution }, {
        withCredentials: true
      });
      setComplaint(prevComplaint => {
        if (!prevComplaint) return null;
        return {
          ...prevComplaint,
          solutionReport: newSolution
        };
      });
      setNewSolution('');
    } catch (err: any) {
      console.error('Error reporting solution:', err);
      toast.error(err.response.data.error)
    }
  };

  const handleStatusChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaint) return;

    try {
      await axios.post(`http://localhost:4000/api/complaints/changeStatus`, { id: complaint._id, status: newStatus }, {
        withCredentials: true
      });
      setComplaint(prevComplaint => {
        if (!prevComplaint) return null;
        return {
          ...prevComplaint,
          status: newStatus
        };
      });
    } catch (err: any) {
      console.error('Error updating status:', err);
      toast.error(err.response.data.error)
    }
  };

  const handleLinemanAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaint || !assignedLineman) return;

    try {
      console.log(assignedLineman)
      await axios.post(`http://localhost:4000/api/complaints/assignLine`, { id: complaint._id, AssignedId: assignedLineman }, {
        withCredentials: true
      });
      setComplaint(prevComplaint => {
        if (!prevComplaint) return null;
        return {
          ...prevComplaint,
          AssignedWorker: assignedLineman 
        };
      });
    } catch (err: any) {
      toast.error(err.response.data.error)
      console.error('Error assigning lineman:', err);
    }
  };

  const handleUpshiftSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaint || !upshiftReason.trim()) return;
    try {
      await axios.post(`http://localhost:4000/api/complaints/upshift`, {
        id: complaint._id,
        upshiftReason: upshiftReason
      }, {
        withCredentials: true
      });
      setComplaint(prevComplaint => {
        if (!prevComplaint) return null;
        return {
          ...prevComplaint,
          upshiftReason: upshiftReason // Assuming 'upshiftReason' is a new field in Complaint type
        };
      });
      setUpshiftReason('');
      setRunEffect(!runEffect);
    } catch (err: any) {
      if (err.response.data.error !== undefined) {
        toast.error(err.response.data.error)
      } else {
        toast.error(err.response.data.message)
      }
      console.error('Error submitting upshift reason:', err);
    }
  };

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
            {complaint.upShiftReason && (
              <div className="mb-5 p-3 bg-green-50 rounded-md border-l-4 border-green-200">
                <p className="text-green-700 text-sm font-medium">UpShiftReason:</p>
                <p className="text-green-600 text-sm">{complaint.upShiftReason}</p>
              </div>
            )}
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

        {complaint.currentLevel === 'JE' && (<>
          <div className="p-6 border-t border-gray-200">
            <div className="max-w-4xl mx-auto">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Complaint Actions</h3>

              {/* Add Comment Form */}
              <div className="mb-6 p-4 border border-gray-200 rounded-md bg-gray-50">
                <h4 className="text-lg font-semibold text-gray-700 mb-3">Add a New Comment</h4>
                <form onSubmit={handleCommentSubmit} className="space-y-3">
                  <div>
                    <textarea
                      id="newComment"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      rows={3}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      placeholder="Add a new comment..."
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-200"
                  >
                    Add Comment
                  </button>
                </form>
              </div>

              {/* Solution Report Form - Conditional Rendering */}
              {complaint.status !== 'Closed' && !complaint.solutionReport && (
                <div className="mb-6 p-4 border border-green-200 rounded-md bg-green-50">
                  <h4 className="text-lg font-semibold text-green-800 mb-3">Report Solution</h4>
                  <form onSubmit={handleSolutionSubmit} className="space-y-3">
                    <div>
                      <textarea
                        id="newSolution"
                        value={newSolution}
                        onChange={(e) => setNewSolution(e.target.value)}
                        rows={4}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        placeholder="Write solution here..."
                      ></textarea>
                    </div>
                    <button
                      type="submit"
                      className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-200"
                    >
                      Report Solution
                    </button>
                  </form>
                </div>
              )}

              {/* Status Change Form - Conditional Rendering */}
              {complaint.status !== 'Closed' && (
                <div className="mb-6 p-4 border border-yellow-200 rounded-md bg-yellow-50">
                  <h4 className="text-lg font-semibold text-yellow-800 mb-3">Change Complaint Status</h4>
                  <form onSubmit={handleStatusChange} className="space-y-3">
                    <div>
                      <select
                        id="newStatus"
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value as Complaint['status'])}
                        className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      >
                        {['Pending', 'Assigned', 'visited', 'In-progress', 'Resolved', 'Closed'].map((statusOption) => (
                          <option key={statusOption} value={statusOption}>{statusOption}</option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="submit"
                      className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-200"
                    >
                      Change Status
                    </button>
                  </form>
                </div>
              )}

              {/* Lineman Assignment Form - Conditional Rendering */}
              {complaint.status !== 'Closed' && (
                <div className="mb-6 p-4 border border-purple-200 rounded-md bg-purple-50">
                  <h4 className="text-lg font-semibold text-purple-800 mb-3">Assign Lineman</h4>
                  <form onSubmit={handleLinemanAssignment} className="space-y-3">
                    <div>
                      <select
                        id="assignedLineman"
                        value={assignedLineman}
                        onChange={(e) => setAssignedLineman(e.target.value)}
                        className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      >
                        {/* Dummy Lineman Data */}
                        <option value="">Select Lineman</option>
                        {linemen.map((lineman) => (
                          <option key={lineman._id} value={lineman._id}>
                            {lineman._id}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="submit"
                      className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-200"
                    >
                      Assign Lineman
                    </button>
                  </form>
                </div>
              )}

              {/* Upshift Reason Form - Conditional Rendering */}
              {!complaint.upShiftReason && (
                <div className="mb-6 p-4 border border-orange-200 rounded-md bg-orange-50">
                  <h4 className="text-lg font-semibold text-orange-800 mb-3">Provide Upshift Reason</h4>
                  <form onSubmit={handleUpshiftSubmit} className="space-y-3">
                    <div>
                      <textarea
                        id="upshiftReason"
                        value={upshiftReason}
                        onChange={(e) => setUpshiftReason(e.target.value)}
                        rows={3}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        placeholder="Reason for upshifting..."
                      ></textarea>
                    </div>
                    <button
                      type="submit"
                      className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-200"
                    >
                      Submit Upshift Reason
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
          
        
        
        <div className="p-6 border-t border-gray-200 mt-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">Assets in 200m Radius</h3>
          <div className="mb-4">
            <label htmlFor="assetTypeFilter" className="block text-gray-700 text-sm font-bold mb-2">Filter by Asset Type:</label>
            <select
              id="assetTypeFilter"
              value={selectedAssetType}
              onChange={(e) => setSelectedAssetType(e.target.value)}
              className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="All">All Types</option>
              {/* You would dynamically load asset types from your backend */}
              {
                AssetType.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))
              }
            </select>
          </div>
          {complaint.latitude && complaint.longitude ? (
            <MapContainer
              center={[parseFloat(complaint.latitude), parseFloat(complaint.longitude)]}
              zoom={15}
              style={{ height: '500px', width: '100%' }}
              className="rounded-md shadow-md"
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />

              {mapAssets.map((asset) => {
                if (asset.geometry?.type === "Point") {
                  const [lng, lat] = asset.geometry.coordinates; // GeoJSON order is [lng, lat]
                  return (
                    <Marker
                      key={asset.id}
                      position={[lat, lng]}
                      icon={
                        new L.Icon({
                          iconUrl:
                            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
                          iconRetinaUrl:
                            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
                          shadowUrl:
                            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
                          iconSize: [25, 41],
                          iconAnchor: [12, 41],
                          popupAnchor: [1, -34],
                          shadowSize: [41, 41],
                        })
                      }
                    >
                      <Popup>
                        <div>
                          <strong>Type:</strong> {asset.type}
                          <br />
                          <strong>Category:</strong> {asset.category}
                          <br />
                          <strong>Status:</strong> {asset.status}
                        </div>
                      </Popup>
                    </Marker>
                  );
                } else if (asset.geometry?.type === "LineString") {
                  const latlngs = asset.geometry.coordinates.map(
                    ([lng, lat]: [number, number]) => [lat, lng] // swap order
                  );
                  return (
                    <Polyline key={asset.id} positions={latlngs} color="blue">
                      <Popup>
                        <div>
                          <strong>Type:</strong> {asset.type}
                          <br />
                          <strong>Category:</strong> {asset.category}
                          <br />
                          <strong>Status:</strong> {asset.status}
                        </div>
                      </Popup>
                    </Polyline>
                  );
                }
                return null;
              })}

              {/* Marker for the complaint location */}
              <Marker
                position={[
                  parseFloat(complaint.latitude),
                  parseFloat(complaint.longitude),
                ]}
                icon={
                  new L.Icon({
                    iconUrl:
                      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
                    shadowUrl:
                      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34],
                    shadowSize: [41, 41],
                  })
                }
              >
                <Popup>Complaint Location</Popup>
              </Marker>
            </MapContainer>
          ) : (

            <div className="text-center text-gray-600">Complaint location not available to display map.</div>
          )}
        </div> </>) }
      
      </div>
    </div>
  );
};

export default JeComplaint;
