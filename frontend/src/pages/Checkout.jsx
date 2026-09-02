import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import cokeZeroImage from '../assets/cokezero.png'
import saltImage from '../assets/salt.png'

function Checkout({ apiUrl }) {

  const location = useLocation()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
const [error, setError] = useState('')
const [saltSachets, setSaltSachets] = useState(
  location.state?.saltSachets || 0
)
const [cokeZero, setCokeZero] = useState(0)
const [showCokePopup, setShowCokePopup] = useState(true)
const [cokeAdded, setCokeAdded] = useState(false)

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
const cokeTotal = cokeZero * 20

const finalGrandTotal =
  Number(grandTotal || 0) +
  saltTotal +
  cokeTotal

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
  cokeZero,
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
      <h3>Add Ons </h3>
      <p>Add something extra to your order</p>
    </div>
  </div>

 <div className="seasoning-item seasoning-available">
  <img
    src={saltImage}
    alt="Salt sachet"
    className="salt-image"
  />

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

  <div className="seasoning-item seasoning-available coke-item">
  <img
    src={cokeZeroImage}
    alt="Coke Zero 250ml"
    className="coke-image"
  />

  <div className="seasoning-info">
    <strong>Coke Zero</strong>
    <span>₹20 per 250ml bottle</span>
  </div>

  <div className="seasoning-counter">
    <button
      type="button"
      onClick={() =>
        setCokeZero(prev => Math.max(0, prev - 1))
      }
      disabled={cokeZero === 0}
    >
      −
    </button>

    <span>{cokeZero}</span>

    <button
      type="button"
      onClick={() =>
        setCokeZero(prev => Math.min(5, prev + 1))
      }
      disabled={cokeZero === 5}
    >
      +
    </button>
  </div>
</div>


  


  

</div>



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


{showCokePopup && (
  <div className="coke-popup-overlay">
    <div className="coke-popup">

      <img
        src={cokeZeroImage}
        alt="Coke Zero 250ml"
        className="coke-popup-image"
      />

      <h2>Coke Zero</h2>

      <p className="coke-popup-price">
        ₹20 · 250ml bottle
      </p>

      <p className="coke-popup-text">
        Add a refreshing Coke Zero to your order?
      </p>

      {cokeAdded && (
  <div className="coke-popup-counter">
    <button
      type="button"
      onClick={() =>
        setCokeZero(prev => Math.max(1, prev - 1))
      }
      disabled={cokeZero === 1}
    >
      −
    </button>

    <span>{cokeZero}</span>

    <button
      type="button"
      onClick={() =>
        setCokeZero(prev => Math.min(5, prev + 1))
      }
      disabled={cokeZero === 5}
    >
      +
    </button>
  </div>
)}

<div className="coke-popup-buttons">
  {!cokeAdded ? (
    <>
      <button
        type="button"
        className="coke-add-button"
        onClick={() => {
          setCokeZero(1)
          setCokeAdded(true)
        }}
      >
        ADD
      </button>

      <button
        type="button"
        className="coke-close-button"
        onClick={() => setShowCokePopup(false)}
      >
        CLOSE
      </button>
    </>
  ) : (
    <button
      type="button"
      className="coke-add-button"
      onClick={() => setShowCokePopup(false)}
    >
      DONE
    </button>
  )}
</div>

    </div>
  </div>
)}



    </div>
  )

}







export default Checkout