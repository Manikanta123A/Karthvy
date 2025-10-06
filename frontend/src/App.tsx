import './App.css'
import Test from './test.tsx'
import Chat from './Users/Chat.tsx'
import Login from './Login.tsx'
import ComplaintsPage from './Users/ComplaintsPage.tsx'; 
import Complaints from './Users/Complaint.tsx';
import { createBrowserRouter,RouterProvider} from 'react-router-dom'
import { TranslationProvider } from './translationContext.tsx'
import RegisterAsset from './lineman/RegisterAssest.tsx'
import { Toaster } from "react-hot-toast";
import JeAllComplaints from './je/jeAllComplaints.tsx';
import JeComplaint from './je/jeComplaint.tsx';
import ProtectedRoute from './ProtectedRoute.tsx';
import TypeSubtypeSelection from './TypeSubtypeSelection.tsx'
import LinemanAllComplaints from './lineman/complaintsPage.tsx';
import LinemanComplaint from './lineman/Complaints.tsx';
import AeeAllComplaints from './AEE/AeeAllComplaints.tsx';
import AeeComplaint from './AEE/AeeComplaint.tsx';
import AeeSpecificComplaints from './AEE/AEESpecificComplaint.tsx';


const router = createBrowserRouter([
  {
    path:'/',
    element:(
    <ProtectedRoute allowedRoles={['user']}>
      <Test/>
    </ProtectedRoute>
    )
  },{
    path:'/chat',
    element:(
    <ProtectedRoute allowedRoles={['user']}>
      <Chat/>
      </ProtectedRoute>)
  },{
    path:'/login',
    element:<Login/>
  },
  {
    path:'/complaints',
    element:(
    <ProtectedRoute allowedRoles={['user']}>
      <ComplaintsPage/>
    </ProtectedRoute>
    )
  },{
    path:'/complaints/:id',
    element:(
    <ProtectedRoute allowedRoles={['user']}>
      <Complaints/>
    </ProtectedRoute>
    )
  },{
    path:"/asses",
    element:(
    <ProtectedRoute allowedRoles={['JE']}>
      <RegisterAsset/>
    </ProtectedRoute>
    )
  },{
    path:"/jeall",
    element:(
    <ProtectedRoute>
        <JeAllComplaints/>
    </ProtectedRoute>
      )
  },{
    path:"/je/complaints/:id",
    element:(
    <ProtectedRoute allowedRoles={['JE']}>
      <JeComplaint/>
    </ProtectedRoute>
    )
  },{
    path:'/select-type-subtype',
    element:(
    <ProtectedRoute allowedRoles={['user']}>
      <TypeSubtypeSelection/>
    </ProtectedRoute>
    )
  },{
    path:'/linemanall',
    element:(
    <ProtectedRoute allowedRoles={['lineman']}>
      <LinemanAllComplaints/>
    </ProtectedRoute>
    )
  },{
    path:'/lineman/complaints/:id',
    element:(
    <ProtectedRoute allowedRoles={['lineman']}>
      <LinemanComplaint/>
    </ProtectedRoute>
    )
  },{
    path:'/AeeAll',
    element:(
    <ProtectedRoute allowedRoles={['AEE']}>
      <AeeAllComplaints/>
    </ProtectedRoute>
    )
  },{
    path:'/Aeespecific',
    element:(
    <ProtectedRoute allowedRoles={['AEE']}>
      <AeeSpecificComplaints/>
    </ProtectedRoute>
    )
  },{
    path:'/Aee/complaints/:id',
    element:(
    <ProtectedRoute allowedRoles={['AEE']}>
      <AeeComplaint/>
    </ProtectedRoute>
    )
  }
]
)
function App() {

  return (
    <>
    <TranslationProvider>
      <main className="flex flex-col min-h-screen">
      
      <RouterProvider router={router} >
      </RouterProvider>
      </main>
    </TranslationProvider>
    <Toaster   position="top-center"  
        reverseOrder={false} />
    </>
     
  )
}

export default App
