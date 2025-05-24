import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const SocialAuthCallback = ({ setIsLoggedIn }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const processGoogleAuth = async () => {
      // Extract user data from URL parameters
      const params = new URLSearchParams(location.search);
      const userDataParam = params.get('userData');
      
      if (userDataParam) {
        try {
          const userData = JSON.parse(decodeURIComponent(userDataParam));
          
          // Save token to localStorage first
          localStorage.setItem('token', userData.token);
          
          // Now verify the token by calling /api/auth/me
          const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/me`, {
            headers: {
              'Authorization': `Bearer ${userData.token}`
            }
          });
          
          if (response.ok) {
            const verifiedUserData = await response.json();
            
            // Save verified user data to localStorage
            localStorage.setItem('user', JSON.stringify(verifiedUserData.user));
            localStorage.setItem('userId', verifiedUserData.user.id);
            
            // Set login state
            if (setIsLoggedIn && typeof setIsLoggedIn === 'function') {
              setIsLoggedIn(true);
            }
            
            // Redirect to home page
            navigate('/');
          } else {
            // Token verification failed
            console.error('Token verification failed');
            localStorage.removeItem('token');
            navigate('/login?error=auth_failed');
          }
        } catch (error) {
          console.error('Error processing social auth callback:', error);
          localStorage.removeItem('token');
          navigate('/login?error=auth_failed');
        }
      } else {
        // No user data found, redirect to login
        navigate('/login?error=auth_failed');
      }
    };

    processGoogleAuth();
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