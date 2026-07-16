import { useState } from 'react'

import {
  FileText,
  Info,
  ShieldCheck,
  AtSign,
  
} from 'lucide-react'


import FooterModal from './FooterModal'

function Footer() {

  const [modal, setModal] =
    useState(null)

  return (

    <>

      <footer className="footer">

        <button
          className="footer-item"
          onClick={() =>
            setModal("terms")
          }
        >
          <FileText size={18} />
          <span>Terms & Conditions</span>
        </button>

        <button
          className="footer-item"
          onClick={() =>
            setModal("about")
          }
        >
          <Info size={18} />
          <span>About Us</span>
        </button>

        <button
          className="footer-item"
          onClick={() =>
            setModal("privacy")
          }
        >
          <ShieldCheck size={18} />
          <span>Privacy Policy</span>
        </button>

        <button
          className="footer-item"
          onClick={() =>
            setModal("contact")
          }
        >
          <AtSign size={18} />
          <span>Contact Us</span>
        </button>

        <p className="footer-copyright">
          © 2026 AndeKaAdda
        </p>

      </footer>

      <FooterModal
        open={modal === "terms"}
        title="Terms & Conditions"
        onClose={() => setModal(null)}
      >

       <div>

<p>
Welcome to <strong>AndeKaAdda</strong>.
By placing an order through our platform, you agree to the following terms and conditions.
</p>

<br />

<ol
  style={{
    paddingLeft: "20px",
    lineHeight: "1.8"
  }}
>
<li>
Product prices may change from time to time depending on market rates, supplier costs and operational expenses. The price displayed on the website at the time of placing your order shall be considered final.
</li>

<li>
Customers are responsible for providing the correct name, block, room number and phone number.
</li>

<li>
Orders placed with incorrect delivery details may not be delivered.
</li>

<li>
Once an order is prepared, cancellation or refund may not be possible.
</li>

<li>
Payment must be completed as instructed by the delivery partner or the AndeKaAdda team.
</li>

<li>
Delivery times shown on the website are estimated and may vary depending on order volume and operational conditions.
</li>

<li>
Orders can only be placed during the ordering window shown on the website.
</li>

<li>
AndeKaAdda reserves the right to refuse or cancel any order in case of misuse, fraudulent activity or operational issues.
</li>

<li>
These Terms & Conditions may be updated from time to time without prior notice.
</li>

</ol>

</div>

      </FooterModal>

      <FooterModal
        open={modal === "about"}
        title="About Us"
        onClose={() => setModal(null)}
      >

        <div>

<p>

<strong>AndeKaAdda</strong> is a student-run egg delivery service built exclusively for students living inside the VIT Vellore campus.

</p>

<br />

<p>

Our goal is simple — make protein affordable, convenient and hassle-free. No waiting in queues, no unnecessary trips outside your hostel. Just place your order online and we'll deliver it to your room.

</p>

<br />

<p>

We believe that good food should be accessible to every student. That's why we're continuously working to improve our service with better delivery, new menu items and subscription plans that help you save even more.

</p>

<br />

<p>

Thank you for supporting a student-built startup. Every order motivates us to keep building something better for the VIT community.

</p>

</div>

      </FooterModal>

      <FooterModal
        open={modal === "privacy"}
        title="Privacy Policy"
        onClose={() => setModal(null)}
      >

       <div>

<p>

At <strong>AndeKaAdda</strong>, we value your privacy and collect only the information required to process and deliver your orders efficiently.

</p>

<br />

<ul
  style={{
    paddingLeft: "20px",
    lineHeight: "1.6",
    fontSize: "14px"
  }}
>

<li>
We collect your name, phone number, hostel block and room number to process and deliver your orders.
</li>

<li>
Your information is used only for order management, delivery and customer support.
</li>

<li>
We do not sell, rent or share your personal information with third parties for marketing purposes.
</li>

<li>
Your order history may be stored to help you view previous orders and improve your experience.
</li>

<li>
We take reasonable measures to protect your information, but no online service can guarantee absolute security.
</li>

<li>
By using AndeKaAdda, you agree to this Privacy Policy and any future updates made to it.
</li>

</ul>

</div>

      </FooterModal>

      <FooterModal
        open={modal === "contact"}
        title="Contact Us"
        onClose={() => setModal(null)}
      >

        <div>

<p>

Have a question, suggestion or feedback?

We're always happy to hear from you!

</p>

<br />

<p>

The fastest way to reach us is through our Instagram page.

</p>

<br />

<div
  style={{
    display: "flex",
    justifyContent: "center",
    margin: "20px 0"
  }}
>

<a
  href="https://www.instagram.com/andekaadda.shop?igsh=MTM4MTIyZG8wd3l2OQ%3D%3D&utm_source=qr"
  target="_blank"
  rel="noopener noreferrer"
  style={{
    background: "#f59e0b",
    color: "white",
    padding: "12px 22px",
    borderRadius: "12px",
    textDecoration: "none",
    fontWeight: "bold"
  }}
>
    

@andekaadda.shop

</a>

</div>

<p
  style={{
    textAlign: "center",
    fontSize: "13px",
    color: "#94a3b8"
  }}
>

We'll try our best to respond as soon as possible.

</p>

</div>

      </FooterModal>

    </>

  )

}

export default Footer