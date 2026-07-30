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
import Settings from './pages/Settings'
import Profile from './pages/Profile'
import Signup from './pages/Signup'
import NotificationBanner from './components/NotificationBanner'
import MySchedule from './pages/MySchedule'
import Subscriptions from './pages/Subscriptions'
import AdminSchedules from './pages/AdminSchedules'

const API_URL = import.meta.env.VITE_API_URL

function AppRoutes({
  isAdminLoggedIn,
  handleAdminLogout,
  setIsAdminLoggedIn,
  isMaintenanceEnabled,
  showNotification
})  {

  const location = useLocation()

const isAdminPage =
  location.pathname.startsWith('/admin') ||
  location.pathname.startsWith('/sales') ||
  location.pathname.startsWith('/settings')

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
  element={
    <CustomerLogin
      apiUrl={API_URL}
      showNotification={showNotification}
    />
  }
/>
<Route
  path="/profile"
  element={
    <Profile
      apiUrl={API_URL}
      showNotification={showNotification}
    />
  }
/>  

<Route
  path="/schedule"
  element={
    <MySchedule
      apiUrl={API_URL}
    />
  }
/>

<Route
  path="/subscriptions"
  element={<Subscriptions />}
/>

<Route
  path="/signup"
  element={
    <Signup
      apiUrl={API_URL}
      showNotification={showNotification}
    />
  }
/>
        <Route
          path="/maintenance"
          element={<Maintenance />}
        />

<Route
  path="/admin/schedules"
  element={
    isAdminLoggedIn
      ? (
        <AdminSchedules
          apiUrl={API_URL}
        />
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

              <Route
  path="/settings"
  element={
    isAdminLoggedIn
      ? (
        <Settings apiUrl={API_URL} />
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

  const [notification, setNotification] =
  useState({
    message: '',
    type: 'success'
  })

  const showNotification = (
  message,
  type = 'success'
) => {

  setNotification({
    message,
    type
  })

  setTimeout(() => {

    setNotification({
      message: '',
      type: 'success'
    })

  }, 3000)

}

const [showSplash, setShowSplash] =
  useState(true)

  useEffect(() => {

  const timer = setTimeout(() => {

    setShowSplash(false)

  }, 2500)

  return () => clearTimeout(timer)

}, [])

  const [
  showAnnouncement,
  setShowAnnouncement
] = useState(false)

useEffect(() => {

  const version = 'seasonings-v1'

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
    'seasonings-v1'
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


useEffect(() => {

  let lastActivity = Date.now()

  const updateActivity = () => {

    lastActivity = Date.now()

  }

  const events = [
    'click',
    'keydown',
    'mousemove',
    'touchstart',
    'scroll'
  ]

  events.forEach(event =>
    window.addEventListener(
      event,
      updateActivity
    )
  )

  const refreshTime = setTimeout(() => {

    const fiveMinutes =
      5 * 60 * 1000

    const checkIdle = () => {

      if (
        Date.now() - lastActivity >= fiveMinutes
      ) {

        window.location.reload()

      } else {

        setTimeout(
          checkIdle,
          60000
        )

      }

    }

    checkIdle()

  }, 60 * 60 * 1000)

  return () => {

    clearTimeout(refreshTime)

    events.forEach(event =>
      window.removeEventListener(
        event,
        updateActivity
      )
    )

  }

}, [])

useEffect(() => {

  let hiddenAt = null

  const handleVisibilityChange = () => {

    if (document.visibilityState === 'hidden') {

      hiddenAt = Date.now()

    }

    if (
      document.visibilityState === 'visible' &&
      hiddenAt
    ) {

      const timeAway =
        Date.now() - hiddenAt

      const fiveMinutes =
        5 * 60 * 1000

      if (timeAway >= fiveMinutes) {

        window.location.reload()

      }

      hiddenAt = null
    }

  }

  document.addEventListener(
    'visibilitychange',
    handleVisibilityChange
  )

  return () => {

    document.removeEventListener(
      'visibilitychange',
      handleVisibilityChange
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

  <NotificationBanner
    message={notification.message}
    type={notification.type}
  />

  <AppRoutes
  isAdminLoggedIn={isAdminLoggedIn}
  handleAdminLogout={handleAdminLogout}
  setIsAdminLoggedIn={setIsAdminLoggedIn}
  isMaintenanceEnabled={isMaintenanceEnabled}
  showNotification={showNotification}
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