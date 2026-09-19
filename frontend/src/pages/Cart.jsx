import { useState, useEffect } from 'react'
import { io } from 'socket.io-client'
import { useNavigate } from 'react-router-dom'
import { addOns } from '../components/AddOns'
const socket = io(import.meta.env.VITE_API_URL, {
  transports: ['websocket'],
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000
})
function Cart({ apiUrl }) {
  const [myOrders, setMyOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [phoneInput, setPhoneInput] = useState('')
  const [showPhonePrompt, setShowPhonePrompt] = useState(false)
  const [, forceUpdate] = useState(0)
  const navigate = useNavigate()

  const getAddonQuantity = (
  order,
  addonId
) => {

  let addons = order.addons || {}

  if (typeof addons === 'string') {
    try {
      addons = JSON.parse(addons)
    } catch {
      addons = {}
    }
  }

  if (addons[addonId] !== undefined) {
    return Number(
      addons[addonId] || 0
    )
  }

  if (addonId === 'salt') {
    return Number(
      order.saltSachets || 0
    )
  }

  if (addonId === 'cokeZero') {
    return Number(
      order.cokeZero || 0
    )
  }

  return 0
}
  

  useEffect(() => {
  loadMyOrders()

  const handleOrdersUpdated = () => {
    loadMyOrders()
  }

  socket.on('newOrder', handleOrdersUpdated)
socket.on('orderUpdated', handleOrdersUpdated)
socket.on('ordersUpdated', handleOrdersUpdated)

  return () => {
    socket.off('newOrder', handleOrdersUpdated)
socket.off('orderUpdated', handleOrdersUpdated)
socket.off('ordersUpdated', handleOrdersUpdated)
  }
}, [])


useEffect(() => {
  const interval = setInterval(() => {
    forceUpdate(prev => prev + 1)
  }, 1000)

  return () => clearInterval(interval)
}, [])

  const loadMyOrders = async () => {
    setLoading(true)
    const storedPhone = localStorage.getItem('customerPhone')
    
    if (storedPhone) {
      try {
        const response = await fetch(`${apiUrl}/api/orders/customer/${storedPhone}`)
        const data = await response.json()
        if (data.success) {
          setMyOrders(data.orders || [])
          setShowPhonePrompt(false)
        }
      } catch (err) {
        console.error('Error fetching orders:', err)
        setShowPhonePrompt(true)
      }
    } else {
      setShowPhonePrompt(true)
    }
    setLoading(false)
  }

  const handleSearchByPhone = async (e) => {
    e.preventDefault()
    if (!phoneInput.trim()) return

    setLoading(true)
    try {
      const response = await fetch(`${apiUrl}/api/orders/customer/${phoneInput}`)
      const data = await response.json()
      if (data.success) {
        setMyOrders(data.orders || [])
        localStorage.setItem('customerPhone', phoneInput)
        setShowPhonePrompt(false)
        setPhoneInput('')
      } else {
        alert('No orders found for this number')
      }
    } catch (err) {
      console.error('Error fetching orders:', err)
      alert('Cannot connect to backend. Make sure it is running.')
    } finally {
      setLoading(false)
    }
  }

  const calculateTotal = () => {
    return myOrders.reduce((sum, order) => sum + order.totalAmount, 0)
  }


  const cancelOrder = async (
  orderId
) => {

const confirmCancel = window.confirm(
  'Are you sure you want to cancel this order?'
)

if (!confirmCancel) {
  return
}

  try {
    const response = await fetch(
      `${apiUrl}/api/orders/${orderId}/cancel`,
      {
        method: 'PUT',
      }
    )

    const data = await response.json()

    alert(data.message)

    if (data.success) {
      loadMyOrders()
    }
  } catch (err) {
    console.log(err)
  }
}



  const getRemainingTime = (
  estimatedDeliveryTime
) => {
  const difference =
    new Date(estimatedDeliveryTime) -
    new Date()

  if (difference <= 0) {
    return null
  }

  const minutes =
    Math.floor(difference / 1000 / 60)

  const seconds =
    Math.floor((difference / 1000) % 60)

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}


const getCancelTimeLeft = (
  orderDate
) => {
  const orderTime =
    new Date(orderDate)

  const cancelDeadline =
    new Date(
      orderTime.getTime() +
      2 * 60 * 1000
    )

  const difference =
    cancelDeadline - new Date()

  if (difference <= 0) {
    return null
  }

  const minutes =
    Math.floor(difference / 1000 / 60)

  const seconds =
    Math.floor((difference / 1000) % 60)

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}


  if (loading) {
    return (
      <div className="cart-container">
        <h1>Your Orders</h1>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="cart-container">
      <h1>Your Orders</h1>

      {showPhonePrompt && (
        <div className="phone-prompt">
          <form onSubmit={handleSearchByPhone}>
            <input
              type="tel"
              placeholder="Enter your phone number"
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              className="form-input"
            />
            <button type="submit" className="place-order-btn">
              View My Orders
            </button>
          </form>
        </div>
      )}

      {!showPhonePrompt && myOrders.length === 0 ? (
        <div className="empty-cart">
          <p>You haven't placed any orders yet.</p>
          <button 
            className="place-order-btn"
            onClick={() => navigate('/')}
          >
            Place Your First Order
          </button>
        </div>
      ) : !showPhonePrompt ? (
        <>
          <div className="orders-grid">
            {myOrders.map((order) => (
              <div
                key={order.orderId}
                className="order-item"
                style={{
  backgroundColor:
    order.status === 'Cancelled'
      ? '#3a0d0d'
      : order.status === 'Delivered'
      ? '#0d3a22'
      : '',

  border:
    order.status === 'Cancelled'
      ? '2px solid #ff4444'
      : order.status === 'Delivered'
      ? '2px solid #00ff99'
      : ''
}}
              >
                <h3>{order.orderId}</h3>
                <p><strong>Status:</strong> <span className={`status-${order.status.toLowerCase()}`}>{order.status}</span></p>
                <p>
                 Payment:{' '}
                <span
                style={{
                color:
                order.paymentStatus === 'Paid'
                ? '#00ff99'
                : '#ff6666',
              }}
              >
              {order.paymentStatus}
              </span>
</p>
                <p><strong>Boiled Eggs:</strong> {order.boiledEggs}</p>
<p><strong>Egg Bhurji:</strong> {order.eggBhurji}</p>

{addOns.map(addOn => {

  const quantity =
    getAddonQuantity(
      order,
      addOn.id
    )

  if (quantity <= 0) {
    return null
  }

  return (
    <p key={addOn.id}>
      <strong>
        {addOn.name}:
      </strong>{' '}
      {quantity}
    </p>
  )
})}

<p><strong>Amount:</strong> ₹{order.totalAmount}</p>

                {order.status === 'Cancelled' ? (
                <p
                style={{
                  color: '#ff4444',
                  fontWeight: 'bold'
                }}
                >
                ❌ Order Cancelled
                </p>
                  ) : order.status === 'Delivered' ? (
                <p
                style={{
                color: '#00ff99',
                fontWeight: 'bold'
                }}
              >
              ✅ Delivered successfully
              </p>
              ) : getRemainingTime(
              order.estimatedDeliveryTime
              ) ? (
              <p
              style={{
             color: '#66ccff',
              fontWeight: 'bold'
              }}
              >
              ⏳ Estimated delivery:
              {' '}
               {
             getRemainingTime(
               order.estimatedDeliveryTime
              )
              }
               </p>
              ) : (
              <p
              style={{
              color: 'orange',
              fontWeight: 'bold'
              }}
              >
              ⏳ Arriving shortly
              </p>
              )}
                <p><strong>Delivery:</strong> Block {order.blockName}, Room {order.roomNumber}</p>
                <p className="order-time">Ordered: {" "}
   {new Date(order.orderDate)
    .toLocaleString()}
</p>

{order.status !== 'Cancelled' &&
 order.status !== 'Delivered' && (
  <button
    onClick={() =>
      cancelOrder(order.orderId)
    }
    style={{
      marginTop: '10px',
      backgroundColor: '#ff4444',
      color: 'white',
      border: 'none',
      padding: '10px',
      borderRadius: '8px',
      cursor: 'pointer',
      width: '100%'
    }}
  >
    {getCancelTimeLeft(order.orderDate)
      ? `Cancel Order (${getCancelTimeLeft(order.orderDate)})`
      : 'Cancel Order'}
  </button>
)}
                
              </div>
            ))}
          </div>

<div
  style={{
    marginTop: '20px',
    textAlign: 'center'
  }}
>
  <button
    onClick={() => navigate('/')}
    style={{
      backgroundColor: '#f59e0b',
      color: 'white',
      border: 'none',
      padding: '14px 24px',
      borderRadius: '10px',
      fontSize: '18px',
      cursor: 'pointer',
      fontWeight: 'bold'
    }}
  >
    ➕ Order More
  </button>
</div>

        </>
      ) : null}
    </div>
  )
}

export default Cart