import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const SocialAuthCallback = ({ setIsLoggedIn }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Extract user data from URL parameters
    const params = new URLSearchParams(location.search);
    const userDataParam = params.get('userData');
    
    if (userDataParam) {
      try {
        const userData = JSON.parse(decodeURIComponent(userDataParam));
        
        // Save user data and token to localStorage
        localStorage.setItem('token', userData.token);
        delete userData.token; // Remove token from user object before storing
        
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('userId', userData.id);
        
        // Set login state
        if (setIsLoggedIn && typeof setIsLoggedIn === 'function') {
          setIsLoggedIn(true);
        }
        
        // Redirect to home page
        navigate('/');
      } catch (error) {
        console.error('Error processing social auth callback:', error);
        navigate('/login?error=auth_failed');
      }
    } else {
      // No user data found, redirect to login
      navigate('/login?error=auth_failed');
    }
  }, [location, navigate, setIsLoggedIn]);

  return (
    <div className="social-auth-callback">
      <div className="loading">
        <p>Đang xử lý đăng nhập...</p>
      </div>
    </div>
  );
};

export default SocialAuthCallback; 