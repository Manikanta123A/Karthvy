import './App.css'
import Test from './test.tsx'
import Chat from './Users/Chat.tsx'
import Login from './Login.tsx'
import ComplaintsPage from './Users/ComplaintsPage.tsx'; 
import Complaints from './Users/Complaint.tsx';
import { createBrowserRouter,RouterProvider} from 'react-router-dom'
import { TranslationProvider } from './translationContext.tsx'
import LanguageSw from './components/ui/LanguageSwitcher.tsx'
import RegisterAsset from './lineman/RegisterAssest.tsx'






const router = createBrowserRouter([
  {
    path:'/',
    element:<Test/>
  },{
    path:'/chat',
    element:<Chat/>
  },{
    path:'/login',
    element:<Login/>
  },
  {
    path:'/complaints',
    element:<ComplaintsPage/>
  },{
    path:'/complaints/:id',
    element:<Complaints/>
  },{
    path:"/asses",
    element:<RegisterAsset/>
  }
]
)
function App() {

  return (
    <TranslationProvider>
      <main className="flex flex-col min-h-screen">
      <LanguageSw />
      <RouterProvider router={router} >
      </RouterProvider>
      </main>
    </TranslationProvider>
     
  )
}

export default App
