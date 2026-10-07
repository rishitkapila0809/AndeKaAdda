import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { addOns } from '../components/AddOns'
import socket from '../socket'


function Checkout({ apiUrl }) {

  const location = useLocation()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
const [error, setError] = useState('')
const [addonQuantities, setAddonQuantities] = useState(() => {
  const quantities = {}

  addOns.forEach(addon => {
    quantities[addon.id] =
      location.state?.addonQuantities?.[addon.id] || 0
  })

  return quantities
})



const [productStock, setProductStock] = useState({})

useEffect(() => {

  const loadProductStock = async () => {

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

  loadProductStock()

  const handleSettingsUpdate = () => {
    loadProductStock()
  }

  socket.on(
    'settingsUpdated',
    handleSettingsUpdate
  )

  return () => {
    socket.off(
      'settingsUpdated',
      handleSettingsUpdate
    )
  }

}, [apiUrl])

useEffect(() => {

  setAddonQuantities(prev => {

    const updated = { ...prev }

    addOns.forEach(addon => {

      if (
        productStock[addon.id] === false
      ) {
        updated[addon.id] = 0
      }

    })

    return updated

  })

}, [productStock])



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

const addonsTotal = addOns.reduce(
  (total, addon) =>
    total +
    addon.price *
      Number(addonQuantities[addon.id] || 0),
  0
)

const finalGrandTotal =
  Number(grandTotal || 0) +
  addonsTotal

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
  addons: addonQuantities,
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
      <h3>Add Ons</h3>
      <p>Add something extra to your order</p>
    </div>
  </div>

  {addOns.map(addon => {

    const quantity =
      Number(addonQuantities[addon.id] || 0)

      const isInStock =
  productStock[addon.id] !== false

    return (
      <div
        key={addon.id}
        className={
  `seasoning-item ${
    isInStock
      ? 'seasoning-available'
      : 'seasoning-out-of-stock'
  }`
}
      >

        <img
          src={addon.image}
          alt={addon.name}
          className="coke-image"
        />

        <div className="seasoning-info">

  <strong>{addon.name}</strong>

  <span>
    ₹{addon.price} {addon.unit}
  </span>

  {!isInStock && (
    <strong className="addon-out-of-stock">
      ✕ OUT OF STOCK
    </strong>
  )}

</div>

        <div className="seasoning-counter">

          <button
            type="button"
            onClick={() =>
              setAddonQuantities(prev => ({
                ...prev,
                [addon.id]: Math.max(
                  0,
                  Number(prev[addon.id] || 0) - 1
                )
              }))
            }
            disabled={
  !isInStock ||
  quantity === 0
}
          >
            −
          </button>

          <span>{quantity}</span>

          <button
            type="button"
            onClick={() =>
              setAddonQuantities(prev => ({
                ...prev,
                [addon.id]: Math.min(
                  addon.maxQuantity,
                  Number(prev[addon.id] || 0) + 1
                )
              }))
            }
            disabled={
  !isInStock ||
  quantity >= addon.maxQuantity
}
          >
            +
          </button>

        </div>

      </div>
    )
  })}

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



{/* COKE ZERO POPUP */}

{/* {showCokePopup && (
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
)} */}



    </div>
  )

}







export default Checkout