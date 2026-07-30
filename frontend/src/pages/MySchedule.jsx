import {
  useEffect,
  useState
} from 'react'

import { useNavigate } from 'react-router-dom'
import ScheduleRulesPopup from '../components/ScheduleRulesPopup'

import {
  Gift,
  LockKeyhole,
  Pencil,
  SkipForward,
  History,
  ChevronDown,
  ChevronUp,
  Info,
  CheckCircle2
} from 'lucide-react'

import scheduleMascot from '../assets/schedule-mascot.PNG'

import NotificationBanner from '../components/NotificationBanner'

function MySchedule({ apiUrl }) {

  const navigate = useNavigate()

  const [schedule, setSchedule] =
    useState(null)



  const [history, setHistory] =
    useState([])

  const [eggQuantity, setEggQuantity] =
    useState(2)

  const [timeSlot, setTimeSlot] =
    useState('6:30 PM - 7:00 PM')

  const [loading, setLoading] =
    useState(true)

  const [creating, setCreating] =
    useState(false)

  const [showRules, setShowRules] =
    useState(false)

  const [activationMode, setActivationMode] =
    useState(false)

    const [notification, setNotification] =
  useState({
    message: '',
    type: ''
  })

  const [showHistory, setShowHistory] =
    useState(false)

    const [editing, setEditing] =
  useState(false)

const [saving, setSaving] =
  useState(false)

  const [showSkipConfirm, setShowSkipConfirm] =
  useState(false)

const [skipping, setSkipping] =
  useState(false)

  const phoneNumber =
    localStorage.getItem('customerPhone')


  const isLocked = () => {

    const now = new Date()

    const hours = now.getHours()
    const minutes = now.getMinutes()

    return (
      hours > 17 ||
      (hours === 17 && minutes >= 30)
    )
  }

  const locked = isLocked()


const getIndiaDateKey = (date) => {

  return new Intl.DateTimeFormat(
    'en-CA',
    {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }
  ).format(new Date(date))

}

const todayKey =
  getIndiaDateKey(new Date())

const todayScheduleDay =
  history.find(day =>
    getIndiaDateKey(
      day.scheduleDate
    ) === todayKey
  )

const skippedToday =
  todayScheduleDay?.status
    ?.toLowerCase() === 'skipped'


  const loadSchedule = async () => {

    if (!phoneNumber) {

      setLoading(false)
      return

    }

    try {

      const response = await fetch(
        `${apiUrl}/api/schedules/${phoneNumber}`
      )

      const data = await response.json()

      if (data.success) {

        setSchedule(data.schedule)

        setHistory(
          data.history || []
        )

        if (data.schedule) {

          setEggQuantity(
            Number(
              data.schedule.eggQuantity
            )
          )

          setTimeSlot(
            data.schedule.timeSlot
          )

        }

      }

    } catch (err) {

      console.log(err)

    } finally {

      setLoading(false)

    }

  }


  useEffect(() => {

    loadSchedule()

  }, [])


  const handleCreateClick = () => {

    if (locked) {
      return
    }

    setActivationMode(true)
    setShowRules(true)

  }


  const activateSchedule = async () => {

    try {

      setCreating(true)

      const response = await fetch(
        `${apiUrl}/api/schedules/create`,
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json'
          },

          body: JSON.stringify({
            phoneNumber,
            eggQuantity,
            timeSlot
          })
        }
      )

      const data = await response.json()

      if (data.success) {

        setShowRules(false)
        setActivationMode(false)

        await loadSchedule()




      } else {

        alert(data.message)

      }

    } catch (err) {

      console.log(err)

      alert(
        'Unable to activate schedule'
      )

    } finally {

      setCreating(false)

    }

  }

  const saveScheduleChanges = async () => {

  try {

    setSaving(true)

    const response = await fetch(
      `${apiUrl}/api/schedules/${phoneNumber}`,
      {
        method: 'PUT',

        headers: {
          'Content-Type': 'application/json'
        },

        body: JSON.stringify({
          eggQuantity,
          timeSlot
        })
      }
    )

    const data = await response.json()

    if (data.success) {

      setSchedule(data.schedule)
      setEditing(false)

      setNotification({
  message: 'Schedule updated successfully.',
  type: 'success'
})

setTimeout(() => {

  setNotification({
    message: '',
    type: ''
  })

}, 3000)

      
    } else {

      alert(data.message)

    }

  } catch (err) {

    console.log(err)

    alert('Unable to update schedule')

  } finally {

    setSaving(false)

  }

}

const skipDelivery = async () => {

  try {

    setSkipping(true)

    const response = await fetch(
      `${apiUrl}/api/schedules/${phoneNumber}/skip`,
      {
        method: 'POST'
      }
    )

    const data = await response.json()

    if (data.success) {

      setShowSkipConfirm(false)

      await loadSchedule()

      setNotification({
  message: 'Schedule created successfully.',
  type: 'success'
})

setTimeout(() => {

  setNotification({
    message: '',
    type: ''
  })

}, 3000)

    } else {

      alert(data.message)

    }

  } catch (err) {

    console.log(err)

    alert('Unable to skip delivery')

  } finally {

    setSkipping(false)

  }

}

  const getStatusClass = (status) => {

    return String(status)
      .toLowerCase()
      .replaceAll(' ', '-')

  }


  if (!phoneNumber) {

    return (
      <div className="schedule-page">

        <NotificationBanner
  message={notification.message}
  type={notification.type}
/>

        <div className="schedule-main-card">

          <h1>🥚 My Schedule</h1>

          <p>
            Please login or create an account
            to use My Schedule.
          </p>

          <button
            className="schedule-primary-btn"
            onClick={() =>
              navigate('/login', {
                state: {
                  redirectTo: '/schedule'
                }
              })
            }
          >
            Login / Sign Up
          </button>

        </div>

      </div>
    )

  }


  if (loading) {

    return (
      <div className="schedule-page">

        <div className="schedule-main-card">

          <p>Loading your schedule...</p>

        </div>

      </div>
    )

  }


  return (
    <div className="schedule-page">

      <div className="schedule-main-card">

  <div className="schedule-title">

  <img
    src={scheduleMascot}
    alt="AndeKaAdda Schedule"
    className="schedule-title-image"
  />

  <div className="schedule-title-text">
    <h1>My Schedule</h1>
    <p>Set it once. We'll remember it.</p>
  </div>

</div>


        <div className="schedule-free-banner">

          <strong className="schedule-banner-title">
  <Gift size={17} />
  7-Day Schedule — FREE
</strong>

          <span>
            7 deliveries included • No subscription required
          </span>

        </div>


        {locked && (

          <div className="schedule-lock-message">

            <div className="schedule-lock-title">
  <LockKeyhole size={17} />

  <strong>
    Schedule locked for today
  </strong>
</div>

            <span>
              Changes are closed after 5:30 PM.
              You can make changes again after
              12:00 AM for tomorrow's delivery.
            </span>

          </div>

        )}


        {!schedule ? (

          <>

            <div className="schedule-create-section">

              <h2>
                Create Your Schedule
              </h2>

              <p>
                Choose your daily egg quantity
                and preferred delivery slot.
              </p>


              <div className="schedule-field">

                <label>
                  Daily Egg Quantity
                </label>

                <select
                  value={eggQuantity}
                  disabled={locked}
                  onChange={(e) =>
                    setEggQuantity(
                      Number(e.target.value)
                    )
                  }
                >

                  {[
                    ...Array(19).keys()
                  ].map(index => {

                    const quantity =
                      index + 2

                    return (
                      <option
                        key={quantity}
                        value={quantity}
                      >
                        {quantity} Eggs
                      </option>
                    )

                  })}

                </select>

              </div>


              <div className="schedule-field">

                <label>
                  Preferred Delivery Slot
                </label>

                <select
                  value={timeSlot}
                  disabled={locked}
                  onChange={(e) =>
                    setTimeSlot(
                      e.target.value
                    )
                  }
                >

                  <option value="6:30 PM - 7:00 PM">
                    6:30 PM – 7:00 PM
                  </option>

                  <option value="7:00 PM - 7:30 PM">
                    7:00 PM – 7:30 PM
                  </option>

                  <option value="7:30 PM - 8:00 PM">
                    7:30 PM – 8:00 PM
                  </option>

                </select>

              </div>


              <button
                className="schedule-primary-btn"
                disabled={
                  locked ||
                  creating
                }
                onClick={
                  handleCreateClick
                }
              >
                Activate My Schedule
              </button>

            </div>

          </>

        ) : (

          <>

            <div className="active-schedule-header">

              <div>

                <span className="active-dot">
                  ●
                </span>

                <strong>
                  {schedule.status}
                </strong>

              </div>

              <span>
                {schedule.scheduleType ===
                'free_trial'
                  ? 'FREE'
                  : schedule.scheduleType}
              </span>

            </div>


            {editing ? (

  <div className="schedule-edit-section">

    <div className="schedule-field">

      <label>
        Daily Egg Quantity
      </label>

      <select
        value={eggQuantity}
        onChange={(e) =>
          setEggQuantity(
            Number(e.target.value)
          )
        }
      >

        {[...Array(19).keys()].map(
          index => {

            const quantity =
              index + 2

            return (
              <option
                key={quantity}
                value={quantity}
              >
                {quantity} Eggs
              </option>
            )

          }
        )}

      </select>

    </div>


    <div className="schedule-field">

      <label>
        Delivery Slot
      </label>

      <select
        value={timeSlot}
        onChange={(e) =>
          setTimeSlot(
            e.target.value
          )
        }
      >

        <option value="6:30 PM - 7:00 PM">
          6:30 PM – 7:00 PM
        </option>

        <option value="7:00 PM - 7:30 PM">
          7:00 PM – 7:30 PM
        </option>

        <option value="7:30 PM - 8:00 PM">
          7:30 PM – 8:00 PM
        </option>

      </select>

    </div>


    <div className="schedule-edit-actions">

      <button
        className="schedule-cancel-btn"
        onClick={() => {

          setEggQuantity(
            Number(schedule.eggQuantity)
          )

          setTimeSlot(
            schedule.timeSlot
          )

          setEditing(false)

        }}
      >
        Cancel
      </button>

      <button
        className="schedule-save-btn"
        onClick={
          saveScheduleChanges
        }
        disabled={saving}
      >
        {saving
          ? 'Saving...'
          : 'Save Changes'}
      </button>

    </div>

  </div>

) : (

  <div className="schedule-details-grid">

    <div>
      <span>
        Daily Quantity
      </span>

      <strong>
        {schedule.eggQuantity} Eggs
      </strong>
    </div>

    <div>
      <span>
        Delivery Slot
      </span>

      <strong>
        {schedule.timeSlot}
      </strong>
    </div>

  </div>

)}


            <div className="schedule-progress">

              <div className="schedule-progress-top">

                <span>
                  Schedule Progress
                </span>

                <strong>
                  {schedule.usedDeliveries}
                  {' / '}
                  {schedule.totalDeliveries}
                </strong>

              </div>

              <div className="schedule-progress-bar">

                <div
                  style={{
                    width:
                      `${
                        Math.min(
                          100,
                          (
                            schedule.usedDeliveries /
                            schedule.totalDeliveries
                          ) * 100
                        )
                      }%`
                  }}
                />

              </div>

              <p>
                {
                  Math.max(
                    0,
                    schedule.totalDeliveries -
                    schedule.usedDeliveries
                  )
                } scheduled deliveries remaining
              </p>

            </div>


            <div className="schedule-actions">

<button
  disabled={locked || editing}
  onClick={() =>
    setEditing(true)
  }
>
  <Pencil size={15} />
  Edit Schedule
</button>

<button
  className={
    skippedToday
      ? 'schedule-skip-btn already-skipped'
      : 'schedule-skip-btn'
  }
  disabled={
    locked ||
    editing ||
    skippedToday
  }
  onClick={() => {

  if (skippedToday) {
    alert(
      'Today’s delivery has already been skipped'
    )
    return
  }

  setShowSkipConfirm(true)

}}
>

  {skippedToday ? (
    <>
      <CheckCircle2 size={15} />
      Skipped for Today
    </>
  ) : (
    <>
      <SkipForward size={15} />
      Skip Delivery
    </>
  )}

</button>

            </div>


            <div className="schedule-history">

              <button
                className="schedule-history-toggle"
                onClick={() =>
                  setShowHistory(
                    !showHistory
                  )
                }
              >

                <span className="history-title">
  <History size={16} />
  Delivery History
</span>

                {showHistory
  ? <ChevronUp size={17} />
  : <ChevronDown size={17} />
}

              </button>


              {showHistory && (

                <div className="schedule-table-wrapper">

                  {history.length === 0 ? (

                    <p className="schedule-no-history">
                      No delivery history yet.
                    </p>

                  ) : (

                    <table className="schedule-table">

                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Qty</th>
                          <th>Slot</th>
                          <th>Status</th>
                        </tr>
                      </thead>

                      <tbody>

                        {history.map(day => (

                          <tr key={day.id}>

                            <td>
                              {new Date(
                                day.scheduleDate
                              ).toLocaleDateString(
                                'en-GB',
                                {
                                  day: 'numeric',
                                  month: 'short'
                                }
                              )}
                            </td>

                            <td>
                              {day.eggQuantity}
                            </td>

                            <td>
                              {day.timeSlot}
                            </td>

                            <td>

                              <span
                                className={
                                  `schedule-status ${getStatusClass(
                                    day.status
                                  )}`
                                }
                              >
                                {day.status}
                              </span>

                            </td>

                          </tr>

                        ))}

                      </tbody>

                    </table>

                  )}

                </div>

              )}

            </div>


            <button
              className="schedule-rules-link"
              onClick={() => {

                setActivationMode(false)
                setShowRules(true)

              }}
            >
              <Info size={15} />
<span>View My Schedule Rules</span>
            </button>

          </>

        )}

      </div>

{showSkipConfirm && (

  <div className="schedule-confirm-overlay">

    <div className="schedule-confirm-card">

      <div className="schedule-confirm-icon">
        <SkipForward size={24} />
      </div>

      <h2>
        Skip Today's Delivery?
      </h2>

      <p>
        Today's scheduled delivery will
        not be delivered.
      </p>

      <div className="schedule-confirm-warning">
        This will count as
        <strong> 1 of your 7 scheduled delivery days.</strong>
      </div>

      <div className="schedule-confirm-remaining">

        <span>
          Deliveries remaining after skipping
        </span>

        <strong>
          {Math.max(
            0,
            schedule.totalDeliveries -
            schedule.usedDeliveries -
            1
          )}
        </strong>

      </div>

      <div className="schedule-confirm-actions">

        <button
          className="schedule-confirm-cancel"
          disabled={skipping}
          onClick={() =>
            setShowSkipConfirm(false)
          }
        >
          Cancel
        </button>

        <button
          className="schedule-confirm-skip"
          disabled={skipping}
          onClick={skipDelivery}
        >
          {skipping
            ? 'Skipping...'
            : 'Yes, Skip Delivery'}
        </button>

      </div>

    </div>

  </div>

)}

      {showRules && (

        <ScheduleRulesPopup
          activationMode={
            activationMode
          }

          onClose={() => {

            setShowRules(false)
            setActivationMode(false)

          }}

          onAgree={
            activateSchedule
          }
        />

      )}

    </div>
  )
}

export default MySchedule