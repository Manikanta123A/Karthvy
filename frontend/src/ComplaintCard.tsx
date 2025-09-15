import { Types } from 'mongoose';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
export interface Complaint {
  _id: string;
  kpin: string;
  Images?: string[];         // optional array of image URLs/strings
  problemReport: string;
  AssignedWorker?: Types.ObjectId; // ObjectId reference to Personnel
  solutionReport?: string;
  category: "Water" | "Electricity" | "Municipal" | "Query";
  urgencyLevel?: number;
  Affects?: "Individual" | "Locality" | "City";
  status: "Pending" | "Assigned" | "visited" | "In-progress" | "Upshift" | "Resolved" | "Closed";
  currentLevel?: "L1" | "JE" | "AEE" | "EE" | "CE";
  comments?: string[];
  rating?: number;  // min 1, max 5
  createdAt?: Date;
  upShiftReason?: string;
  closedAt?: Date;
  AssetId?: string[];
}

function ComplaintCard({ complaint }: { complaint: Complaint }) {

  const navigate = useNavigate();

  const getStatusColor = (status: Complaint['status']) => {
    switch (status) {
      case 'Closed':
        return 'bg-green-500';
      case 'Pending':
        return 'bg-yellow-500';
      case 'Assigned':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const [rating, setRating] = useState(complaint.rating || 0);
  const [ratingGiven, setRatingGiven] = useState(!!complaint.rating);
  const [hoverRating, setHoverRating] = useState(0);

  const stars = [1, 2, 3, 4, 5];

  const handleSubmit =async () => {
    if (rating > 0) {
      setRatingGiven(true);
      try{
        await  axios.post(`http://localhost:4000/api/complaints/submit-rating`, { 
          complaintId: complaint._id,
          rating: rating
         });
      }catch(err){
        console.error("Error submitting rating:", err);
      }
    } else {
      alert('Please select a rating before submitting');
    }
  };

  const handleClick = () => {
    navigate(`/complaints/${complaint._id}`);
  };


  return (
    <div key={complaint._id} className="bg-gray-100 rounded-lg shadow-md p-5 flex flex-col md:flex-row items-start space-y-4 md:space-y-0 md:space-x-5 cursor-pointer" onClick={handleClick}>
      <div className="flex-shrink-0 w-full md:w-32 h-32 flex items-center justify-center bg-gray-200 rounded-md overflow-hidden">
        <img src={complaint.Images?.[0]} alt="Complaint" className="object-cover w-full h-full" />
      </div>
      <div className="flex-grow">
        <div className="flex justify-between items-center mb-2">
          <p className="text-gray-800 text-lg font-semibold flex-grow mr-4">{complaint.problemReport}</p>
          <span className={`px-3 py-1 text-sm font-semibold text-white rounded-full ${getStatusColor(complaint.status)}`}>
            {complaint.status}
          </span>
        </div>
        <div className="text-gray-500 text-sm mt-2 space-y-1">
          <p>
            <strong>Complained At:</strong>{' '}
            {complaint.createdAt
              ? new Date(complaint.createdAt).toLocaleDateString() + ' ' + new Date(complaint.createdAt).toLocaleTimeString()
              : 'N/A'}
          </p>
          {complaint.status === 'Closed' && complaint.closedAt && (
            <p>
              <strong>Closed At:</strong>{' '}
              {complaint.closedAt
                ? new Date(complaint.closedAt).toLocaleDateString() + ' ' + new Date(complaint.closedAt).toLocaleTimeString()
                : 'N/A'}
            </p>
          )}
        </div>


        {complaint.comments && (complaint.closedAt == null) && (
          <div className="mt-4 p-3 bg-blue-50 rounded-md border-l-4 border-blue-200">
            <p className="text-blue-700 text-sm font-medium">Personnel Comment:</p>
            <p className="text-blue-600 text-sm">{complaint.comments[complaint.comments?.length - 1]}</p>
          </div>
        )}











        {complaint.closedAt && (
          <div className="mt-4">
            <p className="mb-1 font-semibold text-black">Your Rating:</p>
            
            {!ratingGiven ? (
              <>
              <p className="text-gray-700 text-sm">Please select a rating before submitting.</p>
              <div className="flex items-center space-x-2">
                {stars.map((star) => (
                  <svg
                    key={star}
                    onClick={(e) => {
                      e.stopPropagation();
                      setRating(star);
                    }}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-8 w-8 cursor-pointer ${(hoverRating || rating) >= star ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.974a1 1 0 00.95.69h4.18c.969 0 1.371 1.24.588 1.81l-3.386 2.462a1 1 0 00-.364 1.118l1.287 3.974c.3.921-.755 1.688-1.54 1.118L10 13.347l-3.386 2.462c-.784.57-1.838-.197-1.539-1.118l1.287-3.974a1 1 0 00-.364-1.118L3.612 9.4c-.783-.57-.38-1.81.588-1.81h4.18a1 1 0 00.95-.69l1.286-3.974z" />
                  </svg>
                ))}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSubmit();
                  }}
                  className="ml-4 bg-blue-900 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                  disabled={rating === 0}
                >
                  Submit
                </button>
              </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                {stars.map((star) => (
                  <svg
                    key={star}
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-8 w-8 ${rating >= star ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.974a1 1 0 00.95.69h4.18c.969 0 1.371 1.24.588 1.81l-3.386 2.462a1 1 0 00-.364 1.118l1.287 3.974c.3.921-.755 1.688-1.54 1.118L10 13.347l-3.386 2.462c-.784.57-1.838-.197-1.539-1.118l1.287-3.974a1 1 0 00-.364-1.118L3.612 9.4c-.783-.57-.38-1.81.588-1.81h4.18a1 1 0 00.95-.69l1.286-3.974z" />
                  </svg>
                ))}
                <span className="ml-2 text-yellow-600 font-semibold">
                  {rating} star{rating > 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>
        )}
    </div>
    </div >
  )
}

export default ComplaintCard;