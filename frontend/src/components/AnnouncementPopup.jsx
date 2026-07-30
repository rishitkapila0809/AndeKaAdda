// import eggMascot from "../assets/egg-announcement.png";




export default function AnnouncementPopup({
  onClose
}) {

  // const handleFeedbackClick = () => {
  //   window.open(
  //     "https://docs.google.com/forms/d/e/1FAIpQLSfP1ERDIzKSxXnA9gGcCQCwS8ikxAubKNHH_b_Y7CYVcV2u4Q/viewform?usp=header",
  //     "_blank"
  //   );

  //   onClose();
  // };


  return (
    <div className="announcement-overlay">

      <div className="announcement-card">

        <button
          className="announcement-close"
          onClick={onClose}
        >
          ✕
        </button>


        {/* <img
          src={eggMascot}
          alt="Egg Mascot"
          className="announcement-mascot"
        /> */}


        <h2>
          Seasonings Are Here!
        </h2>

        <p>
          Add some extra flavour to your eggs.
        </p>


        <p className="announcement-note">

          <b>
            Salt Sachets are now available
            for just ₹1 each.
          </b>

          <br />
          <br />

          You can add them directly from your
          <b> Order Summary</b> before placing
          your order.

          <br />
          <br />

          And there's more on the way...

          <br />
          <br />

          <b>Peri Peri Masala</b>
          {' — '}
          Coming Soon

          <br />

          <b>Chaat Masala</b>
          {' — '}
          Coming Soon

        </p>


        <button
          className="announcement-btn"
          onClick={onClose}
        >
          Got It
        </button>


        {/*
        OLD FEEDBACK FORM ANNOUNCEMENT

        <h2>
          Help Us Improve AndeKaAdda
        </h2>

        <p>
          We're working on eggciting improvements,
          and we'd love to hear your feedback.
        </p>

        <p className="announcement-note">

          Your feedback helps us improve
          AndeKaAdda and build features
          that you'll actually love.

          <br />
          <br />

          It only takes <b>2 minutes.</b>

        </p>

        <button
          className="announcement-btn"
          onClick={handleFeedbackClick}
        >
          Fill Feedback Form
        </button>
        */}

      </div>

    </div>
  )
}