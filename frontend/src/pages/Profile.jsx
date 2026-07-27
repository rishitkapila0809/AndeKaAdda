import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Profile({
  apiUrl,
  showNotification
}) {

  const navigate = useNavigate()

  const [customer, setCustomer] = useState(null)
  const [name, setName] = useState('')
  const [blockName, setBlockName] = useState('')
  const [roomNumber, setRoomNumber] = useState('')

  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const phoneNumber =
    localStorage.getItem('customerPhone')

  useEffect(() => {

    if (!phoneNumber) {
      navigate('/login')
      return
    }

    const fetchProfile = async () => {

      try {

        const response = await fetch(
          `${apiUrl}/api/customers/${phoneNumber}`
        )

        const data = await response.json()

        if (data.success) {

          setCustomer(data.customer)

          setName(data.customer.name || '')
          setBlockName(
            data.customer.blockName || ''
          )
          setRoomNumber(
            data.customer.roomNumber || ''
          )

        } else {

          alert('Customer profile not found')
          navigate('/')

        }

      } catch (err) {

        console.log(err)
        alert('Unable to load profile')

      } finally {

        setLoading(false)

      }

    }

    fetchProfile()

  }, [apiUrl, phoneNumber, navigate])


  const saveProfile = async () => {

    if (
      !name.trim() ||
      !blockName.trim() ||
      !roomNumber.trim()
    ) {
      alert('Please fill all details')
      return
    }

    setSaving(true)

    try {

      const response = await fetch(
        `${apiUrl}/api/customers/${phoneNumber}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name,
            blockName,
            roomNumber
          })
        }
      )

      const data = await response.json()

      if (data.success) {

  setCustomer(data.customer)

  setEditing(false)

  showNotification(
    'Profile updated successfully',
    'success'
  )

} else {

  alert(data.message)

}

    } catch (err) {

      console.log(err)
      alert('Unable to save profile')

    } finally {

      setSaving(false)

    }

  }


  if (loading) {
    return (
      <div className="profile-page">
        Loading profile...
      </div>
    )
  }

  if (!customer) {
    return null
  }


  return (
    <div className="profile-page">

      <div className="profile-card">

        <h1><b>My Profile</b></h1>

        <div className="profile-field">

          <label>Name</label>

          {editing ? (
            <input
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
            />
          ) : (
            <p>{customer.name}</p>
          )}

        </div>


        <div className="profile-field">

          <label>Phone Number</label>

          <p>{customer.phoneNumber}</p>

        </div>


        <div className="profile-field">

          <label>Block</label>

          {editing ? (
            <input
              value={blockName}
              onChange={(e) =>
                setBlockName(e.target.value)
              }
            />
          ) : (
            <p>{customer.blockName}</p>
          )}

        </div>


        <div className="profile-field">

          <label>Room Number</label>

          {editing ? (
            <input
              value={roomNumber}
              onChange={(e) =>
                setRoomNumber(e.target.value)
              }
            />
          ) : (
            <p>{customer.roomNumber}</p>
          )}

        </div>


        {editing ? (

          <div className="profile-actions">

            <button
              onClick={saveProfile}
              disabled={saving}
            >
              {saving
                ? 'Saving...'
                : 'Save Changes'}
            </button>

            <button
              onClick={() => {

                setName(customer.name || '')

                setBlockName(
                  customer.blockName || ''
                )

                setRoomNumber(
                  customer.roomNumber || ''
                )

                setEditing(false)

              }}
            >
              Cancel
            </button>

          </div>

        ) : (

          <button
            className="edit-profile-btn"
            onClick={() =>
              setEditing(true)
            }
          >
            Edit Profile
          </button>

        )}

      </div>

    </div>
  )
}

export default Profile