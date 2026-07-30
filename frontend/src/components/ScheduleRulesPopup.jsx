function ScheduleRulesPopup({
  onClose,
  onAgree,
  activationMode = false
}) {

  return (
    <div className="schedule-rules-overlay">

      <div className="schedule-rules-card">

        <button
          className="schedule-rules-close"
          onClick={onClose}
        >
          ✕
        </button>

        <h2>   My Schedule Rules</h2>

        <p className="schedule-rules-intro">
          Please read these rules carefully before
          using My Schedule.
        </p>

        <div className="schedule-rules-list">

          <p>
            <strong>1.</strong> The current FREE
            My Schedule includes{' '}
            <strong>7 scheduled delivery days.</strong>
          </p>

          <p>
            <strong>2.</strong> Quantity, delivery
            slot and skipping a delivery can only
            be changed <strong>before 5:30 PM</strong>.
          </p>

          <p>
            <strong>3.</strong> After 5:30 PM, your
            schedule is locked for that day's
            delivery. Changes can be made again
            after <strong>12:00 AM</strong> for the
            next delivery.
          </p>

          <p>
            <strong>4.</strong> If you forget to
            edit or skip your delivery before
            5:30 PM, it will continue according
            to the schedule saved at the deadline.
          </p>

          <p>
            <strong>5.</strong> Delivery slots are
            estimated time windows and do not
            guarantee delivery at an exact minute.
          </p>

          <p>
            <strong>6.</strong> A delivery that you
            choose to skip will still count as one
            of your 7 scheduled delivery days.
          </p>

          <p>
            <strong>7.</strong> If AndeKaAdda pauses
            scheduled deliveries, that day will
            <strong> not</strong> be deducted from
            your 7 scheduled delivery days.
          </p>

          <p>
            <strong>8.</strong> Please ensure your
            schedule and delivery details are
            correct before the daily deadline.
          </p>

          <p>
            <strong>9.</strong> Scheduled deliveries
            must be paid for when required.
            Repeated failure to accept or pay for
            scheduled deliveries may result in
            your My Schedule access being
            suspended.
          </p>

          <p>
            <strong>10.</strong> AndeKaAdda may
            temporarily pause scheduled deliveries
            when the service is unavailable. Your
            remaining deliveries will continue
            when the service resumes.
          </p>

          <p>
            <strong>11.</strong> My Schedule rules
            and availability may be updated as
            the feature develops.
          </p>

        </div>

        {activationMode ? (

          <button
            className="schedule-agree-btn"
            onClick={onAgree}
          >
            I Agree & Activate Schedule
          </button>

        ) : (

          <button
            className="schedule-agree-btn"
            onClick={onClose}
          >
            Close
          </button>

        )}

      </div>

    </div>
  )
}

export default ScheduleRulesPopup