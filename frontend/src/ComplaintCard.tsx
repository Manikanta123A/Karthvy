
interface Complaint {
  id: string;
  image: string;
  description: string;
  status: 'Closed' | 'Pending' | 'Assigned' | 'Working';
  submittedDate: string;
  closedDate?: string; 
  personnelComment?: string; 
}

function ComplaintCard({complaint}: {complaint: Complaint}) {

    
  const getStatusColor = (status: Complaint['status']) => {
    switch (status) {
      case 'Closed':
        return 'bg-green-500';
      case 'Pending':
        return 'bg-yellow-500';
      case 'Assigned':
        return 'bg-blue-500';
      case 'Working':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  
    return (
        <div key={complaint.id} className="bg-gray-100 rounded-lg shadow-md p-5 flex flex-col md:flex-row items-start space-y-4 md:space-y-0 md:space-x-5">
              <div className="flex-shrink-0 w-full md:w-32 h-32 flex items-center justify-center bg-gray-200 rounded-md overflow-hidden">
                <img src={complaint.image} alt="Complaint" className="object-cover w-full h-full" />
              </div>
              <div className="flex-grow">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-gray-800 text-lg font-semibold flex-grow mr-4">{complaint.description}</p>
                  <span className={`px-3 py-1 text-sm font-semibold text-white rounded-full ${getStatusColor(complaint.status)}`}>
                    {complaint.status}
                  </span>
                </div>
                <p className="text-gray-500 text-sm mt-1">Submitted: {complaint.submittedDate}</p>
                {complaint.status === 'Closed' && complaint.closedDate && (
                  <p className="text-gray-500 text-sm">Closed: {complaint.closedDate}</p>
                )}
                {complaint.personnelComment && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-md border-l-4 border-blue-200">
                    <p className="text-blue-700 text-sm font-medium">Personnel Comment:</p>
                    <p className="text-blue-600 text-sm">{complaint.personnelComment}</p>
                  </div>
                )}
              </div>
            </div>
    )
}

export default ComplaintCard;