import { useNavigate } from 'react-router-dom'

function OrderSuccess() {

  const navigate = useNavigate()

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0f172a',
        color: 'white',
        textAlign: 'center',
        padding: '20px'
      }}
    >
      <h1
        style={{
          color: '#00ff99',
          marginBottom: '20px',
          fontSize: '42px'
        }}
      >
        ✅ Order Placed Successfully
      </h1>

      <p
        style={{
          fontSize: '20px',
          marginBottom: '30px',
          color: '#cccccc'
        }}
      >
        Kindly view your cart
        for live order status
        and ETA updates.
      </p>

      <button
        onClick={() => navigate('/cart')}
        style={{
          padding: '14px 30px',
          fontSize: '18px',
          border: 'none',
          borderRadius: '12px',
          backgroundColor: '#00ff99',
          color: '#000',
          cursor: 'pointer',
          marginBottom: '15px',
          width: '250px'
        }}
      >
        📦 View My Orders
      </button>

      <button
        onClick={() => navigate('/')}
        style={{
          padding: '14px 30px',
          fontSize: '18px',
          border: 'none',
          borderRadius: '12px',
          backgroundColor: '#334155',
          color: '#fff',
          cursor: 'pointer',
          width: '250px'
        }}
      >
        Continue Ordering
      </button>
    </div>
  )
}

export default OrderSuccess