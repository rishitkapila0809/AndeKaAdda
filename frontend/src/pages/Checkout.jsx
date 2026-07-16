import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

function Checkout({ apiUrl }) {

  const location = useLocation()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
const [error, setError] = useState('')

  const {
    buyerName,
    phoneNumber,
    block,
    roomNumber,
    eggQuantity,
    bhurjiQuantity,
    boiledEggTotal,
    bhurjiTotal,
    grandTotal
  } = location.state || {}

  if (!location.state) {
    navigate('/')
    return null
  }

  const handlePlaceOrder = async () => {

  setLoading(true)
  setError('')

  try {

    const response = await fetch(
      `${apiUrl}/api/orders/create`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          buyerName,
          phoneNumber,
          block,
          roomNumber,
          boiledEggs: eggQuantity,
          eggBhurji: bhurjiQuantity,
          totalAmount: grandTotal
        })
      }
    )

    const data = await response.json()

    if (data.success) {

      localStorage.setItem(
        'customerPhone',
        phoneNumber
      )

      localStorage.setItem(
        'customerName',
        buyerName
      )

      localStorage.setItem(
        'customerBlock',
        block
      )

      localStorage.setItem(
        'customerRoom',
        roomNumber
      )

      navigate('/success')

    } else {

      setError(
        '❌ Failed to place order: ' +
        data.message
      )

    }

  } catch (err) {

    setError(
      '❌ Connection error'
    )

    console.log(err)

  } finally {

    setLoading(false)

  }

}

  return (
    <div className="home-container">

        {error && (
  <div className="error-message">
    {error}
  </div>
)}

      <h1>Order Summary</h1>

      

      <div className="order-summary">

        <h2>Order Summary</h2>

        <div className="summary-row">
          <span>Boiled Eggs ({eggQuantity})</span>
          <span>₹{boiledEggTotal}</span>
        </div>

        <div className="summary-row">
          <span>Egg Bhurji ({bhurjiQuantity})</span>
          <span>₹{bhurjiTotal}</span>
        </div>

        <div className="summary-row grand-total">
          <span>Grand Total</span>
          <span>₹{grandTotal}</span>
        </div>

      </div>

      

      <button
  className="place-order-btn"
  onClick={handlePlaceOrder}
  disabled={loading}
>
  {loading
    ? 'Processing...'
    : 'Place Order'}
</button>

<button
  onClick={() => navigate(-1)}
  style={{
    background: 'transparent',
    border: 'none',
    color: '#f59e0b',
    fontSize: '18px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginBottom: '20px'
  }}
>
  ← Go Back
</button>



    </div>
  )

}

export default Checkout