import {
  Link,
  useNavigate,
  useLocation
} from 'react-router-dom'
import { useState } from 'react'

function Navbar({ isAdminLoggedIn, onAdminLogout }) {
  const navigate = useNavigate()

  const [tapCount, setTapCount] =useState(0)
  const location = useLocation()
  const [adminMenuOpen, setAdminMenuOpen] = useState(false)
  const [customerMenuOpen, setCustomerMenuOpen] = useState(false)
  const isCustomerLoggedIn =
  !!localStorage.getItem('customerPhone')

const handleLogoTap = () => {
  const updatedCount = tapCount + 1

  if (updatedCount === 7) {
    setTapCount(0)

    navigate('/admin')

    return
  }

  setTapCount(updatedCount)

  setTimeout(() => {
    setTapCount(0)
  }, 2000)
}


  return (
<nav className="navbar">
  <div className="brand-logo">
    <img
      src="/logo.png"
      alt="AndeKaAdda"
      className="full-logo"
      onClick={handleLogoTap}
    />
  </div>

      <ul>
{!isAdminLoggedIn &&
  location.pathname !== '/admin' && (
  <>
    <li>
      <Link to="/">
        Place Order
      </Link>
    </li>

{!isCustomerLoggedIn ? (

  <li>
    <button
      className="customer-login-btn"
      onClick={() => {
        navigate('/login')
      }}
    >
      Login / Sign Up
    </button>
  </li>

) : (

  <li className="customer-menu-wrapper">

    <button
      className="customer-menu-btn"
      onClick={() =>
        setCustomerMenuOpen(
          !customerMenuOpen
        )
      }
    >
      ☰
    </button>

    {customerMenuOpen && (

      <div className="customer-dropdown">

        <button
          onClick={() => {
            setCustomerMenuOpen(false)
            navigate('/profile')
          }}
        >
          Profile
        </button>

        <button
          onClick={() => {
            setCustomerMenuOpen(false)
            navigate('/cart')
          }}
        >
          My Orders
        </button>

        <button
          onClick={() => {
            setCustomerMenuOpen(false)
            navigate('/schedule')
          }}
        >
          My Schedule
        </button>

        <button
          onClick={() => {
            setCustomerMenuOpen(false)
            navigate('/subscriptions')
          }}
        >
          Subscriptions
        </button>

        <button
          className="customer-dropdown-logout"
          onClick={() => {

            localStorage.removeItem(
              'customerPhone'
            )

            setCustomerMenuOpen(false)

            navigate('/')

          }}
        >
          Logout
        </button>

      </div>

    )}

  </li>

)}
  </>
)}


  {isAdminLoggedIn && (
  <>
    <li>
      <Link to="/admin">
        Dashboard
      </Link>
    </li>

    <li className="admin-menu-wrapper">

      <button
        className="admin-menu-btn"
        onClick={() =>
          setAdminMenuOpen(
            !adminMenuOpen
          )
        }
      >
        ☰
      </button>

      {adminMenuOpen && (
        <div className="admin-dropdown">


                    <Link
  to="/admin/schedules"
  onClick={() =>
    setAdminMenuOpen(false)
  }
>
  Schedules
</Link>

          <Link
            to="/sales"
            onClick={() =>
              setAdminMenuOpen(false)
            }
          >
            Sales
          </Link>



          <Link
            to="/settings"
            onClick={() =>
              setAdminMenuOpen(false)
            }
          >
            Settings
          </Link>

          <button
            className="admin-dropdown-logout"
            onClick={() => {

              setAdminMenuOpen(false)

              onAdminLogout()

              navigate('/')

            }}
          >
            Logout
          </button>

        </div>
      )}

    </li>
  </>
)}
</ul>

      
    </nav>
  )
}

export default Navbar