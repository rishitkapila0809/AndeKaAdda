// import './Maintenance.css'
// import maintenanceImage from '../assets/maintenance.PNG'

// function Maintenance() {
//   return (
//     <div className="maintenance-page">

//       <img
//         src={maintenanceImage}
//         alt="AndeKaAdda Maintenance"
//         className="maintenance-image"
//       />

//       <h1 className="maintenance-title">
//   Something <span>Eggciting</span><br /> is Coming!
// </h1>

//       <p className="maintenance-description">
//         The site is currently under maintenance
//         <br />
//         as we work on exciting improvements
//         <br />
//         We'll be back very soon!
//       </p>

//       <p className="maintenance-footer">
//         Thank you for your patience
//         <br />
//         and continued support.
//       </p>

//     </div>
//   )
// }

// export default Maintenance

import './Maintenance.css'
import maintenanceImage from '../assets/maintenance.PNG'

function Maintenance() {
  return (
    <div className="maintenance-page">

      <img
        src={maintenanceImage}
        alt="AndeKaAdda Maintenance"
        className="maintenance-image"
      />

      <h1 className="maintenance-title">
        Help Us Improve
        <br />
        <span>AndeKaAdda</span>
      </h1>

      <a
        href="https://docs.google.com/forms/d/e/1FAIpQLSfP1ERDIzKSxXnA9gGcCQCwS8ikxAubKNHH_b_Y7CYVcV2u4Q/viewform?usp=header"
        target="_blank"
        rel="noopener noreferrer"
        className="feedback-button"
      >
       Fill Feedback Form
      </a>

      <p className="maintenance-description">
        We're currently working on exciting improvements
        <br />
        to make your AndeKaAdda experience even better.
        <br />
        <br />
        In the meantime, we'd really appreciate
        <br />
        your feedback.
        <br />
        <br />
        It only takes <strong>2 minutes</strong>, and your
        <br />
        suggestions will help us build a better
        <br />
        experience for everyone.
      </p>

      <p className="maintenance-footer">
        Thank you for your continued support ❤️
      </p>

    </div>
  )
}

export default Maintenance