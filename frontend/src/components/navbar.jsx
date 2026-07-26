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
      <li><Link to="/">Place Order</Link></li>
      <li>
  <button
    onClick={() => {

      const storedPhone =
        localStorage.getItem(
          'customerPhone'
        )

      if (storedPhone) {
        navigate('/cart')
      } else {
        navigate('/login')
      }

    }}
    style={{
      background: 'none',
      border: 'none',
      color: 'white',
      cursor: 'pointer',
      fontSize: '18px',
      fontWeight: 'bold',
      
      
    }}
  >
    My Orders
  </button>
</li>
{localStorage.getItem(
  'customerPhone'
) && (
  <li>
    <button
      onClick={() => {

        localStorage.removeItem(
          'customerPhone'
        )

        navigate('/')

      }}
      style={{
        background: 'none',
        border: 'none',
        color: '#e62121',
        cursor: 'pointer',
        fontSize: '16px'
      }}
    >
      Logout
    </button>
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