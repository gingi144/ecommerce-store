import React, { useState, useEffect } from 'react';
import { FaStar, FaStarHalfAlt, FaUser } from 'react-icons/fa';
import api from '../api';

const Reviews = ({ productId }) => {
  const [reviews, setReviews] = useState([]);
  const [average, setAverage] = useState(0);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [userReview, setUserReview] = useState({ rating: 0, title: '', comment: '' });
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      const response = await api.get(`/api/reviews/product/${productId}`);
      setReviews(response.data.reviews);
      setAverage(response.data.average || 0);
      setCount(response.data.count || 0);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRatingClick = (rating) => {
    setUserReview({ ...userReview, rating });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    if (userReview.rating === 0) {
      setError('Please select a rating');
      setSubmitting(false);
      return;
    }

   try {
  const token = localStorage.getItem('token');

  const response = await api.post(
    `/api/reviews/product/${productId}`,
    userReview,
    { headers: { Authorization: 'Bearer ' + token } }
  );
      
      setSuccess('Review submitted successfully!');
      setUserReview({ rating: 0, title: '', comment: '' });
      setShowForm(false);
      fetchReviews();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={i} style={{ color: '#FFC107' }} />);
    }
    if (hasHalfStar) {
      stars.push(<FaStarHalfAlt key="half" style={{ color: '#FFC107' }} />);
    }
    while (stars.length < 5) {
      stars.push(<FaStar key={stars.length} style={{ color: '#E5E5E5' }} />);
    }
    return stars;
  };

  if (loading) {
    return <div style={{ color: '#666666', padding: '1rem 0' }}>Loading reviews...</div>;
  }

  const styles = {
    container: {
      marginTop: '2rem',
      paddingTop: '2rem',
      borderTop: '1px solid #E5E5E5',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1rem',
      flexWrap: 'wrap',
      gap: '1rem',
    },
    title: {
      fontSize: '1.25rem',
      fontWeight: '700',
      color: '#000000',
    },
    summary: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    averageRating: {
      fontSize: '1.5rem',
      fontWeight: '700',
      color: '#000000',
    },
    starDisplay: {
      display: 'flex',
      gap: '0.1rem',
    },
    reviewCount: {
      color: '#666666',
      fontSize: '0.9rem',
    },
    reviewList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
    },
    reviewItem: {
      backgroundColor: '#F9FAFB',
      padding: '1rem',
      borderRadius: '8px',
      border: '1px solid #EEEEEE',
    },
    reviewHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '0.5rem',
    },
    reviewUser: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      fontWeight: '600',
      color: '#000000',
    },
    reviewDate: {
      fontSize: '0.8rem',
      color: '#999999',
    },
    reviewTitle: {
      fontWeight: '600',
      color: '#000000',
      marginBottom: '0.25rem',
    },
    reviewComment: {
      color: '#666666',
      lineHeight: '1.6',
    },
    button: {
      backgroundColor: '#DB4444',
      color: '#FFFFFF',
      padding: '0.5rem 1.5rem',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      transition: 'background-color 0.3s ease',
    },
    buttonSecondary: {
      backgroundColor: '#F3F4F6',
      color: '#000000',
      padding: '0.5rem 1.5rem',
      border: '1px solid #E5E5E5',
      borderRadius: '6px',
      cursor: 'pointer',
      transition: 'background-color 0.3s ease',
    },
    form: {
      backgroundColor: '#F9FAFB',
      padding: '1.5rem',
      borderRadius: '8px',
      marginBottom: '1rem',
      border: '1px solid #EEEEEE',
    },
    formGroup: {
      marginBottom: '1rem',
    },
    label: {
      display: 'block',
      fontWeight: '500',
      color: '#000000',
      marginBottom: '0.25rem',
    },
    input: {
      width: '100%',
      padding: '0.6rem 0.75rem',
      border: '1px solid #E5E5E5',
      borderRadius: '6px',
      fontSize: '0.95rem',
      outline: 'none',
      transition: 'border-color 0.3s ease',
      boxSizing: 'border-box',
    },
    textarea: {
      width: '100%',
      padding: '0.6rem 0.75rem',
      border: '1px solid #E5E5E5',
      borderRadius: '6px',
      fontSize: '0.95rem',
      outline: 'none',
      transition: 'border-color 0.3s ease',
      fontFamily: 'inherit',
      resize: 'vertical',
      minHeight: '80px',
      boxSizing: 'border-box',
    },
    ratingSelect: {
      display: 'flex',
      gap: '0.25rem',
      cursor: 'pointer',
    },
    starButton: {
      background: 'none',
      border: 'none',
      fontSize: '1.5rem',
      cursor: 'pointer',
      padding: '0',
    },
    errorText: {
      color: '#DC2626',
      fontSize: '0.875rem',
      marginBottom: '0.5rem',
    },
    successText: {
      color: '#16A34A',
      fontSize: '0.875rem',
      marginBottom: '0.5rem',
    },
    noReviews: {
      color: '#666666',
      padding: '1rem 0',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>Customer Reviews</h3>
        {!showForm && (
          <button 
            style={styles.button}
            onClick={() => setShowForm(true)}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#B33A3A'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#DB4444'}
          >
            Write a Review
          </button>
        )}
      </div>

      {/* Summary */}
      <div style={styles.summary}>
        <span style={styles.averageRating}>{average.toFixed(1)}</span>
        <span style={styles.starDisplay}>{renderStars(average)}</span>
        <span style={styles.reviewCount}>({count} reviews)</span>
      </div>

      {/* Review Form */}
      {showForm && (
        <form style={styles.form} onSubmit={handleSubmit}>
          <h4 style={{ marginBottom: '1rem', color: '#000000' }}>Write Your Review</h4>
          
          {error && <div style={styles.errorText}>{error}</div>}
          {success && <div style={styles.successText}>{success}</div>}

          <div style={styles.formGroup}>
            <label style={styles.label}>Rating</label>
            <div style={styles.ratingSelect}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  style={styles.starButton}
                  onClick={() => handleRatingClick(star)}
                  onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
                  onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                >
                  <FaStar 
                    style={{ 
                      color: star <= userReview.rating ? '#FFC107' : '#E5E5E5',
                      transition: 'color 0.2s ease'
                    }}
                    size={30}
                  />
                </button>
              ))}
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Title</label>
            <input
              type="text"
              placeholder="Summary of your review"
              value={userReview.title}
              onChange={(e) => setUserReview({ ...userReview, title: e.target.value })}
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Comment</label>
            <textarea
              placeholder="Share your experience with this product..."
              value={userReview.comment}
              onChange={(e) => setUserReview({ ...userReview, comment: e.target.value })}
              style={styles.textarea}
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button 
              type="submit" 
              style={styles.button}
              disabled={submitting}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#B33A3A'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#DB4444'}
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
            <button 
              type="button" 
              style={styles.buttonSecondary}
              onClick={() => {
                setShowForm(false);
                setError('');
                setSuccess('');
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#E5E5E5'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#F3F4F6'}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div style={styles.noReviews}>No reviews yet. Be the first to review!</div>
      ) : (
        <div style={styles.reviewList}>
          {reviews.map((review) => (
            <div key={review.id} style={styles.reviewItem}>
              <div style={styles.reviewHeader}>
                <span style={styles.reviewUser}>
                  <FaUser size={16} style={{ color: '#999999' }} />
                  {review.first_name || review.username || 'Anonymous'}
                </span>
                <span style={styles.reviewDate}>
                  {new Date(review.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </span>
              </div>
              <div style={styles.starDisplay}>
                {renderStars(review.rating)}
              </div>
              {review.title && (
                <div style={styles.reviewTitle}>{review.title}</div>
              )}
              <div style={styles.reviewComment}>{review.comment}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Reviews;