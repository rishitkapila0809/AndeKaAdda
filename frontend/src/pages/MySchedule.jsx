function MySchedule() {
  return (
    <div className="coming-page">

      <div className="coming-card">

        <div className="coming-egg">
          🥚
        </div>

        <div className="coming-badge">
          COMING SOON
        </div>

        <h1>My Schedule</h1>

        <h2>
          Your eggs, on your schedule.
        </h2>

        <p className="coming-description">
          Set your egg quantity and preferred
          delivery time slot once, and we'll
          remember it for the next 7 days.
        </p>

        <div className="coming-features">

          <div>
            <span>📅</span>
            <p>7-Day Schedule</p>
          </div>

          <div>
            <span>🥚</span>
            <p>Fixed Quantity</p>
          </div>

          <div>
            <span>⏰</span>
            <p>Delivery Time Slot</p>
          </div>

        </div>

        <p className="coming-small">
          Soon you'll also be able to skip a day,
          edit your schedule and track each
          scheduled delivery.
        </p>

      </div>

    </div>
  )
}

export default MySchedule