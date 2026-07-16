function FooterModal({

  open,

  title,

  children,

  onClose

}) {

  if (!open) return null

  return (

    <div className="footer-modal-overlay">

      <div className="footer-modal">

        <h2>{title}</h2>

        <div className="footer-modal-content">

          {children}

        </div>

        <button

          className="announcement-btn"

          onClick={onClose}

        >

          Close

        </button>

      </div>

    </div>

  )

}

export default FooterModal