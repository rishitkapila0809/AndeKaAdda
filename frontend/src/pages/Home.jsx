import {
  useState,
  useEffect
} from 'react'
import { useNavigate } from 'react-router-dom'
import socket from '../socket'
import Footer from '../components/Footer'


function Home({ apiUrl }) {
  const [eggQuantity, setEggQuantity] = useState(0)
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
  const [showBhurjiInfo, setShowBhurjiInfo] = useState(false)
  const [showEggInfo, setShowEggInfo] = useState(false);
  const [productStock, setProductStock] = useState({})

  const boiledEggTotal = eggQuantity * 11
  const bhurjiTotal = bhurjiQuantity * 35
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

const fetchProductStock = async () => {

  try {

    const response = await fetch(
      `${apiUrl}/api/orders/product-stock`
    )

    const data = await response.json()

    if (data.success) {
      setProductStock(
        data.productStock || {}
      )
    }

  } catch (err) {

    console.log(err)

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
fetchProductStock()

const handleSettingsUpdate = () => {
fetchProductStock()
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

useEffect(() => {

  if (productStock.boiledEggs === false) {
    setEggQuantity(0)
  }

  if (productStock.eggBhurji === false) {
    setBhurjiQuantity(0)
  }

}, [productStock])

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
    🚫Sorry! Orders are currently closed 

    <div
      style={{
        marginTop: '10px',
        fontSize: '16px'
      }}
    >
      You can order only from 6:30PM - 7:30PM
    </div>
    
  </div>



)}


     <div className="products-section">

  {/* ================= BOILED EGGS ================= */}

  <div className="product-wrapper">

    <div
      className={`product ${
        productStock.boiledEggs === false
          ? 'product-out-of-stock'
          : ''
      }`}
    >

      <div className="product-bottom-content">

        <h2 className="product-title">

  <span className="title-white">Boiled</span>
  <span className="title-yellow">Eggs</span>

  <button
    onClick={() =>
      setShowEggInfo(!showEggInfo)
    }
    className="bhurji-info-btn"
    aria-label="Boiled Eggs information"
  >
    ⓘ
  </button>

</h2>

        <p className="product-price-box">
          ₹11 <span>per egg</span>
        </p>

      </div>

      {productStock.boiledEggs === false && (
        <div className="out-of-stock-badge">
          ❌ OUT OF STOCK
        </div>
      )}

    </div>


    {/* BOILED EGG QUANTITY — OUTSIDE CARD */}

    <div className="quantity-counter">

      <button
        type="button"
        onClick={() =>
          setEggQuantity(
            eggQuantity === 2
              ? 0
              : eggQuantity - 1
          )
        }
        disabled={
          productStock.boiledEggs === false ||
          eggQuantity === 0
        }
        className="quantity-btn"
      >
        −
      </button>

      <span className="quantity-value">
        {eggQuantity}
      </span>

      <button
        type="button"
        onClick={() =>
          setEggQuantity(
            eggQuantity === 0
              ? 2
              : eggQuantity + 1
          )
        }
        disabled={
          productStock.boiledEggs === false ||
          eggQuantity >= 20
        }
        className="quantity-btn"
      >
        +
      </button>

    </div>

  </div>


  {/* ================= EGG BHURJI ================= */}

  <div className="product-wrapper">

    <div
      className={`product ${
        productStock.eggBhurji === false
          ? 'product-out-of-stock'
          : ''
      }`}
    >

      <div className="product-bottom-content">

        <h2 className="product-title">

          <span className="title-white">Egg</span>
          <span className="title-yellow">Bhurji</span>

          <button
            onClick={() =>
              setShowBhurjiInfo(!showBhurjiInfo)
            }
            className="bhurji-info-btn"
            aria-label="Egg Bhurji information"
          >
            ⓘ
          </button>

        </h2>

        <p className="product-price-box">
          ₹35 <span>per plate</span>
        </p>

      </div>

      {productStock.eggBhurji === false && (
        <div className="out-of-stock-badge">
          ❌ OUT OF STOCK
        </div>
      )}

    </div>


    {/* BHURJI QUANTITY — OUTSIDE CARD */}

    <div className="quantity-counter">

      <button
        type="button"
        onClick={() =>
          setBhurjiQuantity(
            Math.max(0, bhurjiQuantity - 1)
          )
        }
        disabled={
          productStock.eggBhurji === false ||
          bhurjiQuantity <= 0
        }
        className="quantity-btn"
      >
        −
      </button>

      <span className="quantity-value">
        {bhurjiQuantity}
      </span>

      <button
        type="button"
        onClick={() =>
          setBhurjiQuantity(
            Math.min(10, bhurjiQuantity + 1)
          )
        }
        disabled={
          productStock.eggBhurji === false ||
          bhurjiQuantity >= 10
        }
        className="quantity-btn"
      >
        +
      </button>

    </div>

  </div>

</div>



{showEggInfo && (
  <div
    onClick={() =>
      setShowEggInfo(false)
    }
    style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.55)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}
  >

    <div
      onClick={(e) =>
        e.stopPropagation()
      }
      style={{
        width: '100%',
        maxWidth: '360px',
        backgroundColor: '#1e293b',
        color: 'white',
        padding: '24px',
        borderRadius: '18px',
        border: '1px solid #475569',
        boxShadow: '0 15px 40px rgba(0,0,0,0.45)',
        textAlign: 'left'
      }}
    >

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '15px'
        }}
      >

        <h3
          style={{
            margin: 0,
            fontSize: '20px'
          }}
        >
          About Boiled Eggs
        </h3>

        <button
          onClick={() =>
            setShowEggInfo(false)
          }
          style={{
            border: 'none',
            background: 'transparent',
            color: '#94a3b8',
            fontSize: '24px',
            cursor: 'pointer',
            padding: '0',
            lineHeight: '1'
          }}
        >
          ×
        </button>

      </div>

      <p
        style={{
          margin: 0,
          fontSize: '15px',
          lineHeight: '1.6',
          color: '#e2e8f0'
        }}
      >
        1. The minimum order for boiled eggs is{' '}
        <strong>2 eggs</strong>.
        <br />
        <br />
        2. Eggs are provided{' '}
        <strong>with the shell</strong>,
        so you will need to{' '}
        <strong>peel them yourself.</strong>{' '}
        
      </p>

      <button
        onClick={() =>
          setShowEggInfo(false)
        }
        style={{
          width: '100%',
          marginTop: '20px',
          padding: '11px',
          border: 'none',
          borderRadius: '10px',
          backgroundColor: '#f59e0b',
          color: '#111827',
          fontSize: '15px',
          fontWeight: 'bold',
          cursor: 'pointer'
        }}
      >
        Got it
      </button>

    </div>

  </div>
)}



      {showBhurjiInfo && (
  <div
    onClick={() =>
      setShowBhurjiInfo(false)
    }
    style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.55)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}
  >
    <div
      onClick={(e) =>
        e.stopPropagation()
      }
      style={{
        width: '100%',
        maxWidth: '360px',
        backgroundColor: '#1e293b',
        color: 'white',
        padding: '24px',
        borderRadius: '18px',
        border: '1px solid #475569',
        boxShadow: '0 15px 40px rgba(0,0,0,0.45)',
        textAlign: 'left'
      }}
    >

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '15px'
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: '20px'
          }}
        >
          About Egg Bhurji
        </h3>

        <button
          onClick={() =>
            setShowBhurjiInfo(false)
          }
          style={{
            border: 'none',
            background: 'transparent',
            color: '#94a3b8',
            fontSize: '24px',
            cursor: 'pointer',
            padding: '0',
            lineHeight: '1'
          }}
        >
          ×
        </button>
      </div>

      <p
        style={{
          margin: 0,
          fontSize: '15px',
          lineHeight: '1.6',
          color: '#e2e8f0'
        }}
      >
        1. 1 Plate of Egg bhurji contains {' '}
        <strong>2 eggs</strong>.
        <br />
        <br />
        
        2. Egg Bhurji is{' '}
        <strong>
          not prepared in any hostel room
        </strong>
        . It is sourced from a{' '}
        <strong>
          paid mess
        </strong>
        , then packed and delivered to you.
      </p>

      <button
        onClick={() =>
          setShowBhurjiInfo(false)
        }
        style={{
          width: '100%',
          marginTop: '20px',
          padding: '11px',
          border: 'none',
          borderRadius: '10px',
          backgroundColor: '#f59e0b',
          color: '#111827',
          fontSize: '15px',
          fontWeight: 'bold',
          cursor: 'pointer'
        }}
      >
        Got it
      </button>

    </div>
  </div>
)}

      <div className="delivery-section">
        <h2> Delivery Details</h2>
        
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