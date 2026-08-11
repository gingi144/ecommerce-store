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
  const styles = {
    container: {
      maxWidth: '1280px',
      margin: '0 auto',
      padding: '2rem 1rem',
      backgroundColor: '#FFFFFF',
    },
    breadcrumb: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      fontSize: '0.875rem',
      color: '#999999',
      marginBottom: '1.5rem',
    },
    breadcrumbLink: {
      color: '#999999',
      textDecoration: 'none',
      transition: 'color 0.3s ease',
    },
    breadcrumbCurrent: {
      color: '#000000',
    },
    // Hero Section - Image on Right, Text on Left
    heroSection: {
      display: 'flex',
      gap: '4rem',
      marginBottom: '3rem',
      alignItems: 'flex-start',
    },
    heroContent: {
      flex: '0 0 55%',
    },
    heroTitle: {
      fontSize: '2.5rem',
      fontWeight: '700',
      color: '#000000',
      marginBottom: '1rem',
    },
    heroText: {
      color: '#555555',
      lineHeight: '1.8',
      marginBottom: '1.5rem',
      fontSize: '0.95rem',
    },
    heroImage: {
      flex: '0 0 40%',
    },
    heroImg: {
      width: '100%',
      height: '320px',
      objectFit: 'cover',
      borderRadius: '8px',
    },
    // Stats - With Icons
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '1.5rem',
      marginBottom: '3rem',
      marginTop: '2rem',
    },
    statItem: {
      backgroundColor: '#FFFFFF',
      border: '1px solid #EEEEEE',
      borderRadius: '8px',
      padding: '2rem 1rem',
      textAlign: 'center',
    },
    statIcon: {
      fontSize: '2rem',
      color: '#DB4444',
      marginBottom: '0.5rem',
    },
    statNumber: {
      fontSize: '2.2rem',
      fontWeight: '700',
      color: '#DB4444',
    },
    statLabel: {
      fontSize: '0.875rem',
      color: '#666666',
      marginTop: '0.25rem',
    },
    // Team Section - RECTANGULAR images (not circles)
    teamTitle: {
      fontSize: '1.5rem',
      fontWeight: '700',
      color: '#000000',
      marginBottom: '1.5rem',
    },
    teamGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '2rem',
      marginBottom: '3rem',
    },
    teamCard: {
      backgroundColor: '#FFFFFF',
      borderRadius: '8px',
      padding: '2rem 1.5rem',
      textAlign: 'center',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    },
    teamImage: {
      width: '140px',
      height: '140px',
      borderRadius: '8px', // RECTANGULAR corners, not circle
      margin: '0 auto 1rem auto',
      overflow: 'hidden',
      backgroundColor: '#F0F0F0',
    },
    teamImg: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
    },
    teamName: {
      fontWeight: '600',
      color: '#000000',
      fontSize: '1.05rem',
    },
    teamRole: {
      fontSize: '0.875rem',
      color: '#666666',
      marginTop: '0.25rem',
    },
    teamSocial: {
      display: 'flex',
      justifyContent: 'center',
      gap: '1rem',
      marginTop: '0.75rem',
    },
    socialIcon: {
      color: '#999999',
      fontSize: '1.1rem',
      transition: 'color 0.3s ease',
    },
    // Features - Rectangular Boxes with Icons
    featuresGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '2rem',
      marginTop: '2rem',
      marginBottom: '2rem',
    },
    featureCard: {
      textAlign: 'center',
      padding: '1.5rem 1rem',
      border: '1px solid #EEEEEE',
      borderRadius: '8px',
      backgroundColor: '#FFFFFF',
    },
    featureIcon: {
      fontSize: '2.5rem',
      color: '#DB4444',
      marginBottom: '0.75rem',
      display: 'flex',
      justifyContent: 'center',
    },
    featureTitle: {
      fontWeight: '600',
      color: '#000000',
      fontSize: '1rem',
      marginBottom: '0.25rem',
    },
    featureDesc: {
      fontSize: '0.85rem',
      color: '#888888',
    },
  };

  const handleLinkHover = (e) => {
    e.target.style.color = '#DB4444';
  };

  const handleLinkLeave = (e) => {
    e.target.style.color = '#999999';
  };

  const handleSocialHover = (e) => {
    e.target.style.color = '#DB4444';
  };

  const handleSocialLeave = (e) => {
    e.target.style.color = '#999999';
  };

  return (
    <div style={{ backgroundColor: '#FFFFFF' }}>
      <Navbar />
      <div style={styles.container}>
        <div style={styles.breadcrumb}>
          <Link 
            to="/" 
            style={styles.breadcrumbLink}
            onMouseEnter={handleLinkHover}
            onMouseLeave={handleLinkLeave}
          >
            Home
          </Link>
          <span>/</span>
          <span style={styles.breadcrumbCurrent}>About</span>
        </div>

        {/* Hero Section - Image on Right, Text on Left */}
        <div style={styles.heroSection}>
          <div style={styles.heroContent}>
            <h1 style={styles.heroTitle}>Our Story</h1>
            <p style={styles.heroText}>
              Launched in 2024, CrochetKE is Kenya's premier online crochet marketplace with an active presence across the country. 
              Supported by a wide range of tailored marketing, data and service solutions, CrochetKE has 500+ artisans and 50+ brands 
              and serves thousands of customers across the region.
            </p>
            <p style={styles.heroText}>
              CrochetKE has more than 1,000 products to offer, growing at a very fast pace. We offer a diverse assortment in categories 
              ranging from yarn and threads to finished crochet products, all made with love by Kenyan artisans.
            </p>
          </div>
          <div style={styles.heroImage}>
            <img 
              src={aboutHero} 
              alt="CrochetKE artisans at work" 
              style={styles.heroImg}
              onError={(e) => {
                e.target.src = '/api/placeholder/500/320';
              }}
            />
          </div>
        </div>

        {/* Stats - With Icons */}
        <div style={styles.statsGrid}>
          <div style={styles.statItem}>
            <div style={styles.statIcon}><FaUsers /></div>
            <div style={styles.statNumber}>500+</div>
            <div style={styles.statLabel}>Artisans</div>
          </div>
          <div style={styles.statItem}>
            <div style={styles.statIcon}><FaBox /></div>
            <div style={styles.statNumber}>1,000+</div>
            <div style={styles.statLabel}>Products</div>
          </div>
          <div style={styles.statItem}>
            <div style={styles.statIcon}><FaSmile /></div>
            <div style={styles.statNumber}>10,000+</div>
            <div style={styles.statLabel}>Happy Customers</div>
          </div>
          <div style={styles.statItem}>
            <div style={styles.statIcon}><FaMapMarkerAlt /></div>
            <div style={styles.statNumber}>47</div>
            <div style={styles.statLabel}>Counties</div>
          </div>
        </div>

        {/* Team - RECTANGULAR images */}
        <h2 style={styles.teamTitle}>Meet Our Team</h2>
        <div style={styles.teamGrid}>
          <div style={styles.teamCard}>
            <div style={styles.teamImage}>
              <img 
                src={founder1} 
                alt="Tom Cruise" 
                style={styles.teamImg}
                onError={(e) => {
                  e.target.src = '/api/placeholder/140/140';
                }}
              />
            </div>
            <h3 style={styles.teamName}>Mambo Stallone</h3>
            <p style={styles.teamRole}>Founder &amp; Chairman</p>
            <div style={styles.teamSocial}>
              <a 
                href="#" 
                style={styles.socialIcon}
                onMouseEnter={handleSocialHover}
                onMouseLeave={handleSocialLeave}
              >
                <FaTwitter />
              </a>
              <a 
                href="#" 
                style={styles.socialIcon}
                onMouseEnter={handleSocialHover}
                onMouseLeave={handleSocialLeave}
              >
                <FaInstagram />
              </a>
              <a 
                href="#" 
                style={styles.socialIcon}
                onMouseEnter={handleSocialHover}
                onMouseLeave={handleSocialLeave}
              >
                <FaLinkedin />
              </a>
            </div>
          </div>
          
          <div style={styles.teamCard}>
            <div style={styles.teamImage}>
              <img 
                src={founder2} 
                alt="Emma Watson" 
                style={styles.teamImg}
                onError={(e) => {
                  e.target.src = '/api/placeholder/140/140';
                }}
              />
            </div>
            <h3 style={styles.teamName}>Sarah Sila</h3>
            <p style={styles.teamRole}>Managing Director</p>
            <div style={styles.teamSocial}>
              <a 
                href="#" 
                style={styles.socialIcon}
                onMouseEnter={handleSocialHover}
                onMouseLeave={handleSocialLeave}
              >
                <FaTwitter />
              </a>
              <a 
                href="#" 
                style={styles.socialIcon}
                onMouseEnter={handleSocialHover}
                onMouseLeave={handleSocialLeave}
              >
                <FaInstagram />
              </a>
              <a 
                href="#" 
                style={styles.socialIcon}
                onMouseEnter={handleSocialHover}
                onMouseLeave={handleSocialLeave}
              >
                <FaLinkedin />
              </a>
            </div>
          </div>
          
          <div style={styles.teamCard}>
            <div style={styles.teamImage}>
              <img 
                src={founder3} 
                alt="Will Smith" 
                style={styles.teamImg}
                onError={(e) => {
                  e.target.src = '/api/placeholder/140/140';
                }}
              />
            </div>
            <h3 style={styles.teamName}>Will Smith</h3>
            <p style={styles.teamRole}>Product Designer</p>
            <div style={styles.teamSocial}>
              <a 
                href="#" 
                style={styles.socialIcon}
                onMouseEnter={handleSocialHover}
                onMouseLeave={handleSocialLeave}
              >
                <FaTwitter />
              </a>
              <a 
                href="#" 
                style={styles.socialIcon}
                onMouseEnter={handleSocialHover}
                onMouseLeave={handleSocialLeave}
              >
                <FaInstagram />
              </a>
              <a 
                href="#" 
                style={styles.socialIcon}
                onMouseEnter={handleSocialHover}
                onMouseLeave={handleSocialLeave}
              >
                <FaLinkedin />
              </a>
            </div>
          </div>
        </div>

        {/* Features */}
        <div style={styles.featuresGrid}>
          <div style={styles.featureCard}>
            <div style={styles.featureIcon}><FaTruck /></div>
            <h3 style={styles.featureTitle}>Free and Fast Delivery</h3>
            <p style={styles.featureDesc}>Free delivery for all orders over KES 20,000</p>
          </div>
          <div style={styles.featureCard}>
            <div style={styles.featureIcon}><FaHeadset /></div>
            <h3 style={styles.featureTitle}>24/7 Customer Service</h3>
            <p style={styles.featureDesc}>Friendly 24/7 customer support</p>
          </div>
          <div style={styles.featureCard}>
            <div style={styles.featureIcon}><FaShieldAlt /></div>
            <h3 style={styles.featureTitle}>Money Back Guarantee</h3>
            <p style={styles.featureDesc}>We return money within 30 days</p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AboutPage;