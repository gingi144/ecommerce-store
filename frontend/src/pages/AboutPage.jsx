import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FaTruck, FaHeadset, FaShieldAlt, 
  FaTwitter, FaInstagram, FaLinkedin,
  FaUsers, FaBox, FaSmile, FaMapMarkerAlt 
} from 'react-icons/fa';
import Navbar from '../components/shared/Navbar';
import Footer from '../components/shared/Footer';

// Import local images
import aboutHero from '/images/about/about-hero.jpg';
import founder1 from '/images/about/founder1.jpg';
import founder2 from '/images/about/founder2.jpg';
import founder3 from '/images/about/founder3.jpg';

const AboutPage = () => {
  return (
    <>
      {/* ===== INTERNAL CSS - ALL STYLES HERE ===== */}
      <style>{`
        /* ----- Container ----- */
        .about-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 2rem 1rem;
          background-color: #FFFFFF;
        }

        /* ----- Breadcrumb ----- */
        .about-breadcrumb {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: #999999;
          margin-bottom: 1.5rem;
        }
        .about-breadcrumb a {
          color: #999999;
          text-decoration: none;
          transition: color 0.3s ease;
        }
        .about-breadcrumb a:hover {
          color: #DB4444;
        }
        .about-breadcrumb-current {
          color: #000000;
        }

        /* ----- Hero Section ----- */
        .about-hero {
          display: flex;
          gap: 4rem;
          margin-bottom: 3rem;
          align-items: flex-start;
        }
        .about-hero-content {
          flex: 0 0 55%;
        }
        .about-hero-title {
          font-size: 2.5rem;
          font-weight: 700;
          color: #000000;
          margin-bottom: 1rem;
        }
        .about-hero-text {
          color: #555555;
          line-height: 1.8;
          margin-bottom: 1.5rem;
          font-size: 0.95rem;
        }
        .about-hero-image {
          flex: 0 0 40%;
        }
        .about-hero-img {
          width: 100%;
          height: 320px;
          object-fit: cover;
          border-radius: 8px;
        }

        /* ----- Stats Grid ----- */
        .about-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
          margin-bottom: 3rem;
          margin-top: 2rem;
        }
        .about-stat-item {
          background-color: #FFFFFF;
          border: 1px solid #EEEEEE;
          border-radius: 8px;
          padding: 2rem 1rem;
          text-align: center;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .about-stat-item:hover {
          transform: translateY(-4px);
          box-shadow: 0 4px 16px rgba(0,0,0,0.08);
        }
        .about-stat-icon {
          font-size: 2rem;
          color: #DB4444;
          margin-bottom: 0.5rem;
        }
        .about-stat-number {
          font-size: 2.2rem;
          font-weight: 700;
          color: #DB4444;
        }
        .about-stat-label {
          font-size: 0.875rem;
          color: #666666;
          margin-top: 0.25rem;
        }

        /* ----- Team Section ----- */
        .about-team-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #000000;
          margin-bottom: 1.5rem;
        }
        .about-team-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
          margin-bottom: 3rem;
        }
        .about-team-card {
          background-color: #FFFFFF;
          border-radius: 8px;
          padding: 2rem 1.5rem;
          text-align: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .about-team-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 4px 16px rgba(0,0,0,0.1);
        }
        .about-team-image {
          width: 140px;
          height: 140px;
          border-radius: 8px;
          margin: 0 auto 1rem auto;
          overflow: hidden;
          background-color: #F0F0F0;
        }
        .about-team-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .about-team-name {
          font-weight: 600;
          color: #000000;
          font-size: 1.05rem;
        }
        .about-team-role {
          font-size: 0.875rem;
          color: #666666;
          margin-top: 0.25rem;
        }
        .about-team-social {
          display: flex;
          justify-content: center;
          gap: 1rem;
          margin-top: 0.75rem;
        }
        .about-social-icon {
          color: #999999;
          font-size: 1.1rem;
          transition: color 0.3s ease;
        }
        .about-social-icon:hover {
          color: #DB4444;
        }

        /* ----- Features Grid ----- */
        .about-features {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
          margin-top: 2rem;
          margin-bottom: 2rem;
        }
        .about-feature-card {
          text-align: center;
          padding: 1.5rem 1rem;
          border: 1px solid #EEEEEE;
          border-radius: 8px;
          background-color: #FFFFFF;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .about-feature-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 4px 16px rgba(0,0,0,0.08);
        }
        .about-feature-icon {
          font-size: 2.5rem;
          color: #DB4444;
          margin-bottom: 0.75rem;
          display: flex;
          justify-content: center;
        }
        .about-feature-title {
          font-weight: 600;
          color: #000000;
          font-size: 1rem;
          margin-bottom: 0.25rem;
        }
        .about-feature-desc {
          font-size: 0.85rem;
          color: #888888;
        }

        /* ============================================== */
        /* ===== RESPONSIVE MEDIA QUERIES ===== */
        /* ============================================== */

        /* Tablet Landscape */
        @media (max-width: 1024px) {
          .about-hero {
            gap: 2rem;
          }
          .about-hero-content {
            flex: 0 0 50%;
          }
          .about-hero-image {
            flex: 0 0 45%;
          }
          .about-hero-img {
            height: 280px;
          }
          .about-stats {
            grid-template-columns: repeat(2, 1fr);
          }
          .about-team-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 1.5rem;
          }
        }

        /* Tablets */
        @media (max-width: 768px) {
          .about-container {
            padding: 1rem 0.75rem;
          }
          
          .about-breadcrumb {
            font-size: 0.75rem;
            margin-bottom: 1rem;
          }
          
          .about-hero {
            flex-direction: column-reverse;
            gap: 1.5rem;
          }
          .about-hero-content {
            flex: 1 1 100%;
          }
          .about-hero-image {
            flex: 1 1 100%;
          }
          .about-hero-img {
            height: 220px;
          }
          .about-hero-title {
            font-size: 2rem;
          }
          .about-hero-text {
            font-size: 0.9rem;
            margin-bottom: 1rem;
          }
          
          .about-stats {
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
            margin-bottom: 2rem;
            margin-top: 1.5rem;
          }
          .about-stat-item {
            padding: 1.5rem 0.75rem;
          }
          .about-stat-number {
            font-size: 1.8rem;
          }
          .about-stat-label {
            font-size: 0.8rem;
          }
          
          .about-team-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 1.25rem;
            margin-bottom: 2rem;
          }
          .about-team-card {
            padding: 1.5rem 1rem;
          }
          .about-team-image {
            width: 120px;
            height: 120px;
          }
          .about-team-name {
            font-size: 0.95rem;
          }
          
          .about-features {
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
            margin-top: 1.5rem;
          }
        }

        /* Mobile Phones */
        @media (max-width: 480px) {
          .about-container {
            padding: 0.75rem 0.5rem;
          }
          
          .about-breadcrumb {
            font-size: 0.7rem;
            margin-bottom: 0.75rem;
            flex-wrap: wrap;
          }
          
          .about-hero {
            gap: 1rem;
          }
          .about-hero-img {
            height: 180px;
          }
          .about-hero-title {
            font-size: 1.5rem;
          }
          .about-hero-text {
            font-size: 0.85rem;
            line-height: 1.6;
          }
          
          .about-stats {
            grid-template-columns: repeat(2, 1fr);
            gap: 0.75rem;
            margin-bottom: 1.5rem;
            margin-top: 1rem;
          }
          .about-stat-item {
            padding: 1rem 0.5rem;
          }
          .about-stat-icon {
            font-size: 1.5rem;
          }
          .about-stat-number {
            font-size: 1.4rem;
          }
          .about-stat-label {
            font-size: 0.7rem;
          }
          
          .about-team-title {
            font-size: 1.25rem;
            margin-bottom: 1rem;
          }
          .about-team-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
            margin-bottom: 1.5rem;
          }
          .about-team-card {
            padding: 1.25rem 0.75rem;
          }
          .about-team-image {
            width: 100px;
            height: 100px;
          }
          .about-team-name {
            font-size: 0.9rem;
          }
          .about-team-role {
            font-size: 0.8rem;
          }
          .about-team-social {
            gap: 0.75rem;
          }
          .about-social-icon {
            font-size: 1rem;
          }
          
          .about-features {
            grid-template-columns: 1fr;
            gap: 0.75rem;
            margin-top: 1rem;
            margin-bottom: 1rem;
          }
          .about-feature-card {
            padding: 1rem 0.75rem;
          }
          .about-feature-icon {
            font-size: 2rem;
          }
          .about-feature-title {
            font-size: 0.9rem;
          }
          .about-feature-desc {
            font-size: 0.8rem;
          }
        }

        /* Very Small Phones */
        @media (max-width: 360px) {
          .about-hero-img {
            height: 150px;
          }
          .about-hero-title {
            font-size: 1.25rem;
          }
          .about-hero-text {
            font-size: 0.8rem;
          }
          .about-stats {
            grid-template-columns: 1fr 1fr;
            gap: 0.5rem;
          }
          .about-stat-number {
            font-size: 1.2rem;
          }
          .about-team-image {
            width: 80px;
            height: 80px;
          }
        }
      `}</style>

      <div style={{ backgroundColor: '#FFFFFF' }}>
        <Navbar />
        <div className="about-container">
          {/* Breadcrumb */}
          <div className="about-breadcrumb">
            <Link to="/">Home</Link>
            <span>/</span>
            <span className="about-breadcrumb-current">About</span>
          </div>

          {/* Hero Section - Image on Right, Text on Left */}
          <div className="about-hero">
            <div className="about-hero-content">
              <h1 className="about-hero-title">Our Story</h1>
              <p className="about-hero-text">
                Launched in 2024, CrochetKE is Kenya's premier online crochet marketplace with an active presence across the country. 
                Supported by a wide range of tailored marketing, data and service solutions, CrochetKE has 500+ artisans and 50+ brands 
                and serves thousands of customers across the region.
              </p>
              <p className="about-hero-text">
                CrochetKE has more than 1,000 products to offer, growing at a very fast pace. We offer a diverse assortment in categories 
                ranging from yarn and threads to finished crochet products, all made with love by Kenyan artisans.
              </p>
            </div>
            <div className="about-hero-image">
              <img 
                src={aboutHero} 
                alt="CrochetKE artisans at work" 
                className="about-hero-img"
                onError={(e) => {
                  e.target.src = '/api/placeholder/500/320';
                }}
              />
            </div>
          </div>

          {/* Stats - With Icons */}
          <div className="about-stats">
            <div className="about-stat-item">
              <div className="about-stat-icon"><FaUsers /></div>
              <div className="about-stat-number">500+</div>
              <div className="about-stat-label">Artisans</div>
            </div>
            <div className="about-stat-item">
              <div className="about-stat-icon"><FaBox /></div>
              <div className="about-stat-number">1,000+</div>
              <div className="about-stat-label">Products</div>
            </div>
            <div className="about-stat-item">
              <div className="about-stat-icon"><FaSmile /></div>
              <div className="about-stat-number">10,000+</div>
              <div className="about-stat-label">Happy Customers</div>
            </div>
            <div className="about-stat-item">
              <div className="about-stat-icon"><FaMapMarkerAlt /></div>
              <div className="about-stat-number">47</div>
              <div className="about-stat-label">Counties</div>
            </div>
          </div>

          {/* Team - RECTANGULAR images */}
          <h2 className="about-team-title">Meet Our Team</h2>
          <div className="about-team-grid">
            <div className="about-team-card">
              <div className="about-team-image">
                <img 
                  src={founder1} 
                  alt="Tom Cruise" 
                  className="about-team-img"
                  onError={(e) => {
                    e.target.src = '/api/placeholder/140/140';
                  }}
                />
              </div>
              <h3 className="about-team-name">Mambo Stallone</h3>
              <p className="about-team-role">Founder &amp; Chairman</p>
              <div className="about-team-social">
                <a href="#" className="about-social-icon" aria-label="Twitter">
                  <FaTwitter />
                </a>
                <a href="#" className="about-social-icon" aria-label="Instagram">
                  <FaInstagram />
                </a>
                <a href="#" className="about-social-icon" aria-label="LinkedIn">
                  <FaLinkedin />
                </a>
              </div>
            </div>
            
            <div className="about-team-card">
              <div className="about-team-image">
                <img 
                  src={founder2} 
                  alt="Emma Watson" 
                  className="about-team-img"
                  onError={(e) => {
                    e.target.src = '/api/placeholder/140/140';
                  }}
                />
              </div>
              <h3 className="about-team-name">Sarah Sila</h3>
              <p className="about-team-role">Managing Director</p>
              <div className="about-team-social">
                <a href="#" className="about-social-icon" aria-label="Twitter">
                  <FaTwitter />
                </a>
                <a href="#" className="about-social-icon" aria-label="Instagram">
                  <FaInstagram />
                </a>
                <a href="#" className="about-social-icon" aria-label="LinkedIn">
                  <FaLinkedin />
                </a>
              </div>
            </div>
            
            <div className="about-team-card">
              <div className="about-team-image">
                <img 
                  src={founder3} 
                  alt="Will Smith" 
                  className="about-team-img"
                  onError={(e) => {
                    e.target.src = '/api/placeholder/140/140';
                  }}
                />
              </div>
              <h3 className="about-team-name">Will Smith</h3>
              <p className="about-team-role">Product Designer</p>
              <div className="about-team-social">
                <a href="#" className="about-social-icon" aria-label="Twitter">
                  <FaTwitter />
                </a>
                <a href="#" className="about-social-icon" aria-label="Instagram">
                  <FaInstagram />
                </a>
                <a href="#" className="about-social-icon" aria-label="LinkedIn">
                  <FaLinkedin />
                </a>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="about-features">
            <div className="about-feature-card">
              <div className="about-feature-icon"><FaTruck /></div>
              <h3 className="about-feature-title">Free and Fast Delivery</h3>
              <p className="about-feature-desc">Free delivery for all orders over KES 20,000</p>
            </div>
            <div className="about-feature-card">
              <div className="about-feature-icon"><FaHeadset /></div>
              <h3 className="about-feature-title">24/7 Customer Service</h3>
              <p className="about-feature-desc">Friendly 24/7 customer support</p>
            </div>
            <div className="about-feature-card">
              <div className="about-feature-icon"><FaShieldAlt /></div>
              <h3 className="about-feature-title">Money Back Guarantee</h3>
              <p className="about-feature-desc">We return money within 30 days</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default AboutPage;
