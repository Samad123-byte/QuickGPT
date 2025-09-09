import React, { useState } from 'react'
import Sidebar from './components/Sidebar'
import { Route, Routes, useLocation } from 'react-router-dom'
import ChatBox from './components/ChatBox'
import Credits from './pages/Credits'
import Community from './pages/Community'
import { assets } from './assets/assets'
import './assets/prism.css'
import Loading from './pages/Loading'
import { useAppContext } from './context/AppContext'
import Login from './pages/Login'
import {Toaster} from'react-hot-toast'

const App = () => {
const [isMenuOpen, setIsMenuOpen] = useState(false)
const {pathname} = useLocation()

const {user, loadingUser, theme} = useAppContext()

if(pathname === '/loading' || loadingUser) return <Loading/>

  return (
    <>
    <Toaster/>
    {!isMenuOpen && <img src={assets.menu_icon} className='absolute top-3 left-3 w-8 h-8 cursor-pointer md:hidden not-dark:invert z-50'
    onClick={()=>setIsMenuOpen(true)}/>}

{user ? (
 <div className='min-h-screen bg-gray-50 dark:bg-gradient-to-br dark:from-[#1a1625] dark:via-[#2d1b42] dark:to-[#241832] dark:text-white'>
  <div className= "flex h-screen w-screen">
      <Sidebar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen}/>
      <Routes>
        <Route path='/' element={<ChatBox/>} />
          <Route path='/credits' element={<Credits/>} />
           <Route path='/community' element={<Community/>} />
    
      </Routes>
    </div>
    </div>
) : (
  <div className='min-h-screen bg-gray-50 dark:bg-gradient-to-br dark:from-[#1a1625] dark:via-[#2d1b42] dark:to-[#241832] flex items-center justify-center h-screen w-screen'>
    <Login/>
  </div>
)}

   
    </>

  )
}

export default App