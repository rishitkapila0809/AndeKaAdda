function NotificationBanner({
  message,
  type
}) {

  if (!message) {
    return null
  }

  return (
    <div
      className={`notification-banner ${type}`}
    >
      <span>
        {type === 'success' ? '✓' : '✕'}
      </span>

      {message}
    </div>
  )
}

export default NotificationBanner