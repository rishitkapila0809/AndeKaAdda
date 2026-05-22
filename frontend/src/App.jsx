import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Navbar from './components/navbar'
import Home from './pages/Home'
import Admin from './pages/Admin'
import Cart from './pages/Cart'
import OrderSuccess from './pages/OrderSuccess'
import CustomerLogin from './pages/CustomerLogin'
import Sales from './pages/Sales'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL



function App() {

const [showSplash, setShowSplash] =
  useState(true)

useEffect(() => {
  const timer = setTimeout(() => {
    setShowSplash(false)
  }, 2500)

  return () => clearTimeout(timer)
}, [])



  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false)

  useEffect(() => {
    // Check if admin is already logged in (from localStorage)
    const adminAuth = localStorage.getItem('adminAuth')
    if (adminAuth === 'true') {
      setIsAdminLoggedIn(true)
    }
  }, [])

  const handleAdminLogout = () => {
    localStorage.removeItem('adminAuth')
    setIsAdminLoggedIn(false)
  }

  if (showSplash) {
  return (
    <div className="splash-screen">
      <img
        src="/logo.png"
        alt="AndeKaAdda"
        className="splash-logo"
      />
    </div>
  )
}

  return (
    <Router>
      <Navbar isAdminLoggedIn={isAdminLoggedIn} onAdminLogout={handleAdminLogout} />
      <Routes>
        <Route path="/" element={<Home apiUrl={API_URL} />} />
        <Route 
          path="/admin" 
          element={<Admin isAdminLoggedIn={isAdminLoggedIn} onAdminLogin={setIsAdminLoggedIn} onAdminLogout={handleAdminLogout} apiUrl={API_URL} />} 
        />
        <Route path="/cart" element={<Cart apiUrl={API_URL} />} />
        <Route path="/success" element={<OrderSuccess />} />
        <Route path="/login" element={<CustomerLogin />}/>
        <Route
  path="/sales"
  element={
    isAdminLoggedIn ? (
      <Sales apiUrl={API_URL} />
    ) : (
      <Admin
        isAdminLoggedIn={
          isAdminLoggedIn
        }
        onAdminLogin={
          setIsAdminLoggedIn
        }
        onAdminLogout={
          handleAdminLogout
        }
        apiUrl={API_URL}
      />
    )
  }
/>


      </Routes>
    </Router>
  )
}

export default App