import { useState, useEffect } from 'react'

function Sales({ apiUrl }) {

  const [orders, setOrders] =
    useState([])

  const [selectedDate,
    setSelectedDate] =
    useState(
      new Date()
        .toISOString()
        .split('T')[0]
    )

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {

    try {

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
        setOrders(data.orders)
      }

    } catch (err) {
      console.log(err)
    }
  }

  const filteredOrders =
    orders.filter(order => {

      if (
        order.status !==
        'Delivered'
      ) {
        return false
      }

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

      return (
        orderDate === selectedDate
      )
    })

  const totalEggs =
    filteredOrders.reduce(
      (sum, order) =>
        sum + order.boiledEggs,
      0
    )

  const totalBhurji =
    filteredOrders.reduce(
      (sum, order) =>
        sum + order.eggBhurji,
      0
    )

  const totalRevenue =
    filteredOrders.reduce(
      (sum, order) =>
        sum + order.totalAmount,
      0
    )

  const totalProfit =
    totalEggs * 2.75 +
    totalBhurji * 5

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0f172a',
        color: 'white',
        padding: '40px'
      }}
    >
      <h1
        style={{
          marginBottom: '30px'
        }}
      >
        📈 Sales Dashboard
      </h1>

      <input
        type="date"
        value={selectedDate}
        onChange={(e) =>
          setSelectedDate(
            e.target.value
          )
        }
        style={{
          padding: '10px',
          borderRadius: '10px',
          marginBottom: '30px'
        }}
      />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '20px'
        }}
      >

        <div style={cardStyle}>
          <h2>🥚 Eggs Sold</h2>
          <h1>{totalEggs}</h1>
        </div>

        <div style={cardStyle}>
          <h2>🍛 Bhurji Sold</h2>
          <h1>{totalBhurji}</h1>
        </div>

        <div style={cardStyle}>
          <h2>💰 Revenue</h2>
          <h1>₹{totalRevenue}</h1>
        </div>

        <div style={cardStyle}>
          <h2>📈 Profit</h2>
          <h1>
            ₹{totalProfit}
          </h1>
        </div>

      </div>
    </div>
  )
}

const cardStyle = {
  backgroundColor: '#1e293b',
  padding: '30px',
  borderRadius: '20px',
  textAlign: 'center',
}

export default Sales