import './App.css'
import Home from './Home.tsx'
import Test from './test.tsx'
import Test2 from './test2.tsx'
import Chat from './Chat.tsx'
import Login from './Login.tsx'
import ComplaintsPage from './ComplaintsPage.tsx'; // Import the new ComplaintsPage
import { createBrowserRouter,RouterProvider} from 'react-router-dom'
import { TranslationProvider } from './translationContext.tsx'
import LanguageSw from './components/ui/LanguageSwitcher.tsx'
import RegisterAsset from './RegisterAssest.tsx'






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
