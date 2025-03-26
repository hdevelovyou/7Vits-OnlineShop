import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const OAuthCallback = ({ setIsLoggedIn }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const userStr = params.get('user');

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        
        // Store in localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', userStr);
        
        // Update app state
        if (setIsLoggedIn && typeof setIsLoggedIn === 'function') {
          setIsLoggedIn(true);
        }
        
        // Redirect to home page
        navigate('/');
      } catch (error) {
        console.error('Error processing OAuth callback:', error);
        navigate('/login');
      }
    } else {
      navigate('/login');
    }
  }, [location, navigate, setIsLoggedIn]);

  return (
    <div className="oauth-callback-page">
      <div className="loading-container">
        <h2>Đang xử lý đăng nhập...</h2>
        <div className="loader"></div>
      </div>
    </div>
  );
};

export default OAuthCallback;