import React from 'react';
import '../styles/Contacts.css';
import facebookIcon from '../assets/facebook-icon.png';
import instagramIcon from '../assets/instagram-icon.png';
import twitterIcon from '../assets/twitter-icon.png';

const Contacts = () => {
  return (
    <div className="contacts-container">
      <section className="contacts-section">
        <div className="contacts-info">
          <h1>Наши контакты</h1>
          <p>Телефон: +7 (123) 456-78-90</p>
          <p>Email: info@nwvcompany.com</p>
          <p>Адрес: г. Москва, ул. Примерная, д. 123</p>
          <div className="social-links">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
              <img src={facebookIcon} alt="Facebook" />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
              <img src={instagramIcon} alt="Instagram" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
              <img src={twitterIcon} alt="Twitter" />
            </a>
          </div>
        </div>
        <div className="contacts-map">
          <iframe
            title="map"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2245.123456789!2d37.6173!3d55.7558!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2z0J%2FRgNC%2B0YHRjNC60LAg0L%2FQuNC60L7Qsg!5e0!3m2!1sen!2sru!4v1634567890123!5m2!1sen!2sru"
            width="100%"
            height="400"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
          ></iframe>
        </div>
      </section>
    </div>
  );
};

export default Contacts;