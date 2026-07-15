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
  Something <span>Eggciting</span><br /> is Coming!
</h1>

      <p className="maintenance-description">
        The site is currently under maintenance
        <br />
        as we work on exciting improvements
        <br />
        We'll be back very soon!
      </p>

      <p className="maintenance-footer">
        Thank you for your patience
        <br />
        and continued support.
      </p>

    </div>
  )
}

export default Maintenance