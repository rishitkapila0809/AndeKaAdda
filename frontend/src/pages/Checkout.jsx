import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

function Checkout({ apiUrl }) {

  const location = useLocation()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
const [error, setError] = useState('')
const [saltSachets, setSaltSachets] = useState(
  location.state?.saltSachets || 0
)

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

  const saltTotal = saltSachets * 1

const finalGrandTotal =
  Number(grandTotal || 0) + saltTotal

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
  saltSachets,
  totalAmount: finalGrandTotal
})
      }
    )

    const data = await response.json()

    if (data.success) {

      localStorage.setItem(
  'customerPhone',
  phoneNumber
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

        <div className="seasoning-divider"></div>

<div className="checkout-seasonings">

  <div className="seasoning-heading">
    <div>
      <h3>Seasonings</h3>
      <p>Add some extra flavour to your eggs</p>
    </div>
  </div>

  <div className="seasoning-item seasoning-available">

    <div className="seasoning-info">
      <strong>Salt </strong>
      <span>₹1 per sachet</span>
    </div>

    <div className="seasoning-counter">

      <button
        type="button"
        onClick={() =>
          setSaltSachets(prev =>
            Math.max(0, prev - 1)
          )
        }
        disabled={saltSachets === 0}
      >
        −
      </button>

      <span>{saltSachets}</span>

      <button
        type="button"
        onClick={() =>
          setSaltSachets(prev => prev + 1)
        }
      >
        +
      </button>

    </div>

  </div>


  <div className="seasoning-item seasoning-coming-soon">

    <div className="seasoning-info">
      <strong>Peri Peri Masala</strong>
      <span>Spicy seasoning</span>
    </div>

    <span className="coming-soon-badge">
      COMING SOON
    </span>

  </div>


  <div className="seasoning-item seasoning-coming-soon">

    <div className="seasoning-info">
      <strong>Chaat Masala</strong>
      <span>Chatpata seasoning</span>
    </div>

    <span className="coming-soon-badge">
      COMING SOON
    </span>

  </div>

</div>

{saltSachets > 0 && (
  <div className="summary-row">
    <span>
      Salt Sachets ({saltSachets})
    </span>

    <span>
      ₹{saltTotal}
    </span>
  </div>
)}

        <div className="summary-row grand-total">
          <span>Grand Total</span>
          <span>₹{finalGrandTotal}</span>
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