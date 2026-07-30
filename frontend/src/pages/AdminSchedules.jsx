import {
  useEffect,
  useState
} from 'react'

import {
  CalendarDays,
  ChevronDown,
  ChevronUp,
  Clock,
  MapPin,
  Phone,
  PackageCheck
} from 'lucide-react'

function AdminSchedules({ apiUrl }) {

  const [schedules, setSchedules] =
    useState([])

  const [loading, setLoading] =
    useState(true)

  const [openHistory, setOpenHistory] =
    useState(null)

    const [updatingSchedule, setUpdatingSchedule] =
  useState(null)


  const loadSchedules = async () => {

    try {

      const response = await fetch(
        `${apiUrl}/api/schedules/admin/all`
      )

      const data =
        await response.json()

      if (data.success) {

        setSchedules(
          data.schedules
        )

      }

    } catch (err) {

      console.log(err)

    } finally {

      setLoading(false)

    }

  }

  const markDelivered = async (
  scheduleId
) => {

  try {

    setUpdatingSchedule(
      scheduleId
    )

    const response =
      await fetch(
        `${apiUrl}/api/schedules/admin/${scheduleId}/delivered`,
        {
          method: 'POST'
        }
      )

    const data =
      await response.json()


    if (data.success) {

      await loadSchedules()

    } else {

      alert(
        data.message
      )

    }


  } catch (err) {

    console.log(err)

    alert(
      'Unable to update delivery'
    )


  } finally {

    setUpdatingSchedule(null)

  }

}


  useEffect(() => {

    loadSchedules()

  }, [])


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


  const getTodayStatus = schedule => {

    const today =
      getIndiaDateKey(
        new Date()
      )

    const todayRecord =
      schedule.history.find(
        item =>
          getIndiaDateKey(
            item.scheduleDate
          ) === today
      )


    if (todayRecord) {

      return todayRecord.status

    }


    if (
      schedule.status !== 'Active'
    ) {

      return 'Stopped'

    }


    const indiaTime =
      new Date().toLocaleString(
        'en-US',
        {
          timeZone:
            'Asia/Kolkata',

          hour12: false,

          hour:
            '2-digit',

          minute:
            '2-digit'
        }
      )


    const [
      hours,
      minutes
    ] =
      indiaTime.split(':')
        .map(Number)


    if (
      hours > 18 ||
      (
        hours === 18 &&
        minutes >= 30
      )
    ) {

      return 'Pending'

    }


    return 'Upcoming'

  }


  const getStatusClass =
    status => {

      return status
        .toLowerCase()
        .replaceAll(' ', '-')

    }


  if (loading) {

    return (
      <div className="admin-schedules-page">
        Loading schedules...
      </div>
    )

  }


  return (

    <div className="admin-schedules-page">

      <div className="admin-schedules-heading">

        <div>

          <h1>
            Customer Schedules
          </h1>

          <p>
            Manage scheduled egg deliveries
          </p>

        </div>

        <div className="admin-schedule-count">

          <CalendarDays size={18} />

          {schedules.length}
          {' '}
          Schedules

        </div>

      </div>


      {schedules.length === 0 ? (

        <div className="admin-no-schedules">

          No customer schedules yet.

        </div>

      ) : (

        <div className="admin-schedules-list">

          {schedules.map(schedule => {

            const todayStatus =
              getTodayStatus(
                schedule
              )

            const historyOpen =
              openHistory ===
              schedule.id


            return (

  <div
    className="admin-schedule-card"
    key={schedule.id}
  >

    <div className="admin-schedule-top">

      <div>

        <h2>
          {schedule.name}
        </h2>

        <span>
          {schedule.blockName}
          -
          {schedule.roomNumber}
        </span>

      </div>

      <div className="admin-today-status">

        <span className="admin-today-status-label">
          TODAY'S STATUS
        </span>

        <span
          className={
            `admin-schedule-status ${getStatusClass(
              todayStatus
            )}`
          }
        >
          {todayStatus}
        </span>

      </div>

    </div>

                <div className="admin-schedule-info">

                  <div>

                    <PackageCheck
                      size={16}
                    />

                    <span>
                      Quantity
                    </span>

                    <strong>
                      {schedule.eggQuantity}
                      {' '}
                      Eggs
                    </strong>

                  </div>


                  <div>

                    <Clock
                      size={16}
                    />

                    <span>
                      Delivery Slot
                    </span>

                    <strong>
                      {schedule.timeSlot}
                    </strong>

                  </div>


                  <div>

                    <MapPin
                      size={16}
                    />

                    <span>
                      Room
                    </span>

                    <strong>
                      {schedule.blockName}
                      -
                      {schedule.roomNumber}
                    </strong>

                  </div>


                  <div>

                    <Phone
                      size={16}
                    />

                    <span>
                      Phone
                    </span>

                    <strong>
                      {schedule.phoneNumber}
                    </strong>

                  </div>

                </div>


                <div className="admin-schedule-progress">

                  <div>

                    <span>
                      Schedule Progress
                    </span>

                    <strong>
                      {schedule.usedDeliveries}
                      {' / '}
                      {schedule.totalDeliveries}
                    </strong>

                  </div>


                  {todayStatus === 'Pending' && (

  <button
    className="admin-mark-delivered-btn"

    disabled={
      updatingSchedule ===
      schedule.id
    }

    onClick={() =>
      markDelivered(
        schedule.id
      )
    }
  >

    <PackageCheck size={17} />

    {updatingSchedule ===
    schedule.id
      ? 'Updating...'
      : 'Mark as Delivered'
    }

  </button>

)}


                  <div className="admin-progress-track">

                    <div
                      className="admin-progress-fill"
                      style={{
                        width:
                          `${
                            (
                              schedule.usedDeliveries /
                              schedule.totalDeliveries
                            ) * 100
                          }%`
                      }}
                    />

                  </div>

                </div>


                <button
                  className="admin-history-toggle"
                  onClick={() =>
                    setOpenHistory(
                      historyOpen
                        ? null
                        : schedule.id
                    )
                  }
                >

                  Delivery History

                  {historyOpen
                    ? <ChevronUp size={17} />
                    : <ChevronDown size={17} />
                  }

                </button>


                {historyOpen && (

                  <div className="admin-schedule-history">

                    {schedule.history.length === 0 ? (

                      <p>
                        No delivery history yet.
                      </p>

                    ) : (

                      schedule.history.map(
                        item => (

                          <div
                            className="admin-history-row"
                            key={item.id}
                          >

                            <span>
                              {new Date(
                                item.scheduleDate
                              ).toLocaleDateString(
                                'en-IN',
                                {
                                  timeZone:
                                    'Asia/Kolkata',

                                  day:
                                    '2-digit',

                                  month:
                                    'short',

                                  year:
                                    'numeric'
                                }
                              )}
                            </span>

                            <span>
                              {item.eggQuantity}
                              {' '}
                              Eggs
                            </span>

                            <span>
                              {item.timeSlot}
                            </span>

                            <strong
                              className={
                                getStatusClass(
                                  item.status
                                )
                              }
                            >
                              {item.status}
                            </strong>

                          </div>

                        )
                      )

                    )}

                  </div>

                )}

              </div>

            )

          })}

        </div>

      )}

    </div>

  )

}

export default AdminSchedules