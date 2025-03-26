export const handleFacebookLogin = (setIsLoading, setError, setIsLoggedIn, navigate) => {
    try {
        setIsLoading(true);
        setError("");
        
        // Open Facebook login in a new window
        const width = 600;
        const height = 600;
        const left = (window.innerWidth - width) / 2;
        const top = (window.innerHeight - height) / 2;
        
        const popup = window.open(
            "http://localhost:5000/api/auth/facebook", // Direct URL to backend
            'Facebook Login',
            `width=${width},height=${height},left=${left},top=${top}`
        );

        // Check if popup was blocked
        if (!popup || popup.closed || typeof popup.closed === 'undefined') {
            setError("Vui lòng cho phép popup để đăng nhập Facebook!");
        }
    } catch (err) {
        setError("Có lỗi xảy ra khi đăng nhập Facebook!");
        console.error('Facebook login error:', err);
    } finally {
        setIsLoading(false);
    }
}; 