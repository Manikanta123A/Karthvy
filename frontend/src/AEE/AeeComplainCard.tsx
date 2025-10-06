import React from 'react';
import { useNavigate } from 'react-router-dom';

export type Complaint = {
  _id: string;
  kpin?: string;
  Images?: string[];
  problemReport:string,
  Problem: string;
  SubProblem: string;
  AssignedWorker?: string; 
  solutionReport?: string;
  category: "Water" | "Electricity" | "Municipal" | "Query";
  urgencyLevel?: number;
  Affects?: "Individual" | "Locality" | "City";
  status: "Pending" | "Assigned" | "visited" | "In-progress" | "Upshift" | "Resolved" | "Closed";
  currentLevel?: "L1" | "JE" | "AEE" | "EE" | "CE";
  comments?: string[];
  latitude:string;
  longitude:string;
  rating?: number;
  createdAt?: Date;
  upShiftReason?: string;
  closedAt?: Date;
  AssetId?: string[];
};

interface JeCardProps {
  complaint: Complaint;
}

const JeCard: React.FC<JeCardProps> = ({ complaint }) => {
  const navigate = useNavigate();

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

  const handleClick = () => {
    navigate(`/Aee/complaints/${complaint._id}`);
  };

  return (
    <div key={complaint._id} className="bg-gray-100 rounded-lg shadow-md p-5 flex flex-col md:flex-row items-start space-y-4 md:space-y-0 md:space-x-5 cursor-pointer" onClick={handleClick}>
      <div className="flex-shrink-0 w-full md:w-32 h-32 flex items-center justify-center bg-gray-200 rounded-md overflow-hidden">
        {complaint.Images && complaint.Images.length > 0 ? (
          <img src={complaint.Images[0]} alt="Complaint" className="object-cover w-full h-full" />
        ) : (
          <div className="text-gray-500">No Image</div>
        )}
      </div>
      <div className="flex-grow">
        <div className="flex justify-between items-center mb-2">
          <p className="text-gray-800 text-lg font-semibold flex-grow mr-4">{complaint.Problem} - {complaint.SubProblem}</p>
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
        {complaint.comments && complaint.comments.length > 0 && (complaint.closedAt == null) && (
          <div className="mt-4 p-3 bg-blue-50 rounded-md border-l-4 border-blue-200">
            <p className="text-blue-700 text-sm font-medium">Personnel Comment:</p>
            <p className="text-blue-600 text-sm">{complaint.comments[complaint.comments.length - 1]}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default JeCard;
