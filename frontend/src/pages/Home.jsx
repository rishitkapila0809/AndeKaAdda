import {
  useState,
  useEffect
} from 'react'
import { useNavigate } from 'react-router-dom'
import socket from '../socket'
import Footer from '../components/Footer'

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

  const boiledEggTotal = eggQuantity * 11
  const bhurjiTotal = bhurjiQuantity * 40
  const grandTotal = boiledEggTotal + bhurjiTotal
  const totalItems = eggQuantity + bhurjiQuantity

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


useEffect(() => {

const loadCustomerProfile = async () => {

  const savedPhone =
    localStorage.getItem(
      'customerPhone'
    )

  if (!savedPhone) {
    return
  }

  try {

    const response = await fetch(
      `${apiUrl}/api/customers/${savedPhone}`
    )

    const data = await response.json()

    if (data.success) {

      setBuyerName(
        data.customer.name || ''
      )

      setPhoneNumber(
        data.customer.phoneNumber || ''
      )

      setBlock(
        data.customer.blockName || ''
      )

      setRoomNumber(
        data.customer.roomNumber || ''
      )

    }

  } catch (err) {

    console.log(
      'Unable to load customer profile',
      err
    )

  }

}

loadCustomerProfile()


fetchOrderingStatus()

const handleSettingsUpdate = () => {

  fetchOrderingStatus()

}

socket.on(
  'settingsUpdated',
  handleSettingsUpdate
)


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

  return () => {

  socket.off(
    'settingsUpdated',
    handleSettingsUpdate
  )

}


}, [])

  const handleContinue = () => {

  if (!buyerName || !phoneNumber || !block || !roomNumber) {
    alert('❌ Please fill all delivery details')
    return
  }

  if (eggQuantity < 2 && bhurjiQuantity === 0) {
    alert('❌ Please select a quantity for at least one item')
    return
  }

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
    alert('Enter a valid Block')
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

  navigate('/checkout', {
    state: {
      buyerName,
      phoneNumber,
      block,
      roomNumber,
      eggQuantity,
      bhurjiQuantity,
      boiledEggTotal,
      bhurjiTotal,
      grandTotal
    }
  })

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
    🚫! Orders are currently closed

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


      <div className="products-section">
        <div className="product">
          <h2>🥚 Boiled Eggs</h2>
          <p className="price">₹11 per egg</p>
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


<div className="floating-checkout-bar">

  <div className="floating-left">
    <div className="floating-eggs">
  {totalItems} {totalItems === 1 ? 'Item' : 'Items'}
</div>

    <div className="floating-price">
      ₹{grandTotal}
    </div>
  </div>

  <button
    className="floating-continue-btn"
    onClick={handleContinue}
    disabled={!isOrderingEnabled}
  >
    Continue →
  </button>

</div>

<Footer />

    </div>
  )
}

export default Home