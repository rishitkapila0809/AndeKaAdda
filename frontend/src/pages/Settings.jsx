import { useEffect, useState } from 'react'
import socket from '../socket'
import './Settings.css'

function Settings({ apiUrl }) {

  const [
    isOrderingEnabled,
    setIsOrderingEnabled
  ] = useState(false)

  const [
    isMaintenanceEnabled,
    setIsMaintenanceEnabled
  ] = useState(false)


  const loadSettings = async () => {

    try {

      const [
        orderingResponse,
        maintenanceResponse
      ] = await Promise.all([
        fetch(
          `${apiUrl}/api/orders/ordering-status`
        ),
        fetch(
          `${apiUrl}/api/orders/maintenance-status`
        )
      ])

      const orderingData =
        await orderingResponse.json()

      const maintenanceData =
        await maintenanceResponse.json()

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

    </div>
  )
}

export default Settings