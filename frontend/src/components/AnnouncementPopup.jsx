import eggMascot from '../assets/egg-announcement.png'

function AnnouncementPopup({ onClose }) {

  return (

    <div className="announcement-overlay">

      <div className="announcement-card">

        <div className="announcement-header">

  <img
    src={eggMascot}
    alt="Egg Mascot"
    className="announcement-mascot"
  />

  <h2>Price Update</h2>

</div>

        <p>
          The price of <b>Boiled Eggs</b> has been updated.
        </p>

        <div className="announcement-price">

          <span className="old-price">
            ₹10
          </span>

          →

          <span className="new-price">
            ₹11
          </span>

          <span>
            per egg
          </span>

        </div>

        <hr />

        <p className="announcement-note">

           <span style={{ color: 'white', fontWeight: 'bold' }}>
            Don't worry!
        </span>

          <br /><br />

          We're bringing
          <b> subscription plans </b>
          very soon that will help you
          enjoy lower egg prices and
          save more on every order.

        </p>

        <button
          className="announcement-btn"
          onClick={onClose}
        >
          Got it
        </button>

      </div>

    </div>

  )

}

export default AnnouncementPopup