import { useEffect, useState } from 'react'
import socket from '../socket'
import './Settings.css'
import { addOns } from '../components/AddOns'

function Settings({ apiUrl }) {

  const [
    isOrderingEnabled,
    setIsOrderingEnabled
  ] = useState(false)

  const [
    isMaintenanceEnabled,
    setIsMaintenanceEnabled
  ] = useState(false)

  const [
  productStock,
  setProductStock
] = useState({})


  const loadSettings = async () => {

    try {

      const [
  orderingResponse,
  maintenanceResponse,
  productStockResponse
] = await Promise.all([
  fetch(
    `${apiUrl}/api/orders/ordering-status`
  ),
  fetch(
    `${apiUrl}/api/orders/maintenance-status`
  ),
  fetch(
    `${apiUrl}/api/orders/product-stock`
  )
])

      const orderingData =
        await orderingResponse.json()

      const maintenanceData =
        await maintenanceResponse.json()

        const productStockData =
  await productStockResponse.json()

      if (orderingData.success) {
        setIsOrderingEnabled(
          orderingData.isOrderingEnabled
        )
      }

      if (maintenanceData.success) {
        setIsMaintenanceEnabled(
          maintenanceData.isMaintenanceEnabled
        )
      }

      if (productStockData.success) {
  setProductStock(
    productStockData.productStock || {}
  )
}

    } catch (err) {

      console.log(err)

    }

  }


  useEffect(() => {

    loadSettings()

    const handleSettingsUpdate = () => {
      loadSettings()
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

  }, [])


  const toggleOrdering = async () => {

    try {

      const token =
        localStorage.getItem('adminToken')

      const response = await fetch(
        `${apiUrl}/api/orders/ordering-status`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            isOrderingEnabled:
              !isOrderingEnabled
          })
        }
      )

      const data = await response.json()

      if (!data.success) {
        alert(
          data.message ||
          'Failed to update ordering'
        )
      }

    } catch (err) {

      console.log(err)

    }

  }


  const toggleMaintenance = async () => {

    try {

      const token =
        localStorage.getItem('adminToken')

      const response = await fetch(
        `${apiUrl}/api/orders/maintenance-status`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            isMaintenanceEnabled:
              !isMaintenanceEnabled
          })
        }
      )

      const data = await response.json()

      if (!data.success) {
        alert(
          data.message ||
          'Failed to update maintenance mode'
        )
      }

    } catch (err) {

      console.log(err)

    }

  }

    const toggleProductStock = async (
    productId
  ) => {

    try {

      const token =
        localStorage.getItem('adminToken')

      const currentStock =
        productStock[productId] !== false

      const response = await fetch(
        `${apiUrl}/api/orders/product-stock`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            productId,
            inStock: !currentStock
          })
        }
      )

      const data = await response.json()

      if (!data.success) {
        alert(
          data.message ||
          'Failed to update product stock'
        )
      }

    } catch (err) {

      console.log(err)

    }

  }


  return (
    <div className="settings-page">

      <h1>Settings</h1>

      <div className="settings-card">

        <div className="settings-info">

          <h2>Ordering</h2>

          <p>
            Customer ordering is currently{' '}
            <strong
              className={
                isOrderingEnabled
                  ? 'settings-on'
                  : 'settings-off'
              }
            >
              {isOrderingEnabled
                ? 'OPEN'
                : 'CLOSED'}
            </strong>
          </p>

        </div>

        <button
          className={
            isOrderingEnabled
              ? 'settings-action danger'
              : 'settings-action success'
          }
          onClick={toggleOrdering}
        >
          {isOrderingEnabled
            ? 'Close Orders'
            : 'Open Orders'}
        </button>

      </div>


      <div className="settings-card">

        <div className="settings-info">

          <h2>Maintenance Mode</h2>

          <p>
            Website is currently{' '}
            <strong
              className={
                isMaintenanceEnabled
                  ? 'settings-off'
                  : 'settings-on'
              }
            >
              {isMaintenanceEnabled
                ? 'OFFLINE'
                : 'LIVE'}
            </strong>
          </p>

        </div>

        <button
          className={
            isMaintenanceEnabled
              ? 'settings-action success'
              : 'settings-action danger'
          }
          onClick={toggleMaintenance}
        >
          {isMaintenanceEnabled
            ? 'Disable Maintenance'
            : 'Enable Maintenance'}
        </button>

      </div>

      <h2>Inventory</h2>

            <div className="settings-card">

        <div className="settings-info">

          <h2>Boiled Eggs</h2>

          <p>
            Product is currently{' '}
            <strong
              className={
                productStock.boiledEggs === false
                  ? 'settings-off'
                  : 'settings-on'
              }
            >
              {productStock.boiledEggs === false
                ? 'OUT OF STOCK'
                : 'IN STOCK'}
            </strong>
          </p>

        </div>

        <button
          className={
            productStock.boiledEggs === false
              ? 'settings-action success'
              : 'settings-action danger'
          }
          onClick={() =>
            toggleProductStock('boiledEggs')
          }
        >
          {productStock.boiledEggs === false
            ? 'Mark In Stock'
            : 'Mark Out of Stock'}
        </button>

      </div>


      <div className="settings-card">

        <div className="settings-info">

          <h2>Egg Bhurji</h2>

          <p>
            Product is currently{' '}
            <strong
              className={
                productStock.eggBhurji === false
                  ? 'settings-off'
                  : 'settings-on'
              }
            >
              {productStock.eggBhurji === false
                ? 'OUT OF STOCK'
                : 'IN STOCK'}
            </strong>
          </p>

        </div>

        <button
          className={
            productStock.eggBhurji === false
              ? 'settings-action success'
              : 'settings-action danger'
          }
          onClick={() =>
            toggleProductStock('eggBhurji')
          }
        >
          {productStock.eggBhurji === false
            ? 'Mark In Stock'
            : 'Mark Out of Stock'}
        </button>

      </div>


      <h2>Add Ons</h2>

{addOns.map(addon => {

  const isInStock =
    productStock[addon.id] !== false

  return (
    <div
      className="settings-card"
      key={addon.id}
    >

      <div className="settings-info">

        <h2>{addon.name}</h2>

        <p>
          Product is currently{' '}
          <strong
            className={
              isInStock
                ? 'settings-on'
                : 'settings-off'
            }
          >
            {isInStock
              ? 'IN STOCK'
              : 'OUT OF STOCK'}
          </strong>
        </p>

      </div>

      <button
        className={
          isInStock
            ? 'settings-action danger'
            : 'settings-action success'
        }
        onClick={() =>
          toggleProductStock(addon.id)
        }
      >
        {isInStock
          ? 'Mark Out of Stock'
          : 'Mark In Stock'}
      </button>

    </div>
  )
})}



    </div>
  )
}

export default Settings