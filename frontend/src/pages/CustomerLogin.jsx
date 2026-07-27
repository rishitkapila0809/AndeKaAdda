import { useState } from 'react'
import {
  useNavigate,
  useLocation
} from 'react-router-dom'

function CustomerLogin({
  apiUrl,
  showNotification
}) {

  const [phoneNumber, setPhoneNumber] =
    useState('')

  const [loading, setLoading] =
    useState(false)

  const [error, setError] =
    useState('')

  const navigate = useNavigate()
  const location = useLocation()

  const redirectTo =
    location.state?.redirectTo || '/'

  const handleLogin = async () => {

    const phoneRegex = /^[0-9]{10}$/

    if (!phoneRegex.test(phoneNumber)) {
      setError(
        'Enter a valid 10-digit phone number'
      )
      return
    }

    setLoading(true)
    setError('')

    try {

      const response = await fetch(
        `${apiUrl}/api/customers/${phoneNumber}`
      )

      const data = await response.json()

      if (!data.success) {

        setError(
          'No account found with this phone number'
        )

        return
      }

      localStorage.setItem(
        'customerPhone',
        data.customer.phoneNumber
      )

      showNotification(
  'Logged in successfully',
  'success'
)

      navigate(redirectTo)

    } catch (err) {

      console.log(err)

      setError(
        'Unable to login. Please try again.'
      )

    } finally {

      setLoading(false)

    }

  }


  return (
    <div className="customer-login-page">

      <div className="customer-login-card">

        <h1>Welcome Back</h1>

        <p className="login-subtitle">
          Login to your AndeKaAdda account
        </p>

        <label>
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
              e.target.value.replace(
                /\D/g,
                ''
              )
            )
          }
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleLogin()
            }
          }}
        />

        {error && (
          <p className="login-error">
            {error}
          </p>
        )}

        <button
          onClick={handleLogin}
          disabled={loading}
        >
          {
            loading
              ? 'Checking...'
              : 'Continue'
          }
        </button>

        <p className="login-note">
  New user or can't find your account?{' '}

  <span
    className="login-link"
    onClick={() =>
      navigate('/signup', {
        state: { redirectTo }
      })
    }
  >
    Create Account
  </span>
</p>
      </div>

    </div>
  )
}

export default CustomerLogin