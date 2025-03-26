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
const renderUserRoutes = () => {
    return (
        <MasterLayout>
            {({ isLoggedIn, setIsLoggedIn }) => (
                <Routes>
                    <Route path={ROUTES.USER.HOME} element={<Homepage />} />
                    <Route path={ROUTES.USER.PROFILE} element={<ProfilePage />} />
                    <Route path={ROUTES.USER.LOGIN} element={<LoginPage setIsLoggedIn={setIsLoggedIn} />} />
                    <Route path={ROUTES.USER.REGISTER} element={<RegisterPage />} />
                    <Route path={ROUTES.USER.OTPFORSIGNUP} element={<OtpPage />} />
                    <Route path={ROUTES.USER.FORGOTPASSWORD} element={<ForgotPage />} />
                    <Route path={ROUTES.USER.OTPFORFORGOT} element={<OtpPage2 />} />
                    <Route path={ROUTES.USER.NEWPASSWORD} element={<NewPassword />} />
                    <Route path={ROUTES.USER.PRODUCT} element={<ProductPage />} />
                    <Route path="/oauth-callback" element={<OAuthCallback setIsLoggedIn={setIsLoggedIn} />} />
                </Routes>
            )}
        </MasterLayout>
    );
}

const RouterCustom = () => {
    return renderUserRoutes();
}

export default RouterCustom;