import { useState, useEffect } from 'react'
import { addOns } from '../components/AddOns'

function Sales({ apiUrl }) {

  const [orders, setOrders] = useState([])

  const [selectedDate, setSelectedDate] =
    useState(
      new Date()
        .toISOString()
        .split('T')[0]
    )

  const [costs, setCosts] = useState({})

  const [openCards, setOpenCards] =
    useState({})

  const [editingCosts, setEditingCosts] =
    useState({})

  const [savingCost, setSavingCost] =
    useState({})


  useEffect(() => {
    loadOrders()
  }, [])


  useEffect(() => {
    loadCosts()
  }, [selectedDate])


  const loadOrders = async () => {

    try {

      const token =
        localStorage.getItem('adminToken')

      const response = await fetch(
        `${apiUrl}/api/orders/admin/all`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`
          }
        }
      )

      const data =
        await response.json()

      if (data.success) {
        setOrders(data.orders || [])
      }

    } catch (err) {
      console.log(err)
    }
  }


  const loadCosts = async () => {

    try {

      const token =
        localStorage.getItem('adminToken')

      const response = await fetch(
        `${apiUrl}/api/costs?date=${selectedDate}`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`
          }
        }
      )

      const data =
        await response.json()

      if (data.success) {

        setCosts(data.costs || {})

        const initialEditingCosts = {}

        Object.entries(data.costs || {}).forEach(
          ([productId, data]) => {
            initialEditingCosts[productId] =
              data.costPrice
          }
        )

        setEditingCosts(initialEditingCosts)
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
        sum +
        Number(
          order.boiledEggs || 0
        ),
      0
    )


  const totalBhurji =
    filteredOrders.reduce(
      (sum, order) =>
        sum +
        Number(
          order.eggBhurji || 0
        ),
      0
    )


  const getAddonQuantity = (
    order,
    addonId
  ) => {

    let addonsObj = {}

    if (
      typeof order.addons ===
      'string'
    ) {

      try {
        addonsObj =
          JSON.parse(
            order.addons || '{}'
          )
      } catch {
        addonsObj = {}
      }

    } else {

      addonsObj =
        order.addons || {}

    }

    return Number(
      addonsObj[addonId] || 0
    )
  }


  const getAddonTotal = (
    addonId
  ) => {

    return filteredOrders.reduce(
      (sum, order) =>
        sum +
        getAddonQuantity(
          order,
          addonId
        ),
      0
    )
  }


  const totalRevenue =
    filteredOrders.reduce(
      (sum, order) =>
        sum +
        Number(
          order.totalAmount || 0
        ),
      0
    )


  const getSellingPrice = (
    product
  ) => {

    return Number(
      product.price || 0
    )
  }


  const getCostPrice = (
    productId
  ) => {

    if (
      costs[productId]
    ) {
      return Number(
        costs[productId].costPrice
      )
    }

    return 0
  }


  const getProfit = (
    quantity,
    sellingPrice,
    costPrice
  ) => {

    return (
      Number(quantity || 0) *
      (
        Number(sellingPrice || 0) -
        Number(costPrice || 0)
      )
    )
  }


  const getProductData = () => {

    const products = [

      {
        id: 'boiledEggs',
        name: '🥚 Eggs',
        quantity: totalEggs,
        sellingPrice: 11
      },

      {
        id: 'eggBhurji',
        name: '🍛 Bhurji',
        quantity: totalBhurji,
        sellingPrice: 35
      }

    ]

    addOns.forEach(addon => {

      products.push({
        id: addon.id,
        name: addon.name,
        quantity:
          getAddonTotal(addon.id),
        sellingPrice:
          getSellingPrice(addon)
      })

    })

    return products
  }


  const products =
    getProductData()


  const totalProfit =
    products.reduce(
      (sum, product) =>
        sum +
        getProfit(
          product.quantity,
          product.sellingPrice,
          getCostPrice(product.id)
        ),
      0
    )


  const toggleCard = (
    productId
  ) => {

    setOpenCards(prev => ({
      ...prev,
      [productId]:
        !prev[productId]
    }))
  }


  const handleCostChange = (
    productId,
    value
  ) => {

    setEditingCosts(prev => ({
      ...prev,
      [productId]: value
    }))
  }


  const saveCost = async (
    productId
  ) => {

    try {

      const token =
        localStorage.getItem(
          'adminToken'
        )

      const costPrice =
        Number(
          editingCosts[productId]
        )

      if (
        !Number.isFinite(costPrice) ||
        costPrice < 0
      ) {
        alert(
          'Enter a valid cost price'
        )
        return
      }

      setSavingCost(prev => ({
        ...prev,
        [productId]: true
      }))

      const response =
        await fetch(
          `${apiUrl}/api/costs`,
          {
            method: 'PUT',

            headers: {
              'Content-Type':
                'application/json',

              Authorization:
                `Bearer ${token}`
            },

            body: JSON.stringify({
              productId,
              costPrice,
              effectiveFrom:
                selectedDate
            })
          }
        )

      const data =
        await response.json()

      if (!data.success) {
        alert(
          data.message ||
          'Failed to save cost price'
        )
        return
      }

      await loadCosts()

      alert(
        'Cost price saved successfully'
      )

    } catch (err) {

      console.log(err)

      alert(
        'Failed to save cost price'
      )

    } finally {

      setSavingCost(prev => ({
        ...prev,
        [productId]: false
      }))

    }
  }


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
        onChange={e =>
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

        {products.map(product => {

          const costPrice =
            getCostPrice(
              product.id
            )

          const profit =
            getProfit(
              product.quantity,
              product.sellingPrice,
              costPrice
            )

          return (

            <div
              key={product.id}
              style={cardStyle}
            >

              <div
                onClick={() =>
                  toggleCard(
                    product.id
                  )
                }
                style={{
                  cursor: 'pointer'
                }}
              >

                <h2>
                  {product.name}
                </h2>

                <h1>
                  {product.quantity}
                </h1>

                <p
                  style={{
                    opacity: 0.7
                  }}
                >
                  ▼ Pricing
                </p>

              </div>


              {openCards[
                product.id
              ] && (

                <div
                  style={{
                    marginTop: '20px',
                    paddingTop: '20px',
                    borderTop:
                      '1px solid #475569'
                  }}
                >

                  <p>
                    <strong>
                      Selling Price:
                    </strong>{' '}
                    ₹
                    {product.sellingPrice}
                  </p>


                  <p>
                    <strong>
                      Cost Price:
                    </strong>
                  </p>


                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={
                      editingCosts[
                        product.id
                      ] ??
                      costPrice
                    }
                    onChange={e =>
                      handleCostChange(
                        product.id,
                        e.target.value
                      )
                    }
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '8px',
                      border: 'none',
                      marginBottom: '10px'
                    }}
                  />


                  <button
                    onClick={() =>
                      saveCost(
                        product.id
                      )
                    }
                    disabled={
                      savingCost[
                        product.id
                      ]
                    }
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }}
                  >

                    {savingCost[
                      product.id
                    ]
                      ? 'Saving...'
                      : 'Save CP'}

                  </button>


                  <p>
                    <strong>
                      Revenue:
                    </strong>{' '}
                    ₹
                    {(
                      product.quantity *
                      product.sellingPrice
                    ).toFixed(2)}
                  </p>


                  <p
                    style={{
                      color:
                        profit >= 0
                          ? '#00ff99'
                          : '#ff5555'
                    }}
                  >
                    <strong>
                      Profit:
                    </strong>{' '}
                    ₹
                    {profit.toFixed(2)}
                  </p>

                </div>

              )}

            </div>

          )

        })}


        <div style={cardStyle}>

          <h2>
            💰 Revenue
          </h2>

          <h1>
            ₹
            {totalRevenue}
          </h1>

        </div>


        <div style={cardStyle}>

          <h2>
            📈 Profit
          </h2>

          <h1>
            ₹
            {totalProfit.toFixed(2)}
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
  textAlign: 'center'
}


export default Sales