import {
  useState,
  useEffect
} from 'react'
import { useNavigate } from 'react-router-dom'

function Home({ apiUrl }) {
  const [eggQuantity, setEggQuantity] = useState(2)
  const [bhurjiQuantity, setBhurjiQuantity] = useState(0)
  const [buyerName, setBuyerName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [block, setBlock] = useState('')
  const [roomNumber, setRoomNumber] = useState('')
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const [isOrderingEnabled, setIsOrderingEnabled] = useState(true)

  const boiledEggTotal = eggQuantity * 10
  const bhurjiTotal = bhurjiQuantity * 40
  const grandTotal = boiledEggTotal + bhurjiTotal


useEffect(() => {

  const savedPhone =
    localStorage.getItem(
      'customerPhone'
    )

  const savedName =
    localStorage.getItem(
      'customerName'
    )

  const savedBlock =
    localStorage.getItem(
      'customerBlock'
    )

  const savedRoom =
    localStorage.getItem(
      'customerRoom'
    )

  if (savedPhone) {
    setPhoneNumber(savedPhone)
  }

  if (savedName) {
    setBuyerName(savedName)
  }

  if (savedBlock) {
    setBlock(savedBlock)
  }

  if (savedRoom) {
    setRoomNumber(savedRoom)
  }

  const fetchOrderingStatus =
  async () => {

  const response =
    await fetch(
      `${apiUrl}/api/orders/ordering-status`
    )

  const data =
    await response.json()

  if (data.success) {

    setIsOrderingEnabled(
  data.isOrderingEnabled
)
  }
}

fetchOrderingStatus()


  let startY = 0

  window.addEventListener(
    'touchstart',
    (e) => {
      startY = e.touches[0].clientY
    }
  )

  window.addEventListener(
    'touchend',
    (e) => {

      const endY =
        e.changedTouches[0].clientY

      if (
        endY - startY > 120 &&
        window.scrollY === 0
      ) {
        window.location.reload()
      }

    }
  )


}, [])

  const handlePlaceOrder = async () => {
    if (!buyerName || !phoneNumber || !block || !roomNumber) {
      alert('❌ Please fill all delivery details')
      return
    }

    if (eggQuantity < 2 && bhurjiQuantity === 0) {
      alert('❌ Please select a quantity for at least one item')
      return
    }

    
    setError('')

    const phoneRegex = /^[0-9]{10}$/
const blockRegex = /^[A-Za-z]{1}$/
const roomRegex = /^[0-9]{3,4}$/
const nameRegex = /^[A-Za-z ]+$/

if (!nameRegex.test(buyerName.trim())) {
  alert('Name should contain only letters')
  return
}

if (!phoneRegex.test(phoneNumber)) {
  alert('Enter a valid phone number')
  return
}

if (!blockRegex.test(block)) {
  alert('Enter a Valid Block')
  return
}

if (!roomRegex.test(roomNumber)) {
  alert('Enter a valid room number')
  return
}

const room = Number(roomNumber)

if (room < 1 || room > 2000) {
  alert('Enter a valid room number')
  return
}
setLoading(true)

    try {
      const response = await fetch(`${apiUrl}/api/orders/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          buyerName,
          phoneNumber,
          block,
          roomNumber,
          boiledEggs: eggQuantity,
          eggBhurji: bhurjiQuantity,
          totalAmount: grandTotal,
        }),
      })

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



  setEggQuantity(2)
  setBhurjiQuantity(0)
  setBuyerName('')
  setPhoneNumber('')
  setBlock('')
  setRoomNumber('')

  navigate('/success')
} else {
        setError('❌ Failed to place order: ' + data.message)
      }
    } catch (err) {
      setError('❌ Connection error: Make sure backend is running on import.meta.env.VITE_API_URL')
      console.error('Error placing order:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="home-container">

      
      
      {error && <div className="error-message">{error}</div>}
      
      
      


      {!isOrderingEnabled && (
  <div
    style={{
      backgroundColor: '#7f1d1d',
      color: 'white',
      padding: '20px',
      borderRadius: '16px',
      marginBottom: '20px',
      textAlign: 'center',
      fontSize: '22px',
      fontWeight: 'bold'
    }}
  >
    🚫Sorry! Orders are currently closed

    <div
      style={{
        marginTop: '10px',
        fontSize: '16px'
      }}
    >
      You can order only
      between   18:30 PM – 20:00 PM
    </div>


    
  </div>



)}

<div className="price-notice">
  <div className="price-notice-title">
    📢 Price Notice
  </div>

  <div className="price-notice-text">
    Egg prices are subject to daily market rates. Due to a recent increase in
    market prices, the price of a boiled egg will be revised from
    <strong> ₹10 </strong>
    to
    <strong> ₹10.25 </strong>
    per egg <strong>effective tomorrow.</strong><p> Thank you for your understanding
    and continued support! </p>
  </div>
</div>

      <div className="products-section">
        <div className="product">
          <h2>🥚 Boiled Eggs</h2>
          <p className="price">₹10 per egg</p>
          <p className="note">Minimum order: 2 eggs</p>
          <select
  value={eggQuantity}
  onChange={(e) =>
    setEggQuantity(Number(e.target.value))
  }
  className="quantity-input"
>
  {[...Array(21).keys()]
    .filter((num) => num !== 1)
    .map((num) => (
      <option key={num} value={num}>
        {num}
      </option>
    ))}
</select>
          <p className="total">Total: ₹{boiledEggTotal}</p>
        </div>

        <div className="product disabled">
  <h2>🍛 Egg Bhurji</h2>
  <p className="price">Coming Soon...</p>
  <p className="note">This item is currently unavailable</p>

  <select
    disabled
    className="quantity-input"
  >
    <option>Coming Soon...</option>
  </select>

  <p className="total">Coming Soon...</p>
</div>
      </div>

      <div className="delivery-section">
        <h2>📦 Delivery Details</h2>
        
        <div className="form-group">
          <label>Your Name</label>
          <input
            type="text"
            placeholder="Enter your name"
            value={buyerName}
            onChange={(e) =>
  setBuyerName(
    e.target.value.replace(
      /\b\w/g,
      (char) => char.toUpperCase()
    )
  )
}
            className="form-input"
            disabled={!isOrderingEnabled}
          />
        </div>

        <div className="form-group">
          <label>Phone Number</label>
          <input
            type="tel"
            placeholder="Enter phone number"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="form-input"
            disabled={!isOrderingEnabled}
          />
        </div>

        <div className="form-group">
          <label>Block</label>
          <input
            type="text"
            placeholder="Enter Block (e.g., A, B, C)"
            value={block}
            onChange={(e) =>
  setBlock(e.target.value.toUpperCase())
}
            className="form-input"
            disabled={!isOrderingEnabled}
          />
        </div>

        <div className="form-group">
          <label>Room Number</label>
          <input
            type="text"
            placeholder="Enter Room Number"
            value={roomNumber}
            onChange={(e) => setRoomNumber(e.target.value)}
            className="form-input"
            disabled={!isOrderingEnabled}
          />
        </div>
      </div>

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



      {/* <div className="sticky-order-bar">
  <div className="sticky-total">
    ₹{grandTotal}
  </div>

  <button
    className="sticky-order-btn"
    onClick={handlePlaceOrder}
    disabled={loading}
  >
    {loading
      ? 'Placing...'
      : 'Place Order →'}
  </button>
</div> */}


      <button 
        className="place-order-btn"
        onClick={handlePlaceOrder}
        disabled={
  loading ||
  !isOrderingEnabled
}
      >
        {loading ? 'Processing...' : 'Place Order'}
      </button>
    </div>
  )
}

export default Home