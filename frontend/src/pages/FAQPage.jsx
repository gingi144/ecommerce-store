import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaQuestionCircle, FaChevronDown, FaChevronUp, 
  FaTruck, FaCreditCard, FaExchangeAlt, FaUser, 
  FaShoppingBag, FaHeadset, FaShieldAlt, FaBox 
} from 'react-icons/fa';
import Navbar from '../components/shared/Navbar';
import Footer from '../components/shared/Footer';

const FAQPage = () => {
  const [openSection, setOpenSection] = useState(null);
  const [openQuestion, setOpenQuestion] = useState(null);

  const toggleQuestion = (sectionIndex, questionIndex) => {
    const key = `${sectionIndex}-${questionIndex}`;
    setOpenQuestion(openQuestion === key ? null : key);
  };

  const faqData = [
    {
      title: "Orders & Payments",
      icon: FaShoppingBag,
      questions: [
        {
          q: "How do I place an order?",
          a: "Browse our products, select items you like, add them to your cart, and proceed to checkout. Fill in your details, choose payment method, and confirm your order. You'll receive an email confirmation immediately."
        },
        {
          q: "What payment methods do you accept?",
          a: "We accept M-PESA, credit/debit cards (Visa, Mastercard), and bank transfers. All payments are processed securely through our payment partners."
        },
        {
          q: "How do I track my order?",
          a: "Once your order ships, you'll receive a tracking number via email and SMS. You can track your package using our order tracking page or directly through the shipping provider's website."
        },
        {
          q: "Can I modify or cancel my order?",
          a: "You can cancel or modify your order within 2 hours of placing it. Contact our customer support immediately with your order number. After 2 hours, we cannot guarantee changes as processing may have begun."
        }
      ]
    },
    {
      title: "Shipping & Delivery",
      icon: FaTruck,
      questions: [
        {
          q: "How long does delivery take?",
          a: "We deliver within Kenya with an estimated delivery time of 2-5 business days. Nairobi orders typically arrive within 2-3 days, while other regions may take 4-5 days."
        },
        {
          q: "How much does shipping cost?",
          a: "Shipping costs depend on your location and order size. Standard shipping starts at KES 200. Orders over KES 20,000 qualify for free shipping. Exact costs are calculated at checkout."
        },
        {
          q: "Do you ship internationally?",
          a: "Currently, we only ship within Kenya. We plan to expand to other East African countries in the future. Stay tuned for updates on our international shipping services."
        },
        {
          q: "What if my package is delayed or lost?",
          a: "If your package is delayed, contact our support team and we'll investigate. In case of lost packages, we will either resend your order or issue a full refund, depending on your preference."
        }
      ]
    },
    {
      title: "Returns & Refunds",
      icon: FaExchangeAlt,
      questions: [
        {
          q: "What is your return policy?",
          a: "We accept returns within 30 days of delivery. Items must be unused, in their original packaging, and accompanied by proof of purchase. Custom-made items are non-returnable unless defective."
        },
        {
          q: "How do I initiate a return?",
          a: "Contact our customer support with your order number and reason for return. We'll provide you with return instructions and a return label. You'll be responsible for return shipping costs unless the item was damaged or incorrect."
        },
        {
          q: "How long do refunds take?",
          a: "Refunds are processed within 5-7 business days of receiving the returned item. The refund will be credited back to your original payment method. You'll receive a confirmation email once the refund is processed."
        },
        {
          q: "Can I exchange an item?",
          a: "Yes, we offer exchanges for size, color, or style variations. Contact our support team to arrange an exchange. You'll need to return the original item and we'll send the replacement once the return is processed."
        }
      ]
    },
    {
      title: "Account & Security",
      icon: FaUser,
      questions: [
        {
          q: "How do I create an account?",
          a: "Click the 'Sign Up' button on our homepage. Fill in your name, email, phone number, and create a password. You'll receive a verification email to confirm your account."
        },
        {
          q: "I forgot my password. How do I reset it?",
          a: "Click 'Forgot Password' on the login page. Enter your registered email address and we'll send you a password reset link. Follow the instructions in the email to create a new password."
        },
        {
          q: "Is my personal information secure?",
          a: "Yes, we take security seriously. We use SSL encryption for all data transmission, follow strict security protocols, and never store your payment information on our servers. All payments are processed through secure third-party gateways."
        }
      ]
    },
    {
      title: "Products & Artisans",
      icon: FaBox,
      questions: [
        {
          q: "Are your products handmade?",
          a: "Yes, all our products are handmade by skilled Kenyan artisans. Each item is crafted with care and attention to detail, making every piece unique."
        },
        {
          q: "Do you offer custom orders?",
          a: "Yes, many of our artisans accept custom orders. Contact us with your requirements and we'll connect you with an artisan who can bring your vision to life. Custom orders typically take 2-3 weeks."
        },
        {
          q: "How are your products priced?",
          a: "Our prices reflect the skill, time, and materials that go into each handmade item. We work directly with artisans to ensure fair pricing for their work while offering competitive prices to our customers."
        }
      ]
    },
    {
      title: "Customer Support",
      icon: FaHeadset,
      questions: [
        {
          q: "How do I contact customer support?",
          a: "You can reach us via email at support@crochetke.com, call us at +254 700 000 000, or use our contact form on the website. We're available Monday to Saturday, 8:00 AM to 8:00 PM."
        },
        {
          q: "What are your support hours?",
          a: "Our customer support team is available Monday through Saturday, 8:00 AM to 8:00 PM East African Time (EAT). For urgent issues outside these hours, please email us and we'll respond first thing the next business day."
        },
        {
          q: "How long does it take to get a response?",
          a: "We aim to respond to all inquiries within 2 hours during business hours. For emails sent outside business hours, we'll respond within 12 hours. For urgent matters, we recommend calling us directly."
        }
      ]
    }
  ];

  return (
    <>
      {/* ===== INTERNAL CSS ===== */}
      <style>{`
        .faq-container {
          max-width: 900px;
          margin: 0 auto;
          padding: 2rem 1rem;
          background-color: #FFFFFF;
        }

        .faq-breadcrumb {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: #999999;
          margin-bottom: 1.5rem;
        }
        .faq-breadcrumb a {
          color: #999999;
          text-decoration: none;
          transition: color 0.3s ease;
        }
        .faq-breadcrumb a:hover {
          color: #DB4444;
        }
        .faq-breadcrumb-current {
          color: #000000;
        }

        .faq-header {
          text-align: center;
          margin-bottom: 2rem;
          padding-bottom: 2rem;
          border-bottom: 2px solid #F0F0F0;
        }
        .faq-icon {
          font-size: 3rem;
          color: #DB4444;
          margin-bottom: 1rem;
        }
        .faq-title {
          font-size: 2.2rem;
          font-weight: 700;
          color: #000000;
          margin-bottom: 0.5rem;
        }
        .faq-subtitle {
          font-size: 1rem;
          color: #666666;
        }

        .faq-search-section {
          margin-bottom: 2rem;
        }
        .faq-search-input {
          width: 100%;
          max-width: 500px;
          margin: 0 auto;
          display: block;
          padding: 0.75rem 1rem;
          border: 2px solid #EEEEEE;
          border-radius: 8px;
          font-size: 0.95rem;
          outline: none;
          transition: border-color 0.3s ease, box-shadow 0.3s ease;
          color: #000000;
          background-color: #FFFFFF;
          box-sizing: border-box;
        }
        .faq-search-input:focus {
          border-color: #DB4444;
          box-shadow: 0 0 0 3px rgba(219, 68, 68, 0.1);
        }
        .faq-search-input::placeholder {
          color: #AAAAAA;
        }

        .faq-category-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }
        .faq-category-card {
          background-color: #FFFFFF;
          border: 1px solid #EEEEEE;
          border-radius: 8px;
          padding: 1rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .faq-category-card:hover {
          border-color: #DB4444;
          box-shadow: 0 2px 12px rgba(219, 68, 68, 0.1);
        }
        .faq-category-card.active {
          border-color: #DB4444;
          background-color: #FDF2F2;
        }
        .faq-category-icon {
          font-size: 2rem;
          color: #DB4444;
          margin-bottom: 0.5rem;
        }
        .faq-category-name {
          font-weight: 600;
          color: #000000;
          font-size: 0.9rem;
        }
        .faq-category-count {
          color: #999999;
          font-size: 0.8rem;
          margin-top: 0.25rem;
        }

        .faq-section {
          margin-bottom: 2rem;
        }
        .faq-section-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 0;
          border-bottom: 2px solid #F0F0F0;
          margin-bottom: 1rem;
        }
        .faq-section-icon {
          font-size: 1.5rem;
          color: #DB4444;
        }
        .faq-section-title {
          font-size: 1.2rem;
          font-weight: 700;
          color: #000000;
        }
        .faq-section-count {
          font-size: 0.85rem;
          color: #999999;
          margin-left: 0.5rem;
        }

        .faq-item {
          border: 1px solid #EEEEEE;
          border-radius: 8px;
          margin-bottom: 0.75rem;
          overflow: hidden;
          transition: border-color 0.3s ease;
        }
        .faq-item:hover {
          border-color: #DB4444;
        }
        .faq-item.active {
          border-color: #DB4444;
        }
        .faq-question {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.25rem;
          cursor: pointer;
          background-color: #FAFAFA;
          transition: background-color 0.3s ease;
        }
        .faq-question:hover {
          background-color: #F5F5F5;
        }
        .faq-question-text {
          color: #000000;
          font-weight: 500;
          font-size: 0.95rem;
          flex: 1;
          margin-right: 1rem;
        }
        .faq-question-icon {
          color: #999999;
          font-size: 0.9rem;
          flex-shrink: 0;
          transition: transform 0.3s ease;
        }
        .faq-question-icon.open {
          transform: rotate(180deg);
        }
        .faq-answer {
          padding: 0 1.25rem;
          max-height: 0;
          overflow: hidden;
          transition: all 0.3s ease;
          background-color: #FFFFFF;
        }
        .faq-answer.open {
          padding: 1.25rem;
          max-height: 500px;
        }
        .faq-answer-text {
          color: #555555;
          line-height: 1.8;
          font-size: 0.95rem;
        }

        .faq-contact-section {
          background-color: #FAFAFA;
          border-radius: 8px;
          padding: 2rem;
          text-align: center;
          margin-top: 2rem;
        }
        .faq-contact-title {
          font-size: 1.2rem;
          font-weight: 700;
          color: #000000;
          margin-bottom: 0.5rem;
        }
        .faq-contact-text {
          color: #666666;
          font-size: 0.95rem;
          margin-bottom: 1rem;
        }
        .faq-contact-button {
          display: inline-block;
          background-color: #DB4444;
          color: #FFFFFF;
          padding: 0.6rem 1.5rem;
          border-radius: 6px;
          text-decoration: none;
          transition: background-color 0.3s ease;
        }
        .faq-contact-button:hover {
          background-color: #B33A3A;
        }

        .faq-footer-text {
          text-align: center;
          color: #999999;
          font-size: 0.85rem;
          padding-top: 2rem;
          border-top: 1px solid #EEEEEE;
          margin-top: 2rem;
        }
        .faq-footer-text a {
          color: #DB4444;
          text-decoration: none;
        }
        .faq-footer-text a:hover {
          text-decoration: underline;
        }

        @media (max-width: 768px) {
          .faq-container {
            padding: 1rem 0.75rem;
          }
          .faq-title {
            font-size: 1.5rem;
          }
          .faq-question-text {
            font-size: 0.9rem;
          }
          .faq-answer-text {
            font-size: 0.9rem;
          }
          .faq-category-grid {
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          }
          .faq-contact-section {
            padding: 1.5rem;
          }
        }

        @media (max-width: 480px) {
          .faq-container {
            padding: 0.75rem 0.5rem;
          }
          .faq-title {
            font-size: 1.25rem;
          }
          .faq-icon {
            font-size: 2.5rem;
          }
          .faq-question {
            padding: 0.75rem 1rem;
          }
          .faq-question-text {
            font-size: 0.85rem;
          }
          .faq-answer {
            padding: 0 1rem;
          }
          .faq-answer.open {
            padding: 1rem;
          }
          .faq-answer-text {
            font-size: 0.85rem;
          }
          .faq-category-grid {
            grid-template-columns: 1fr 1fr;
            gap: 0.5rem;
          }
          .faq-category-card {
            padding: 0.75rem;
          }
          .faq-category-icon {
            font-size: 1.5rem;
          }
          .faq-section-title {
            font-size: 1rem;
          }
          .faq-contact-section {
            padding: 1rem;
          }
          .faq-contact-title {
            font-size: 1rem;
          }
          .faq-contact-button {
            padding: 0.5rem 1.25rem;
            font-size: 0.9rem;
          }
        }
      `}</style>

      <Navbar />
      <div className="faq-container">
        {/* Breadcrumb */}
        <div className="faq-breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <span className="faq-breadcrumb-current">FAQ</span>
        </div>

        {/* Header */}
        <div className="faq-header">
          <FaQuestionCircle className="faq-icon" />
          <h1 className="faq-title">Frequently Asked Questions</h1>
          <p className="faq-subtitle">Find answers to commonly asked questions about CrochetKE</p>
        </div>

        {/* Search */}
        <div className="faq-search-section">
          <input
            type="text"
            placeholder="Search questions..."
            className="faq-search-input"
          />
        </div>

        {/* Category Grid */}
        <div className="faq-category-grid">
          {faqData.map((section, idx) => {
            const Icon = section.icon;
            return (
              <div 
                key={idx} 
                className="faq-category-card"
                onClick={() => {
                  const target = document.getElementById(`faq-section-${idx}`);
                  if (target) target.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <Icon className="faq-category-icon" />
                <div className="faq-category-name">{section.title}</div>
                <div className="faq-category-count">{section.questions.length} questions</div>
              </div>
            );
          })}
        </div>

        {/* FAQ Sections */}
        {faqData.map((section, sectionIndex) => {
          const Icon = section.icon;
          return (
            <div key={sectionIndex} id={`faq-section-${sectionIndex}`} className="faq-section">
              <div className="faq-section-header">
                <Icon className="faq-section-icon" />
                <span className="faq-section-title">
                  {section.title}
                  <span className="faq-section-count">({section.questions.length})</span>
                </span>
              </div>

              {section.questions.map((qa, questionIndex) => {
                const key = `${sectionIndex}-${questionIndex}`;
                const isOpen = openQuestion === key;
                return (
                  <div key={questionIndex} className={`faq-item ${isOpen ? 'active' : ''}`}>
                    <div 
                      className="faq-question"
                      onClick={() => toggleQuestion(sectionIndex, questionIndex)}
                    >
                      <span className="faq-question-text">{qa.q}</span>
                      <span className={`faq-question-icon ${isOpen ? 'open' : ''}`}>
                        {isOpen ? <FaChevronUp /> : <FaChevronDown />}
                      </span>
                    </div>
                    <div className={`faq-answer ${isOpen ? 'open' : ''}`}>
                      <p className="faq-answer-text">{qa.a}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}

        {/* Contact Section */}
        <div className="faq-contact-section">
          <h3 className="faq-contact-title">Still Have Questions?</h3>
          <p className="faq-contact-text">
            Can't find the answer you're looking for? Contact our customer support team.
          </p>
          <Link to="/contact" className="faq-contact-button">
            <FaHeadset /> Contact Us
          </Link>
        </div>

        <div className="faq-footer-text">
          <Link to="/">Home</Link> &bull; <Link to="/shop">Shop</Link> &bull; <Link to="/about">About</Link> &bull; <Link to="/privacy">Privacy Policy</Link> &bull; <Link to="/terms">Terms of Use</Link>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default FAQPage;