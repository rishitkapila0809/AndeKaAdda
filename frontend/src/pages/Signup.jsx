import { useState } from 'react'
import {
  useNavigate,
  useLocation
} from 'react-router-dom'

function Signup({
  apiUrl,
  showNotification
}) {

  const navigate = useNavigate()
  const location = useLocation()

  const [name, setName] = useState('')
  const [phoneNumber, setPhoneNumber] =
    useState('')
  const [blockName, setBlockName] =
    useState('')
  const [roomNumber, setRoomNumber] =
    useState('')

  const [loading, setLoading] =
    useState(false)

  const [error, setError] =
    useState('')

  const redirectTo =
    location.state?.redirectTo || '/'

  const handleSignup = async () => {

    const phoneRegex = /^[0-9]{10}$/

    if (
      !name.trim() ||
      !phoneRegex.test(phoneNumber) ||
      !blockName.trim() ||
      !roomNumber.trim()
    ) {
      setError('Please enter valid details')
      return
    }

    setLoading(true)
    setError('')

    try {

      const response = await fetch(
        `${apiUrl}/api/customers/signup`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name,
            phoneNumber,
            blockName,
            roomNumber
          })
        }
      )

      const data = await response.json()

      if (!data.success) {
        setError(data.message)
        return
      }

      localStorage.setItem(
  'customerPhone',
  data.customer.phoneNumber
)

showNotification(
  'Account created successfully',
  'success'
)

navigate(redirectTo)

    } catch (err) {

      console.log(err)

      setError(
        'Unable to create account. Please try again.'
      )

    } finally {

      setLoading(false)

    }
  }

  return (
    <div className="customer-login-page">

      <div className="customer-login-card">

        <h1>Create Account</h1>

        <p className="login-subtitle">
          Create your AndeKaAdda account
        </p>

        <label>Name</label>

        <input
          type="text"
          placeholder="Enter your name"
          value={name}
          onChange={(e) =>
            setName(e.target.value)
          }
        />

        <label className="signup-label">
          Phone Number
        </label>

        <input
          type="tel"
          inputMode="numeric"
          maxLength="10"
          placeholder="Enter your phone number"
          value={phoneNumber}
          onChange={(e) =>
            setPhoneNumber(
              e.target.value.replace(/\D/g, '')
            )
          }
        />

        <label className="signup-label">
          Block
        </label>

        <input
          type="text"
          placeholder="Enter block"
          value={blockName}
          onChange={(e) =>
            setBlockName(e.target.value)
          }
        />

        <label className="signup-label">
          Room Number
        </label>

        <input
          type="text"
          placeholder="Enter room number"
          value={roomNumber}
          onChange={(e) =>
            setRoomNumber(e.target.value)
          }
        />

        {error && (
          <p className="login-error">
            {error}
          </p>
        )}

        <button
          onClick={handleSignup}
          disabled={loading}
        >
          {
            loading
              ? 'Creating Account...'
              : 'Create Account'
          }
        </button>

        <p className="login-note">
          Already have an account?{' '}

          <span
            className="login-link"
            onClick={() =>
              navigate('/login', {
                state: { redirectTo }
              })
            }
          >
            Login
          </span>
        </p>

      </div>

    </div>
  )
}

export default Signup