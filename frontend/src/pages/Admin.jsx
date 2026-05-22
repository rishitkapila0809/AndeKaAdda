import { io } from 'socket.io-client'
import {
  useState,
  useEffect,
  useRef
} from 'react'
import AdminLogin from './AdminLogin'
const socket = io(import.meta.env.VITE_API_URL, {
  transports: ['websocket'],
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000
})



function Admin({ isAdminLoggedIn, onAdminLogin, onAdminLogout, apiUrl }) {

  const notificationSound =
  new Audio('/notification.mp3')

  const cancelSound =
  new Audio('/cancel.mp3')

  


  const [
  isOrderingEnabled,
  setIsOrderingEnabled
] = useState(true)
  const [orders, setOrders] = useState([])
  const [selectedDate, setSelectedDate] =
  useState(
    new Date()
      .toISOString()
      .split('T')[0]
  )
  const [loading, setLoading] = useState(false)
  const [showPopup, setShowPopup] =
  useState(false)

  const [latestOrder, setLatestOrder] =
  useState(null)
  const [, forceUpdate] = useState(0)

  const latestOrderIdRef =
  useRef(null)

  const previousOrdersRef =
  useRef([])
  

  useEffect(() => {
  if (!isAdminLoggedIn) return

  loadOrders()

  
  const handleOrdersUpdated =
  async () => {

  console.log(
    'Realtime update received'
  )

  const token =
    localStorage.getItem(
      'adminToken'
    )

  const response = await fetch(
    `${apiUrl}/api/orders/admin/all`,
    {
      headers: {
        Authorization:
          `Bearer ${token}`,
      },
    }
  )

  const data =
    await response.json()

  if (data.success) {

    if (
  data.orders.length > 0 &&
  data.orders[0].orderId !==
latestOrderIdRef.current
) {
      notificationSound.play()
      setLatestOrder(
        data.orders[0]
      )

      setShowPopup(true)

      setTimeout(() => {
        setShowPopup(false)
      }, 5000)
    }

if (data.orders.length > 0) {

  latestOrderIdRef.current =
    data.orders[0].orderId
}   


    setOrders(data.orders)
    previousOrdersRef.current =
  data.orders


  const previousOrders =
  previousOrdersRef.current

const cancelledOrder =
  data.orders.find(
    newOrder => {

      const oldOrder =
        previousOrders.find(
          order =>
            order.orderId ===
            newOrder.orderId
        )

      return (
        oldOrder &&
        oldOrder.status !==
          'Cancelled' &&
        newOrder.status ===
          'Cancelled'
      )
    }
  )

if (cancelledOrder) {
  cancelSound.play()
}
  }
}


  socket.on('ordersUpdated', handleOrdersUpdated)

  return () => {
    socket.off('ordersUpdated', handleOrdersUpdated)
  }
},  [isAdminLoggedIn])


useEffect(() => {
  const interval = setInterval(() => {
    forceUpdate(prev => prev + 1)
  }, 1000)

  return () => clearInterval(interval)
}, [])


  const loadOrders = async () => {
  try {
    const token = localStorage.getItem('adminToken')

    const response = await fetch(
      `${apiUrl}/api/orders/admin/all`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    const data = await response.json()

    if (data.success) {

  setOrders(data.orders || [])
const statusResponse =
  await fetch(
    `${apiUrl}/api/orders/ordering-status`
  )

const statusData =
  await statusResponse.json()

if (statusData.success) {

  setIsOrderingEnabled(
    statusData.isOrderingEnabled
    === 1
  )
}
  
}


  } catch (err) {
    console.error('Error fetching orders:', err)
  }
}

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      setLoading(true)
      const token = localStorage.getItem('adminToken')

const response = await fetch(`${apiUrl}/api/orders/${orderId}/status`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({ status: newStatus }),
})

      const data = await response.json()
      if (data.success) {
        loadOrders()
      }
    } catch (err) {
      console.error('Error updating status:', err)
      alert('Failed to update status')
    } finally {
      setLoading(false)
    }
  }

  const updatePaymentStatus = async (
  orderId,
  paymentStatus
) => {
  try {
    const token =
      localStorage.getItem('adminToken')

    const response = await fetch(
      `${apiUrl}/api/orders/${orderId}/payment`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          paymentStatus
        }),
      }
    )

    const data = await response.json()

    if (data.success) {
      loadOrders()
    }
  } catch (err) {
    console.log(err)
  }
}


const updateETA = async (
  orderId,
  minutes
) => {
  try {
    const token =
      localStorage.getItem('adminToken')

    const response = await fetch(
      `${apiUrl}/api/orders/${orderId}/eta`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ minutes }),
      }
    )

    const data = await response.json()

    if (data.success) {
      loadOrders()
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

  const deleteOrder = async (orderId) => {
    if (confirm('Are you sure you want to delete this order?')) {
      try {
        const token = localStorage.getItem('adminToken')

const response = await fetch(`${apiUrl}/api/orders/${orderId}`, {
  method: 'DELETE',
  headers: {
    Authorization: `Bearer ${token}`,
  },
})

        const data = await response.json()
        if (data.success) {
          loadOrders()
        }
      } catch (err) {
        console.error('Error deleting order:', err)
        alert('Failed to delete order')
      }
    }
  }


  const toggleOrdering =
  async () => {

  try {

    const token =
      localStorage.getItem(
        'adminToken'
      )

    await fetch(
      `${apiUrl}/api/orders/ordering-status`,
      {
        method: 'PUT',
        headers: {
          'Content-Type':
            'application/json',
          Authorization:
            `Bearer ${token}`,
        },
        body: JSON.stringify({
          isOrderingEnabled:
            !isOrderingEnabled
              ? 1
              : 0
        }),
      }
    )

    setIsOrderingEnabled(
      !isOrderingEnabled
    )

  } catch (err) {
    console.log(err)
  }
}

const filteredOrders = orders.filter(
  order => {

    const parsedDate =
      new Date(order.orderDate)

    if (
      isNaN(parsedDate.getTime())
    ) {
      return false
    }

    const orderDate =
      parsedDate
        .toISOString()
        .split('T')[0]

    return orderDate === selectedDate
  }
)

  if (!isAdminLoggedIn) {
    return <AdminLogin onAdminLogin={onAdminLogin} />
  }

  return (
    <div className="admin-container">


    {showPopup && latestOrder && (
  <div
    style={{
      position: 'fixed',
      top: '30px',
      right: '30px',
      backgroundColor: '#16a34a',
      color: 'white',
      padding: '25px',
      borderRadius: '16px',
      zIndex: 9999,
      boxShadow:
        '0 0 20px rgba(0,0,0,0.5)',
      minWidth: '320px'
    }}
  >
    <h2
      style={{
        marginBottom: '10px'
      }}
    >
      🔔 New Order Received
    </h2>

    <p>
      <strong>
        {latestOrder.buyerName}
      </strong>
    </p>

    <p>
      Block {
        latestOrder.blockName
      }
      {' '}
      Room {
        latestOrder.roomNumber
      }
    </p>

    <p>
      ₹{latestOrder.totalAmount}
    </p>
  </div>
)}


  <h1>📋 Admin Panel</h1>

  <div
    style={{
      marginBottom: '20px'
    }}
  >
    <label
      style={{
        fontWeight: 'bold',
        marginRight: '10px'
      }}
    >
      Select Date:
    </label>

    <input
      type="date"
      value={selectedDate}
      onChange={(e) =>
        setSelectedDate(e.target.value)
      }
      style={{
        padding: '8px',
        borderRadius: '18px'
      }}
    />
  </div>

  <h2
    style={{
      marginBottom: '20px',
      color: '#ffffff'
    }}
  >
    Orders for{' '}
    {
      new Date(selectedDate)
        .toLocaleDateString()
    }
  </h2>


  <button
  onClick={toggleOrdering}
  style={{
    padding: '14px 24px',
    backgroundColor:
      isOrderingEnabled
        ? '#dc2626'
        : '#16a34a',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginBottom: '20px'
  }}
>
  {
    isOrderingEnabled
      ? '🔴 Close Orders'
      : '🟢 Open Orders '
  }
</button>

<div
  style={{
    marginBottom: '25px',
    fontSize: '20px',
    fontWeight: 'bold',
    color:
      isOrderingEnabled
        ? '#22c55e'
        : '#ef4444'
  }}
>
  {
    isOrderingEnabled
      ? '🟢 Website LIVE'
      : '🔴 Website OFFLINE'
  }
</div>
      

      {filteredOrders.length === 0 ? (
  <div className="no-orders">
    <p>No orders for this date currently</p>
  </div>
) : (
  <div className="orders-list">
    {filteredOrders.map((order) => (
            <div
  key={order.orderId}
  className={`order-card status-${order.status.toLowerCase()}`}
style={{
  backgroundColor:
    order.status === 'Cancelled'
      ? '#3a0d0d'
      : order.status === 'Delivered'
      ? '#104428'
      : order.status === 'Preparing'
      ? '#0d223a'
      : order.status === 'Ready'
      ? '#3a2d0d'
      : order.status === 'Pending'
      ? '#2a0d3a'
      : '',

  border:
    order.status === 'Cancelled'
      ? '2px solid #ff4444'
      : order.status === 'Delivered'
      ? '2px solid #00ff99'
      : order.status === 'Preparing'
      ? '2px solid #66ccff'
      : order.status === 'Ready'
      ? '2px solid #ffcc66'
      : order.status === 'Pending'
      ? '2px solid #cc99ff'
      : ''
}}
>

              <div className="order-header">
                <h3>Order {order.orderId}</h3>
                <span className={`status-badge ${order.status.toLowerCase()}`}>
                  {order.status}
                </span>
              </div>

              <div className="order-content">
                <div className="buyer-info">
                  <h4>👤 Buyer Details</h4>
                  <p><strong>Name:</strong> {order.buyerName}</p>
                  <p><strong>Phone:</strong> {order.phoneNumber}</p>
                </div>

                <div className="delivery-info">
                  <h4>📍 Delivery Location</h4>
                  <p><strong>Block:</strong> {order.blockName}</p>
                  <p><strong>Room:</strong> {order.roomNumber}</p>
                </div>

                <div className="items-info">
                  <h4>🛒 Items</h4>
                  {order.boiledEggs > 0 && (
                    <p>🥚 Boiled Eggs: {order.boiledEggs} × ₹10 = ₹{order.boiledEggs * 10}</p>
                  )}
                  {order.eggBhurji > 0 && (
                    <p>🍛 Egg Bhurji: {order.eggBhurji} × ₹40 = ₹{order.eggBhurji * 40}</p>
                  )}
                </div>

                <div className="amount-info">
                  <p><strong>Total Amount:</strong> ₹{order.totalAmount}</p>
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
    ✅ Delivered
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
    ⏳ ETA:
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

                  <p>
  <strong>Payment:</strong>{' '}
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
                  <p className="order-time">
  Ordered:{' '}
  {
    new Date(order.orderDate)
      .toLocaleString()
  }
</p>
                </div>
              </div>

              <div className="order-actions">
                <select 
                  value={order.status}
                  onChange={(e) => updateOrderStatus(order.orderId, e.target.value)}
                  className="status-select"
                  disabled={loading}
                >
                  <option value="Pending">Pending</option>
                  <option value="Preparing">Preparing</option>
                  <option value="Ready">Ready for Delivery</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>

                </select>
                <button 
                  className="delete-btn"
                  onClick={() => deleteOrder(order.orderId)}
                  disabled={loading}
                >
                  Delete
                </button>
               <button
  onClick={() =>
    updatePaymentStatus(
      order.orderId,
      order.paymentStatus === 'Paid'
        ? 'Pending'
        : 'Paid'
    )
  }
  style={{
    padding: '8px 12px',
    fontSize: '13px',
    fontWeight: '600',
    border: 'none',
    borderRadius: '8px',
    background:
      order.paymentStatus === 'Paid'
        ? '#ef4444'
        : '#10b981',
    color: 'white',
    cursor: 'pointer'
  }}
>
  {
    order.paymentStatus === 'Paid'
      ? 'Mark Unpaid'
      : 'Mark Paid'
  }
</button>

<button
  onClick={() =>
    updateETA(order.orderId, 5)
  }
  style={{
    padding: '8px 12px',
    fontSize: '13px',
    fontWeight: '600',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    background: '#ffffff',
    color: '#111827',
    cursor: 'pointer'
  }}
>
  +5 Min
</button>

<button
  onClick={() =>
    updateETA(order.orderId, -5)
  }
  style={{
    padding: '8px 12px',
    fontSize: '13px',
    fontWeight: '600',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    background: '#ffffff',
    color: '#111827',
    cursor: 'pointer'
  }}
>
  -5 Min
</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Admin