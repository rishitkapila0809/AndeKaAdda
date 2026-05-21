import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function CustomerLogin() {

  const [phoneNumber, setPhoneNumber] =
    useState('')

  const navigate = useNavigate()

  const handleLogin = () => {

    const phoneRegex = /^[0-9]{10}$/

    if (!phoneRegex.test(phoneNumber)) {
      alert('Enter valid phone number')
      return
    }

    localStorage.setItem(
      'customerPhone',
      phoneNumber
    )

    alert('Welcome back 👋')

    navigate('/cart')
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0f172a'
      }}
    >
      <div
        style={{
          backgroundColor: '#1e293b',
          padding: '40px',
          borderRadius: '16px',
          width: '350px',
          textAlign: 'center'
        }}
      >
        <h1
          style={{
            color: '#f59e0b',
            marginBottom: '20px'
          }}
        >
          📦 My Orders Login
        </h1>

        <input
          type="tel"
          placeholder="Enter Phone Number"
          value={phoneNumber}
          onChange={(e) =>
            setPhoneNumber(e.target.value)
          }
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: '10px',
            border: 'none',
            marginBottom: '20px',
            fontSize: '16px'
          }}
        />

        <button
          onClick={handleLogin}
          style={{
            width: '100%',
            padding: '14px',
            backgroundColor: '#f59e0b',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            fontSize: '18px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          View My Orders
        </button>
      </div>
    </div>
  )
}

export default CustomerLogin