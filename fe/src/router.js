import Homepage from "./pages/user/homePage";
import LoginPage from "./pages/user/loginPage";
import ProfilePage from "./pages/user/profilePage";
import RegisterPage from "./pages/user/registerPage";
import MasterLayout from "./pages/user/theme/masterLayout";
import { ROUTES } from "./utils/router";
import { Routes, Route } from "react-router-dom";
import OtpPage from "./pages/user/otpPage";
import ForgotPage from "./pages/user/forgotPage";
import OtpPage2 from "./pages/user/otpPage2";
import NewPassword from "./pages/user/newPassword";
import ProductPage from "./pages/user/productPage";
import OAuthCallback from "./pages/user/OAuthCallback";
import GoogleAuthCompletionPage from './pages/user/googleAuthCompletionPage';
import StorePage from "./pages/user/storePage";
import CartPage from "./pages/user/cartpage";
import FacebookAuthCompletionPage from './pages/user/facebookAuthCompletionPage';
// Import new components
import SellProductPage from "./pages/user/sellProductPage/sellProductPage";
import MyProductsPage from "./pages/user/myProductPage/myProductPage";
import EditProductPage from "./pages/user/editProductPage/editProductPage";

const renderUserRoutes = () => {
    return (
        <MasterLayout>
            {({ isLoggedIn, setIsLoggedIn, cart, setCart }) => (
                <Routes>
                    <Route path={ROUTES.USER.HOME} element={<Homepage />} />
                    <Route path={ROUTES.USER.PROFILE} element={<ProfilePage />} />
                    <Route path={ROUTES.USER.LOGIN} element={<LoginPage setIsLoggedIn={setIsLoggedIn} />} />
                    <Route path={ROUTES.USER.REGISTER} element={<RegisterPage />} />
                    <Route path={ROUTES.USER.OTPFORSIGNUP} element={<OtpPage />} />
                    <Route path={ROUTES.USER.FORGOTPASSWORD} element={<ForgotPage />} />
                    <Route path={ROUTES.USER.OTPFORFORGOT} element={<OtpPage2 />} />
                    <Route path={ROUTES.USER.NEWPASSWORD} element={<NewPassword />} />
                    <Route path={ROUTES.USER.PRODUCT} element={<ProductPage cart={cart} setCart={setCart} />} />
                    <Route path="/complete-google-signup" element={<GoogleAuthCompletionPage />} />
                    <Route path="/oauth-callback" element={<OAuthCallback setIsLoggedIn={setIsLoggedIn} />} />
                    <Route path={ROUTES.USER.STORE} element={<StorePage />} />
                    <Route path={ROUTES.USER.CART} element={<CartPage cart={cart} setCart={setCart} />} />
                    <Route path={ROUTES.USER.COMPLETE_FACEBOOK_SIGNUP} element={<FacebookAuthCompletionPage />} />
                    
                    {/* New routes for selling products */}
                    <Route path={ROUTES.USER.SELL_PRODUCT} element={<SellProductPage />} />
                    <Route path={ROUTES.USER.MY_PRODUCTS} element={<MyProductsPage />} />
                    <Route path={ROUTES.USER.EDIT_PRODUCT} element={<EditProductPage />} />
                </Routes>
            )}
        </MasterLayout>
    );
}

const RouterCustom = () => {
    return renderUserRoutes();
}

export default RouterCustom;