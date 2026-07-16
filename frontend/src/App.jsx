import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation
} from 'react-router-dom'
import { useState, useEffect } from 'react'
import Navbar from './components/navbar'
import Home from './pages/Home'
import Admin from './pages/Admin'
import Cart from './pages/Cart'
import OrderSuccess from './pages/OrderSuccess'
import CustomerLogin from './pages/CustomerLogin'
import Sales from './pages/Sales'
import './App.css'
import Maintenance from './pages/Maintenance'
import socket from './socket'
import Checkout from './pages/Checkout'
import AnnouncementPopup from './components/AnnouncementPopup'

const API_URL = import.meta.env.VITE_API_URL

function AppRoutes({
  isAdminLoggedIn,
  handleAdminLogout,
  setIsAdminLoggedIn,
  isMaintenanceEnabled
}) {

  const location = useLocation()

const isAdminPage =
  location.pathname.startsWith('/admin') ||
  location.pathname.startsWith('/sales')

  const showMaintenance =
    isMaintenanceEnabled &&
    !isAdminPage

    console.log({
  isMaintenanceEnabled,
  isAdminPage,
  showMaintenance
})

  if (showMaintenance) {
    return <Maintenance />
  }

  return (
    <>

      <Navbar
        isAdminLoggedIn={isAdminLoggedIn}
        onAdminLogout={handleAdminLogout}
      />

      <Routes>

        <Route
          path="/"
          element={<Home apiUrl={API_URL} />}
        />

        <Route
          path="/admin"
          element={
            <Admin
              isAdminLoggedIn={isAdminLoggedIn}
              onAdminLogin={setIsAdminLoggedIn}
              onAdminLogout={handleAdminLogout}
              apiUrl={API_URL}
            />
          }
        />

        <Route
  path="/checkout"
  element={<Checkout apiUrl={API_URL} />}
/>

        <Route
          path="/cart"
          element={<Cart apiUrl={API_URL} />}
        />

        <Route
          path="/success"
          element={<OrderSuccess />}
        />

        <Route
          path="/login"
          element={<CustomerLogin />}
        />

        <Route
          path="/maintenance"
          element={<Maintenance />}
        />

        <Route
          path="/sales"
          element={
            isAdminLoggedIn
              ? (
                <Sales apiUrl={API_URL} />
              )
              : (
                <Admin
                  isAdminLoggedIn={isAdminLoggedIn}
                  onAdminLogin={setIsAdminLoggedIn}
                  onAdminLogout={handleAdminLogout}
                  apiUrl={API_URL}
                />
              )
          }
        />

      </Routes>

    </>
  )

}



function App() {

const [showSplash, setShowSplash] =
  useState(true)

  const [
  showAnnouncement,
  setShowAnnouncement
] = useState(false)

useEffect(() => {
  const timer = setTimeout(() => {
    setShowSplash(false)
  }, 2500)

  return () => clearTimeout(timer)
}, [])

useEffect(() => {

  const version = 'v1'

  const seenVersion =
    localStorage.getItem(
      'announcementVersion'
    )

  if (seenVersion !== version) {

    setShowAnnouncement(true)

  }

}, [])

const closeAnnouncement = () => {

  localStorage.setItem(
    'announcementVersion',
    'v1'
  )

  setShowAnnouncement(false)

}



  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false)
  const [
  isMaintenanceEnabled,
  setIsMaintenanceEnabled
] = useState(false)

  useEffect(() => {
    // Check if admin is already logged in (from localStorage)
    const adminAuth = localStorage.getItem('adminAuth')
    if (adminAuth === 'true') {
      setIsAdminLoggedIn(true)
    }
  }, [])


  const loadMaintenance = async () => {

  try {

    const response = await fetch(
      `${API_URL}/api/orders/maintenance-status`
    )

    const data = await response.json()

    if (data.success) {

      setIsMaintenanceEnabled(
        data.isMaintenanceEnabled
      )

    }

  } catch (err) {

    console.log(err)

  }

}

useEffect(() => {

  loadMaintenance()

  const handleSettingsUpdate = () => {

    loadMaintenance()

  }

  socket.on(
    'settingsUpdated',
    handleSettingsUpdate
  )

  return () => {

    socket.off(
      'settingsUpdated',
      handleSettingsUpdate
    )

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
    <>
  <Router>

    <AppRoutes
      isAdminLoggedIn={isAdminLoggedIn}
      handleAdminLogout={handleAdminLogout}
      setIsAdminLoggedIn={setIsAdminLoggedIn}
      isMaintenanceEnabled={isMaintenanceEnabled}
    />

  {showAnnouncement && (
  <AnnouncementPopup
    onClose={closeAnnouncement}
  />
)}

</Router>

</>

)
}

export default App